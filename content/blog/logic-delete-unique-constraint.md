---
title: 逻辑删除与唯一约束冲突的正确解决方案
date: 2026-01-10
category: 数据库设计
excerpt: 在设计变更管理系统中，解决逻辑删除与唯一约束冲突问题。通过「业务字段+deleted_at」的唯一键设计，支持历史版本审计和"删除-重建"循环，并封装LogicDeleteHelper规避MyBatis-Plus的父类字段解析与自动填充陷阱。
tags:
  - MySQL
  - 逻辑删除
  - 唯一约束
  - MyBatis-Plus
  - 数据库设计
---

# 逻辑删除与唯一约束冲突的正确解决方案

> **场景**: 生化设计变更管理系统  
> **问题**: 逻辑删除 + 唯一约束 → 历史记录冲突  
> **方案**: 「业务字段 + deleted_at」唯一键 + LogicDeleteHelper 封装

## 🚨 问题背景

### 业务需求

在企业级系统中，常见的矛盾场景：

1. **审计合规要求**：不能物理删除，必须保留历史记录
2. **业务唯一性要求**：某些字段（如code、name）必须全局唯一
3. **重复操作场景**：用户可能「创建 → 删除 → 重建 → 再删除」同一业务对象

### 问题演进

#### 尝试1：简单的逻辑删除 ❌

```sql
-- 表结构
CREATE TABLE design_change (
  id BIGINT PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(100),
  del_flag TINYINT DEFAULT 0,  -- 0:正常 1:删除
  UNIQUE KEY uk_code (code)     -- 问题：无法重建同名记录
);
```

**问题**：删除后无法重建同code的记录（唯一键冲突）。

#### 尝试2：唯一键加入 del_flag ❌❌

```sql
UNIQUE KEY uk_code_flag (code, del_flag)
```

**更大的问题**：
- 同一code多次删除，历史记录之间的`del_flag`都是1 → 互相冲突！
- 例如：
  ```
  id=1, code='DC001', del_flag=1, deleted_at='2025-01-01'
  id=2, code='DC001', del_flag=1, deleted_at='2025-02-01'
  ↑ 唯一键冲突！
  ```

---

## 🔧 最终解决方案

### 唯一键设计：「业务字段 + deleted_at」

```sql
CREATE TABLE design_change (
  id BIGINT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  del_flag TINYINT DEFAULT 0,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 核心：唯一键包含 deleted_at
  UNIQUE KEY uk_code_deleted (code, deleted_at)
);
```

### 设计原理

| 状态 | deleted_at | 唯一键行为 |
|-----|-----------|----------|
| **在线记录** | `NULL` | 业务字段唯一（NULL与NULL不等，只有一条在线记录） |
| **历史记录** | 具体时间戳 | 每次删除写入不同时间，历史记录互不冲突 |

### 完整生命周期示例

```sql
-- 1. 创建记录
INSERT INTO design_change (code, name, del_flag, deleted_at)
VALUES ('DC001', 'V1', 0, NULL);
-- uk_code_deleted = ('DC001', NULL) ✅

-- 2. 逻辑删除
UPDATE design_change 
SET del_flag = 1, deleted_at = '2025-01-15 10:00:00'
WHERE code = 'DC001' AND deleted_at IS NULL;
-- uk_code_deleted = ('DC001', '2025-01-15 10:00:00') ✅

-- 3. 重建同名记录
INSERT INTO design_change (code, name, del_flag, deleted_at)
VALUES ('DC001', 'V2', 0, NULL);
-- uk_code_deleted = ('DC001', NULL) ✅ 不冲突！

-- 4. 再次删除
UPDATE design_change 
SET del_flag = 1, deleted_at = '2025-02-20 15:30:00'
WHERE code = 'DC001' AND deleted_at IS NULL;
-- uk_code_deleted = ('DC001', '2025-02-20 15:30:00') ✅ 不冲突！

-- 5. 查询历史版本
SELECT * FROM design_change WHERE code = 'DC001';
-- 结果：
-- id | code   | name | del_flag | deleted_at
-- 1  | DC001  | V1   | 1        | 2025-01-15 10:00:00
-- 2  | DC001  | V2   | 1        | 2025-02-20 15:30:00
```

### 核心优势

✅ **支持循环操作**：「创建 → 删除 → 重建」无限次  
✅ **保留完整历史**：满足审计合规要求  
✅ **数据库层保证唯一性**：无需应用层兜底  
✅ **时间维度天然有序**：历史记录自带时间线

---

## 💡 LogicDeleteHelper 封装

### 为什么需要 Helper？

在实际使用中发现 MyBatis-Plus 的三个坑：

#### 问题1：父类字段 Lambda 解析失败

```java
// ❌ 父类字段在 BaseEntity 中，Lambda 解析不稳定
lambdaUpdateWrapper.set(BaseEntity::getDelFlag, 1);
lambdaUpdateWrapper.set(BaseEntity::getDeletedAt, LocalDateTime.now());

// 报错或行为异常（MP 内部字段缓存问题）
```

#### 问题2：自动填充失效

```java
// ❌ update(null, wrapper) 不会触发自动填充
baseMapper.update(null, lambdaUpdateWrapper);
// deleted_at 字段的 @TableField(fill = FieldFill.UPDATE) 不生效
```

#### 问题3：代码分散，容易遗漏字段

逻辑删除需要同时设置 `del_flag` 和 `deleted_at`，手动写容易漏。

### Helper 设计

```java
@Component
public class LogicDeleteHelper {
    
    /**
     * 统一设置逻辑删除字段
     * 
     * @param wrapper 更新条件包装器
     */
    public static <T> void setLogicDeleteFields(LambdaUpdateWrapper<T> wrapper) {
        // 使用 setSql 直接写字段名，规避 Lambda 父类字段解析问题
        wrapper.setSql("del_flag = 1")
               .setSql("deleted_at = NOW()");
    }
    
    /**
     * 逻辑删除（按ID）
     */
    public <T> boolean logicDeleteById(BaseMapper<T> mapper, 
                                       LambdaUpdateWrapper<T> wrapper, 
                                       Long id) {
        wrapper.eq(/* Lambda 表达式获取 id 字段 */, id)
               .isNull(/* deleted_at 字段 */);  // 只删除在线记录
        
        setLogicDeleteFields(wrapper);
        
        return mapper.update(null, wrapper) > 0;
    }
    
    /**
     * 批量逻辑删除
     */
    public <T> boolean logicDeleteByIds(BaseMapper<T> mapper,
                                        LambdaUpdateWrapper<T> wrapper,
                                        Collection<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return false;
        }
        
        wrapper.in(/* id 字段 */, ids)
               .isNull(/* deleted_at 字段 */);
        
        setLogicDeleteFields(wrapper);
        
        return mapper.update(null, wrapper) > 0;
    }
}
```

### 使用方式

```java
@Service
public class DesignChangeService {
    
    @Autowired
    private DesignChangeMapper mapper;
    
    /**
     * 逻辑删除设计变更
     */
    public boolean deleteDesignChange(Long id) {
        LambdaUpdateWrapper<DesignChange> wrapper = new LambdaUpdateWrapper<>();
        
        // ✅ Where 条件用 Lambda（类型安全）
        wrapper.eq(DesignChange::getId, id)
               .isNull(DesignChange::getDeletedAt);  // 确保只删除在线记录
        
        // ✅ 逻辑删除字段由 Helper 统一设置
        LogicDeleteHelper.setLogicDeleteFields(wrapper);
        
        return mapper.update(null, wrapper) > 0;
    }
    
    /**
     * 查询在线记录
     */
    public List<DesignChange> listActive() {
        LambdaQueryWrapper<DesignChange> wrapper = new LambdaQueryWrapper<>();
        wrapper.isNull(DesignChange::getDeletedAt)  // 核心条件
               .orderByDesc(DesignChange::getCreatedAt);
        
        return mapper.selectList(wrapper);
    }
}
```

---

## 🔬 MyBatis-Plus 行为深度解析

### update(entity, wrapper) vs update(null, wrapper)

```java
// 方式1：update(entity, wrapper)
DesignChange entity = new DesignChange();
entity.setName("新名称");
// ❌ entity.setId(1L);  // 注意：id 不会自动变成 WHERE 条件！

LambdaUpdateWrapper<DesignChange> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(DesignChange::getId, 1L);  // ✅ WHERE 条件必须写在 wrapper

mapper.update(entity, wrapper);
// SQL: UPDATE design_change SET name = '新名称', updated_at = NOW() WHERE id = 1
// ✅ 触发自动填充（updated_at）

// 方式2：update(null, wrapper)
LambdaUpdateWrapper<DesignChange> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(DesignChange::getId, 1L)
       .set(DesignChange::getName, "新名称");

mapper.update(null, wrapper);
// SQL: UPDATE design_change SET name = '新名称' WHERE id = 1
// ❌ 不触发自动填充
```

### 关键结论

| 方法 | entity 作用 | wrapper 作用 | 自动填充 |
|-----|-----------|------------|---------|
| `update(entity, wrapper)` | **SET 字段** | **WHERE 条件** + 额外 SET | ✅ 触发 |
| `update(null, wrapper)` | 无 | **WHERE 条件** + **SET 字段** | ❌ 不触发 |

**注意**：entity.setId() **不会自动变成 WHERE 条件**，必须在 wrapper 中显式指定！

### Lambda 表达式的最佳实践

```java
// ✅ 推荐：WHERE 条件用 Lambda（子类字段）
wrapper.eq(DesignChange::getId, 1L)
       .eq(DesignChange::getCode, "DC001");

// ⚠️ 不推荐：父类字段用 Lambda 做 SET（可能失败）
wrapper.set(BaseEntity::getDelFlag, 1);

// ✅ 推荐：父类字段用 setSql
wrapper.setSql("del_flag = 1")
       .setSql("deleted_at = NOW()");
```

---

## 📊 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|-----|------|-----|---------|
| **物理删除** | 简单直接，无历史数据干扰 | 无法审计，误删无法恢复 | 非核心数据 |
| **del_flag 唯一键** | 看似能区分 | 历史记录互相冲突 | ❌ 不推荐 |
| **业务字段 + deleted_at** | 支持循环操作，保留历史 | 需要封装逻辑删除逻辑 | ✅ **推荐** |
| **在线表 + 历史表** | 查询性能最优 | 维护成本高，数据同步复杂 | 超大规模数据 |

---

## 🎯 核心收获

### 设计思路

1. **时间维度是最好的版本区分器**
   - `deleted_at` 天然有序、唯一、可读
   - 比 `del_flag` 这种布尔值强得多

2. **唯一约束的本质是业务语义**
   - 在线数据：业务字段必须唯一
   - 历史数据：允许重复，但需要版本区分

3. **封装统一入口**
   - 逻辑删除不是单个字段，是一组字段的协同
   - Helper 保证行为一致性

### 技术细节

1. **MySQL NULL 的特殊性**
   - `NULL != NULL`（在唯一键中）
   - 利用这个特性，多个在线记录的 `deleted_at = NULL` 会冲突
   - 但实际上我们只会有一条在线记录

2. **MyBatis-Plus 的陷阱**
   - 父类字段 Lambda 解析不稳定 → 用 `setSql`
   - `update(null, wrapper)` 不触发自动填充 → 显式设置

3. **代码规范**
   - WHERE 条件：用 Lambda（类型安全、重构友好）
   - SET 父类字段：用 `setSql`（规避解析问题）
   - 逻辑删除：统一用 Helper（避免遗漏）

---

## 💬 面试要点

**问：为什么不用 del_flag 参与唯一键？**

答：同一业务键多次删除，历史记录的 `del_flag` 都是 1，会互相冲突。用 `deleted_at` 时间戳可以天然区分不同版本。

**问：为什么不分表（在线表 + 历史表）？**

答：当前数据规模下，单表 + 唯一键方案已经能满足需求，改动成本低。如果未来数据量级达到千万级，可以考虑分表。

**问：LogicDeleteHelper 解决了什么问题？**

答：三个核心问题——①统一逻辑删除语义（多字段协同）；②规避 MP 父类字段 Lambda 解析问题；③脱离自动填充的不确定性。

**问：如果重来一次会怎么优化？**

答：当前方案已经比较成熟。如果数据规模更大，可以考虑：①部分索引（`WHERE deleted_at IS NULL`）；②冷热数据分离；③CDC 同步历史表。

---

## 📚 总结

这是一个典型的"数据库设计 + ORM 框架"结合的实战案例：

✅ **数据库设计**：「业务字段 + deleted_at」唯一键巧妙解决逻辑删除冲突  
✅ **工程封装**：LogicDeleteHelper 统一逻辑删除行为  
✅ **问题排查**：深入理解 MyBatis-Plus 的 entity/wrapper 职责和父类字段陷阱  
✅ **代码规范**：Lambda 条件 + setSql 更新的组合拳

**技术栈**：Spring Boot + MyBatis-Plus + MySQL

**关键技术点**：
- 逻辑删除与唯一约束冲突分析
- MySQL NULL 在唯一键中的特殊行为
- MyBatis-Plus update 机制深度解析
- Lambda 表达式父类字段解析陷阱
- 自动填充触发条件
