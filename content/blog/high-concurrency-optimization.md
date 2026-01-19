---
title: 高并发场景下的 Spring Boot 性能优化实战
date: 2025-12-05
category: 后端开发
excerpt: 在医疗系统中处理 24K 条并发请求，通过线程池、多级缓存、读写分离等优化手段，将系统 QPS 从 500 提升到 2000+，响应时间从 500ms 降低到 80ms。
tags:
  - Spring Boot
  - 高并发
  - 性能优化
  - Redis
  - 线程池
---

# 高并发场景下的 Spring Boot 性能优化实战

## 背景

在新产业生物医疗实习期间，受史管理系统需要处理 **24K 条高并发请求 + 14K 条核心业务流程**。初版系统在压测中暴露出严重的性能问题：

- **响应时间长**：接口平均响应 500ms+
- **QPS 低**：单机只能支持 500 QPS
- **资源消耗高**：CPU 90%+，频繁 Full GC

**优化目标**：
- 响应时间 < 100ms
- QPS > 2000
- CPU < 60%

---

## 性能瓶颈分析

### 工具：Arthas + JProfiler

使用 Arthas 追踪方法调用链路：

```bash
# 追踪接口调用
trace com.example.FlowController getFlowList

# 监控方法耗时
monitor -c 5 com.example.FlowService queryFlow
```

**发现问题**：
1. **数据库查询慢**：单次查询 300ms+
2. **N+1 查询问题**：循环查询导致数据库压力大
3. **无缓存**：相同数据重复查询
4. **线程池配置不合理**：默认配置无法应对高并发

---

## 优化方案

### 优化一：数据库查询优化

#### 问题：慢查询

原 SQL：
```sql
SELECT * FROM flow 
WHERE status = 1 
ORDER BY create_time DESC 
LIMIT 20;
```

**问题**：
- `SELECT *` 返回不必要字段
- 没有使用索引
- 排序字段没有索引

**优化**：

1. 添加联合索引
```sql
ALTER TABLE flow 
ADD INDEX idx_status_time (status, create_time);
```

2. 只查询必要字段
```java
@Select("SELECT id, name, status, create_time FROM flow " +
        "WHERE status = #{status} ORDER BY create_time DESC LIMIT #{limit}")
List<FlowVO> selectFlowList(@Param("status") Integer status, @Param("limit") Integer limit);
```

**效果**：查询时间从 300ms 降低到 50ms

---

#### 问题：N+1 查询

原代码：
```java
List<Flow> flows = flowMapper.selectList();
for (Flow flow : flows) {
    User user = userMapper.selectById(flow.getUserId());  // N 次查询！
    flow.setUser(user);
}
```

**优化**：批量查询

```java
// 1. 查询流程列表
List<Flow> flows = flowMapper.selectList();

// 2. 提取用户 ID
List<Long> userIds = flows.stream()
    .map(Flow::getUserId)
    .distinct()
    .collect(Collectors.toList());

// 3. 批量查询用户（1 次查询）
List<User> users = userMapper.selectByIds(userIds);

// 4. 构建 Map
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, u -> u));

// 5. 填充数据
flows.forEach(flow -> 
    flow.setUser(userMap.get(flow.getUserId()))
);
```

**效果**：从执行 N+1 次查询变成 2 次，时间从 200ms 降低到 20ms

---

### 优化二：多级缓存

#### L1：本地缓存（Caffeine）

```java
@Configuration
public class CacheConfig {

    @Bean
    public Cache<String, Object> localCache() {
        return Caffeine.newBuilder()
            .maximumSize(10000)                    // 最大 10000 条
            .expireAfterWrite(5, TimeUnit.MINUTES) // 5 分钟过期
            .recordStats()                          // 统计命中率
            .build();
    }
}

@Service
public class FlowService {

    @Autowired
    private Cache<String, Object> localCache;

    public FlowVO getFlow(Long id) {
        String cacheKey = "flow:" + id;
        
        // 先查本地缓存
        FlowVO flow = (FlowVO) localCache.getIfPresent(cacheKey);
        if (flow != null) {
            return flow;
        }
        
        // 查询数据库
        flow = flowMapper.selectById(id);
        
        // 存入本地缓存
        localCache.put(cacheKey, flow);
        
        return flow;
    }
}
```

#### L2：分布式缓存（Redis）

```java
@Service
public class FlowService {

    @Autowired
    private Cache<String, Object> localCache;
    
    @Autowired
    private RedisTemplate<String, FlowVO> redisTemplate;

    public FlowVO getFlow(Long id) {
        String cacheKey = "flow:" + id;
        
        // L1：本地缓存
        FlowVO flow = (FlowVO) localCache.getIfPresent(cacheKey);
        if (flow != null) {
            return flow;
        }
        
        // L2：Redis 缓存
        flow = redisTemplate.opsForValue().get(cacheKey);
        if (flow != null) {
            localCache.put(cacheKey, flow);  // 回填 L1
            return flow;
        }
        
        // L3：数据库
        flow = flowMapper.selectById(id);
        
        // 存入 Redis（30 分钟）
        redisTemplate.opsForValue().set(cacheKey, flow, 30, TimeUnit.MINUTES);
        
        // 存入本地缓存
        localCache.put(cacheKey, flow);
        
        return flow;
    }
}
```

**效果**：
- L1 命中率 70%，响应时间 1ms
- L2 命中率 25%，响应时间 10ms
- L3 命中率 5%，响应时间 50ms
- 整体响应时间从 50ms 降低到 10ms

---

### 优化三：线程池优化

#### 问题：默认线程池配置

Spring Boot 默认：
- `corePoolSize`: 10
- `maxPoolSize`: 200
- `queueCapacity`: Integer.MAX_VALUE（无界队列！）

**问题**：
- 高并发时队列堆积，内存溢出
- 核心线程数太少，资源利用率低

#### 优化：自定义线程池

```java
@Configuration
public class ThreadPoolConfig {

    @Bean("taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 核心线程数 = CPU 核心数 * 2
        int corePoolSize = Runtime.getRuntime().availableProcessors() * 2;
        executor.setCorePoolSize(corePoolSize);
        
        // 最大线程数 = CPU 核心数 * 4
        executor.setMaxPoolSize(corePoolSize * 2);
        
        // 队列容量：有界队列，防止内存溢出
        executor.setQueueCapacity(1000);
        
        // 线程空闲时间
        executor.setKeepAliveSeconds(60);
        
        // 线程名前缀
        executor.setThreadNamePrefix("async-task-");
        
        // 拒绝策略：调用者运行
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        
        executor.initialize();
        return executor;
    }
}
```

#### 异步处理

```java
@Service
public class FlowService {

    @Autowired
    @Qualifier("taskExecutor")
    private ThreadPoolTaskExecutor taskExecutor;

    /**
     * 异步发送通知（不阻塞主流程）
     */
    @Async("taskExecutor")
    public void sendNotification(Long flowId) {
        // 耗时操作：发送短信、邮件等
        notificationService.send(flowId);
    }

    /**
     * 批量处理
     */
    public void batchProcess(List<Long> flowIds) {
        // 分批提交到线程池
        List<CompletableFuture<Void>> futures = flowIds.stream()
            .map(id -> CompletableFuture.runAsync(() -> {
                processFlow(id);
            }, taskExecutor))
            .collect(Collectors.toList());
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .join();
    }
}
```

**效果**：
- 线程利用率从 30% 提升到 80%
- QPS 从 500 提升到 1500

---

### 优化四：读写分离

使用 MySQL 主从复制 + 动态数据源：

```java
@Service
public class FlowService {

    /**
     * 写操作：主库
     */
    @Transactional
    @DS("master")
    public void createFlow(Flow flow) {
        flowMapper.insert(flow);
    }

    /**
     * 读操作：从库
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DS("slave")
    public List<Flow> queryFlows() {
        return flowMapper.selectList();
    }
}
```

**效果**：
- 主库 CPU 从 80% 降低到 50%
- QPS 从 1500 提升到 2500

---

### 优化五：批量操作

#### 问题：循环插入

```java
// 慢！
for (Flow flow : flows) {
    flowMapper.insert(flow);  // 每次一条 SQL
}
```

#### 优化：批量插入

```java
// 快！
flowMapper.batchInsert(flows);  // 一条 SQL 插入多条

// MyBatis XML
<insert id="batchInsert">
    INSERT INTO flow (name, status, create_time) VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.name}, #{item.status}, #{item.createTime})
    </foreach>
</insert>
```

**效果**：1000 条数据插入时间从 5s 降低到 0.5s

---

### 优化六：SQL 执行计划优化

```sql
-- 分析 SQL 执行计划
EXPLAIN SELECT * FROM flow 
WHERE status = 1 
ORDER BY create_time DESC 
LIMIT 20;
```

**关键指标**：
- `type`: ALL（全表扫描）→ ref（索引扫描）
- `rows`: 减少扫描行数
- `Extra`: Using filesort（文件排序）→ Using index（索引排序）

---

## 性能优化总结

### 最终效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| QPS | 500 | 2500 | 400% ↑ |
| 响应时间 | 500ms | 80ms | 84% ↓ |
| CPU 使用率 | 90% | 50% | 44% ↓ |
| 缓存命中率 | 0% | 95% | - |

### 优化手段汇总

| 层级 | 优化手段 | 效果 |
|------|----------|------|
| **数据库** | 添加索引 | 查询 50ms |
| **数据库** | 批量查询（避免 N+1） | 20ms |
| **缓存** | 多级缓存（Caffeine + Redis） | 10ms |
| **线程** | 自定义线程池 | QPS +200% |
| **架构** | 读写分离 | QPS +66% |
| **批量** | 批量插入 | 10倍 ↑ |

---

## 性能优化最佳实践

### 1. 优化优先级

```
数据库优化 > 缓存 > 代码优化 > 硬件升级
```

### 2. 监控先行

- **APM 工具**：Skywalking, Pinpoint
- **数据库监控**：慢查询日志
- **JVM 监控**：GC 日志、堆内存

### 3. 压测验证

```bash
# 使用 JMeter 或 wrk 压测
wrk -t 10 -c 1000 -d 30s http://localhost:8080/api/flow/list
```

### 4. 避免过度优化

- 不要优化不存在的性能问题
- 优化要基于数据和监控

---

## 总结

高并发性能优化的核心方法：

1. **数据库优化**：索引、批量查询、读写分离
2. **缓存**：多级缓存（本地 + Redis）
3. **线程池**：合理配置，异步处理
4. **批量操作**：减少 SQL 执行次数
5. **监控**：持续监控，及时发现问题

**关键技术点**：
- Caffeine 本地缓存
- Redis 分布式缓存
- ThreadPoolTaskExecutor 线程池
- MyBatis 批量操作
- MySQL 主从复制

这套优化方案已在生产环境稳定运行，支持 24K 并发 + 14K 核心业务，QPS 提升 400%！

---

## 参考资料

- [Spring Boot 性能优化官方文档](https://spring.io/guides/gs/actuator-service/)
- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [高性能 MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781449332471/)
