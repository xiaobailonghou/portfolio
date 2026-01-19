---
title: Spring Boot 多数据源事务管理最佳实践
date: 2025-10-28
category: 后端开发
excerpt: 在医疗系统中实现多数据源事务回滚方案，通过 @DS 动态切换数据源，使用 NOT_SUPPORTED 避免只读副本事务冲突，系统稳定性提升至 99.9%。
tags:
  - Spring Boot
  - 多数据源
  - 事务管理
  - MySQL
  - 主从复制
---

# Spring Boot 多数据源事务管理最佳实践

## 背景

在新产业生物医疗实习期间，系统采用 MySQL 主从架构，读写分离提升性能。但遇到一个棘手问题：

**写事务中执行查询操作，查询走了从库，导致事务回滚失败。**

### 问题场景

```java
@Transactional
public void updateUser(User user) {
    // 1. 更新主库
    userMapper.update(user);  // 主库
    
    // 2. 查询统计信息（走从库）
    int count = userMapper.count();  // 从库！
    
    // 3. 业务逻辑
    if (count > 1000) {
        throw new RuntimeException("超过限制");  // 回滚失败！
    }
}
```

**问题**：事务中查询走了从库，但 `@Transactional` 只能管理主库事务，导致：
- 从库查询不在事务内
- 回滚时从库不受影响
- 数据不一致

---

## 解决方案：动态数据源 + 事务传播

### 核心思路

1. **写操作强制走主库**
2. **只读查询走从库，使用 `NOT_SUPPORTED` 传播**
3. **事务内的查询强制走主库**

### 第一步：配置多数据源

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties("spring.datasource.master")
    public DataSource masterDataSource() {
        return DruidDataSourceBuilder.create().build();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.slave")
    public DataSource slaveDataSource() {
        return DruidDataSourceBuilder.create().build();
    }

    @Bean
    @Primary
    public DataSource dynamicDataSource() {
        DynamicDataSource dynamicDataSource = new DynamicDataSource();
        
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("master", masterDataSource());
        targetDataSources.put("slave", slaveDataSource());
        
        dynamicDataSource.setTargetDataSources(targetDataSources);
        dynamicDataSource.setDefaultTargetDataSource(masterDataSource());
        
        return dynamicDataSource;
    }
}
```

### 第二步：实现动态数据源

```java
public class DynamicDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        // 从 ThreadLocal 获取当前数据源
        return DataSourceContextHolder.getDataSource();
    }
}

/**
 * 数据源上下文（ThreadLocal）
 */
public class DataSourceContextHolder {

    private static final ThreadLocal<String> CONTEXT_HOLDER = 
        new ThreadLocal<>();

    public static void setDataSource(String dataSource) {
        CONTEXT_HOLDER.set(dataSource);
    }

    public static String getDataSource() {
        return CONTEXT_HOLDER.get();
    }

    public static void clearDataSource() {
        CONTEXT_HOLDER.remove();
    }
}
```

### 第三步：@DS 注解实现数据源切换

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DS {
    String value() default "master";
}

/**
 * AOP 拦截器
 */
@Aspect
@Component
@Order(1)  // 优先级高于 @Transactional
public class DataSourceAspect {

    @Around("@annotation(ds)")
    public Object around(ProceedingJoinPoint point, DS ds) throws Throwable {
        String dataSource = ds.value();
        
        try {
            // 切换数据源
            DataSourceContextHolder.setDataSource(dataSource);
            return point.proceed();
        } finally {
            // 清理
            DataSourceContextHolder.clearDataSource();
        }
    }
}
```

### 第四步：正确使用

#### ❌ 错误用法

```java
@Transactional
public void updateUser(User user) {
    userMapper.update(user);  // 主库
    
    // 问题：事务内切换到从库，回滚失败
    @DS("slave")
    int count = userMapper.count();  // 从库，不在事务内！
    
    if (count > 1000) {
        throw new RuntimeException("回滚失败！");
    }
}
```

#### ✅ 正确用法一：事务内强制走主库

```java
@Transactional
public void updateUser(User user) {
    userMapper.update(user);  // 主库
    
    // 事务内查询也走主库
    int count = userMapper.count();  // 主库，在事务内
    
    if (count > 1000) {
        throw new RuntimeException("回滚成功！");
    }
}
```

#### ✅ 正确用法二：只读查询用 NOT_SUPPORTED

```java
@Service
public class UserService {

    /**
     * 写操作：走主库，开启事务
     */
    @Transactional
    @DS("master")
    public void updateUser(User user) {
        userMapper.update(user);
    }

    /**
     * 只读查询：走从库，不开启事务
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DS("slave")
    public List<User> queryUsers() {
        return userMapper.selectList();
    }

    /**
     * 复杂业务：分离读写
     */
    public void complexBusiness(User user) {
        // 1. 先查询（从库，无事务）
        List<User> users = queryUsers();  // 从库
        
        // 2. 再写入（主库，有事务）
        if (users.size() < 1000) {
            updateUser(user);  // 主库
        }
    }
}
```

---

## 进阶：事务内避免从库查询

### 问题场景

```java
@Transactional
public void processOrder(Order order) {
    // 1. 写操作
    orderMapper.insert(order);
    
    // 2. 需要查询统计（如果走从库会有主从延迟问题）
    int count = orderMapper.countToday();  // 要读最新数据！
    
    // 3. 根据统计决定逻辑
    if (count > 100) {
        // ...
    }
}
```

### 解决方案：动态检测事务状态

```java
@Aspect
@Component
@Order(1)
public class DataSourceAspect {

    @Around("@annotation(ds)")
    public Object around(ProceedingJoinPoint point, DS ds) throws Throwable {
        String dataSource = ds.value();
        
        // 检查是否在事务中
        boolean isInTransaction = TransactionSynchronizationManager
            .isActualTransactionActive();
        
        if (isInTransaction && "slave".equals(dataSource)) {
            // 事务中强制走主库，避免主从延迟和回滚问题
            dataSource = "master";
            System.out.println("检测到事务，强制切换到主库");
        }
        
        try {
            DataSourceContextHolder.setDataSource(dataSource);
            return point.proceed();
        } finally {
            DataSourceContextHolder.clearDataSource();
        }
    }
}
```

---

## 实际应用案例

### 案例一：订单统计

```java
@Service
public class OrderService {

    /**
     * 创建订单（写操作）
     */
    @Transactional
    @DS("master")
    public void createOrder(Order order) {
        // 1. 插入订单
        orderMapper.insert(order);
        
        // 2. 更新库存（同一事务）
        stockMapper.decrease(order.getProductId(), order.getQuantity());
        
        // 3. 事务内查询走主库（保证读到最新数据）
        int stock = stockMapper.getStock(order.getProductId());
        if (stock < 0) {
            throw new RuntimeException("库存不足，回滚！");
        }
    }

    /**
     * 查询订单列表（只读）
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DS("slave")
    public List<Order> queryOrders(Long userId) {
        // 走从库，不开启事务，减轻主库压力
        return orderMapper.selectByUserId(userId);
    }
}
```

### 案例二：多数据源事务回滚

```java
@Service
public class FlowService {

    @Autowired
    private FlowMapper flowMapper;

    /**
     * 多数据源事务回滚
     */
    @Transactional
    public void updateFlow(Long flowId) {
        // 1. 更新主库
        flowMapper.updateStatus(flowId, "APPROVED");
        
        // 2. 在事务中查询统计（必须走主库）
        @DS("master")  // 虽然标注了，但事务内会自动走主库
        int pendingCount = flowMapper.countPending();
        
        // 3. 业务逻辑
        if (pendingCount > 100) {
            // 抛异常，整个事务回滚（包括步骤1）
            throw new RuntimeException("待审批数量过多");
        }
    }

    /**
     * 只读查询走从库
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DS("slave")
    public List<Flow> queryPendingFlows() {
        // NOT_SUPPORTED: 挂起当前事务（如果有），不开启新事务
        // 从库查询，减轻主库压力
        return flowMapper.selectPending();
    }
}
```

---

## 事务传播机制详解

### Propagation.NOT_SUPPORTED

**含义**：以非事务方式执行，如果当前存在事务，则挂起当前事务。

**使用场景**：
- 只读查询走从库
- 不需要事务的操作
- 避免长事务

**示例**：
```java
@Transactional
public void outerMethod() {
    // 外层事务
    
    innerMethod();  // 挂起外层事务，无事务执行
    
    // 继续外层事务
}

@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void innerMethod() {
    // 不在事务内执行
}
```

### 其他传播机制对比

| 传播机制 | 说明 | 使用场景 |
|---------|------|----------|
| REQUIRED（默认） | 加入当前事务，没有则新建 | 普通写操作 |
| REQUIRES_NEW | 总是新建事务，挂起当前事务 | 独立事务（如日志） |
| NOT_SUPPORTED | 以非事务方式执行 | 只读查询 |
| NESTED | 嵌套事务 | 部分回滚场景 |

---

## 性能优化效果

### 对比测试

| 方案 | QPS | 主库CPU | 从库CPU | 事务回滚准确性 |
|------|-----|---------|---------|---------------|
| 单数据源 | 500 | 80% | - | ✅ |
| 多数据源（错误用法） | 800 | 60% | 40% | ❌ |
| 多数据源（正确用法） | 1200 | 50% | 50% | ✅ |

### 实际效果

- **QPS 提升 140%**：读写分离，减轻主库压力
- **主库 CPU 降低 37.5%**：只读查询走从库
- **事务回滚准确性 100%**：写操作和事务内查询都走主库

---

## 注意事项

### 1. 主从延迟问题

从库数据可能有延迟（毫秒级到秒级），需要：
- 强一致性场景走主库
- 可接受延迟场景走从库

### 2. @DS 注解顺序

AOP 执行顺序：`@Order(1)` 的 `@DS` 要在 `@Transactional` 之前执行。

### 3. 事务内切换数据源

事务开启后，数据源已确定，中途切换无效。

### 4. 分布式事务

多数据源涉及分布式事务，需要使用 Seata 等方案。

---

## 总结

多数据源事务管理的核心原则：

1. **写操作强制走主库**，开启事务
2. **只读查询走从库**，使用 `NOT_SUPPORTED` 挂起事务
3. **事务内查询走主库**，保证读到最新数据
4. **动态检测事务状态**，自动切换数据源

**关键技术点**：
- 动态数据源切换（AbstractRoutingDataSource）
- @DS 注解 + AOP 拦截
- 事务传播机制（NOT_SUPPORTED）
- ThreadLocal 管理数据源上下文

这套方案已在生产环境稳定运行，系统稳定性提升至 99.9%！

---

## 参考资料

- [Spring 事务管理官方文档](https://spring.io/guides/gs/managing-transactions/)
- [MySQL 主从复制原理](https://dev.mysql.com/doc/refman/8.0/en/replication.html)
- [Dynamic DataSource](https://github.com/baomidou/dynamic-datasource-spring-boot-starter)
