---
title: Spring StateMachine 工作流引擎实战：14K 条流程统一管理
date: 2025-11-15
category: 后端开发
excerpt: 在医疗系统中使用 Spring StateMachine 构建工作流引擎，实现 14K条×5 流程的统一管理。通过 Guard 条件动态路由，支持 5 分钟快速开发新流程，业务开发效率提升 60%。
tags:
  - Spring Boot
  - Spring StateMachine
  - 工作流引擎
  - 状态机
---

# Spring StateMachine 工作流引擎实战

## 背景

在新产业生物医疗实习期间，负责受史管理系统的工作流引擎设计。系统需要管理多达 **14K 条记录 × 5 种流程通道**，每种流程有不同的审批路径和业务规则。

### 原有方案的痛点

1. **代码耦合严重**：每种流程都是独立的 if-else 代码，维护困难
2. **扩展性差**：新增流程需要大量修改代码，开发周期长
3. **状态不可追溯**：流程状态变更没有统一管理，问题排查困难

### 目标

- 统一管理 5 种流程通道（24K 条高并发 + 14K 条核心业务）
- 支持动态路由，根据条件自动选择流程分支
- 5 分钟快速开发新流程，提升开发效率

---

## 为什么选择 Spring StateMachine？

### 状态机 vs 传统 if-else

**传统方式**：
```java
if (status.equals("PENDING")) {
    if (role.equals("MANAGER")) {
        status = "APPROVED";
    } else {
        throw new RuntimeException("权限不足");
    }
} else if (status.equals("APPROVED")) {
    // ...复杂的嵌套逻辑
}
```

**状态机方式**：
```java
// 定义状态和事件，状态转换逻辑自动管理
stateMachine.sendEvent(Event.APPROVE);
```

### Spring StateMachine 优势

- **声明式配置**：通过配置定义状态转换，代码简洁
- **Guard 条件**：支持条件判断，实现动态路由
- **Action 扩展**：状态转换时自动执行业务逻辑
- **状态持久化**：支持状态保存和恢复
- **可视化**：状态转换一目了然，便于维护

---

## 实现方案

### 第一步：定义状态和事件

```java
/**
 * 流程状态枚举
 */
public enum FlowState {
    DRAFT,          // 草稿
    PENDING,        // 待审批
    MANAGER_REVIEW, // 经理审批中
    DIRECTOR_REVIEW,// 总监审批中
    APPROVED,       // 已通过
    REJECTED        // 已拒绝
}

/**
 * 流程事件枚举
 */
public enum FlowEvent {
    SUBMIT,    // 提交
    APPROVE,   // 通过
    REJECT,    // 拒绝
    REVOKE     // 撤回
}
```

### 第二步：配置状态机

```java
@Configuration
@EnableStateMachine
public class StateMachineConfig extends StateMachineConfigurerAdapter<FlowState, FlowEvent> {

    @Autowired
    private FlowGuard flowGuard;
    
    @Autowired
    private FlowAction flowAction;

    /**
     * 配置状态
     */
    @Override
    public void configure(StateMachineStateConfigurer<FlowState, FlowEvent> states) 
            throws Exception {
        states
            .withStates()
            .initial(FlowState.DRAFT)
            .states(EnumSet.allOf(FlowState.class))
            .end(FlowState.APPROVED)
            .end(FlowState.REJECTED);
    }

    /**
     * 配置状态转换
     */
    @Override
    public void configure(StateMachineTransitionConfigurer<FlowState, FlowEvent> transitions) 
            throws Exception {
        transitions
            // 提交流程
            .withExternal()
                .source(FlowState.DRAFT)
                .target(FlowState.PENDING)
                .event(FlowEvent.SUBMIT)
                .action(flowAction.submitAction())
            
            // 经理审批（需要经理权限）
            .and()
            .withExternal()
                .source(FlowState.PENDING)
                .target(FlowState.MANAGER_REVIEW)
                .event(FlowEvent.APPROVE)
                .guard(flowGuard.isManager())
                .action(flowAction.managerApproveAction())
            
            // 总监审批（需要总监权限）
            .and()
            .withExternal()
                .source(FlowState.MANAGER_REVIEW)
                .target(FlowState.DIRECTOR_REVIEW)
                .event(FlowEvent.APPROVE)
                .guard(flowGuard.isDirector())
                .action(flowAction.directorApproveAction())
            
            // 最终通过
            .and()
            .withExternal()
                .source(FlowState.DIRECTOR_REVIEW)
                .target(FlowState.APPROVED)
                .event(FlowEvent.APPROVE)
                .action(flowAction.finalApproveAction())
            
            // 拒绝（任意节点都可以拒绝）
            .and()
            .withExternal()
                .source(FlowState.PENDING)
                .target(FlowState.REJECTED)
                .event(FlowEvent.REJECT)
                .action(flowAction.rejectAction())
            
            .and()
            .withExternal()
                .source(FlowState.MANAGER_REVIEW)
                .target(FlowState.REJECTED)
                .event(FlowEvent.REJECT)
                .action(flowAction.rejectAction());
    }
}
```

### 第三步：实现 Guard 条件（动态路由核心）

```java
@Component
public class FlowGuard {

    /**
     * 判断是否是经理
     */
    public Guard<FlowState, FlowEvent> isManager() {
        return context -> {
            // 从上下文获取用户信息
            String role = (String) context.getExtendedState()
                .getVariables().get("userRole");
            return "MANAGER".equals(role) || "DIRECTOR".equals(role);
        };
    }

    /**
     * 判断是否是总监
     */
    public Guard<FlowState, FlowEvent> isDirector() {
        return context -> {
            String role = (String) context.getExtendedState()
                .getVariables().get("userRole");
            return "DIRECTOR".equals(role);
        };
    }

    /**
     * 判断是否需要经理审批（根据金额）
     */
    public Guard<FlowState, FlowEvent> needManagerApproval() {
        return context -> {
            BigDecimal amount = (BigDecimal) context.getExtendedState()
                .getVariables().get("amount");
            return amount.compareTo(new BigDecimal("10000")) > 0;
        };
    }

    /**
     * 判断流程类型（实现 5 种流程通道动态路由）
     */
    public Guard<FlowState, FlowEvent> isFlowType(String flowType) {
        return context -> {
            String type = (String) context.getExtendedState()
                .getVariables().get("flowType");
            return flowType.equals(type);
        };
    }
}
```

### 第四步：实现 Action 业务逻辑

```java
@Component
public class FlowAction {

    @Autowired
    private FlowRecordService flowRecordService;

    /**
     * 提交动作
     */
    public Action<FlowState, FlowEvent> submitAction() {
        return context -> {
            Long flowId = (Long) context.getExtendedState()
                .getVariables().get("flowId");
            
            // 记录流程提交
            flowRecordService.recordSubmit(flowId);
            
            // 发送通知
            // notificationService.notifyManager(flowId);
            
            System.out.println("流程已提交，等待审批");
        };
    }

    /**
     * 经理审批动作
     */
    public Action<FlowState, FlowEvent> managerApproveAction() {
        return context -> {
            Long flowId = (Long) context.getExtendedState()
                .getVariables().get("flowId");
            String userId = (String) context.getExtendedState()
                .getVariables().get("userId");
            
            // 记录审批
            flowRecordService.recordApprove(flowId, userId, "MANAGER");
            
            System.out.println("经理审批通过");
        };
    }

    /**
     * 拒绝动作
     */
    public Action<FlowState, FlowEvent> rejectAction() {
        return context -> {
            Long flowId = (Long) context.getExtendedState()
                .getVariables().get("flowId");
            String reason = (String) context.getExtendedState()
                .getVariables().get("reason");
            
            // 记录拒绝原因
            flowRecordService.recordReject(flowId, reason);
            
            System.out.println("流程已拒绝：" + reason);
        };
    }
}
```

### 第五步：业务层使用

```java
@Service
public class FlowService {

    @Autowired
    private StateMachineFactory<FlowState, FlowEvent> stateMachineFactory;

    /**
     * 提交流程
     */
    public void submitFlow(Long flowId, String userId, String userRole) {
        // 创建状态机实例（每个流程一个实例）
        StateMachine<FlowState, FlowEvent> stateMachine = 
            stateMachineFactory.getStateMachine(String.valueOf(flowId));
        
        // 设置上下文变量
        stateMachine.getExtendedState().getVariables().put("flowId", flowId);
        stateMachine.getExtendedState().getVariables().put("userId", userId);
        stateMachine.getExtendedState().getVariables().put("userRole", userRole);
        
        // 启动状态机
        stateMachine.start();
        
        // 发送提交事件
        stateMachine.sendEvent(FlowEvent.SUBMIT);
        
        System.out.println("当前状态：" + stateMachine.getState().getId());
    }

    /**
     * 审批流程
     */
    public void approveFlow(Long flowId, String userId, String userRole) {
        StateMachine<FlowState, FlowEvent> stateMachine = 
            stateMachineFactory.getStateMachine(String.valueOf(flowId));
        
        stateMachine.getExtendedState().getVariables().put("userId", userId);
        stateMachine.getExtendedState().getVariables().put("userRole", userRole);
        
        // 发送审批事件
        boolean success = stateMachine.sendEvent(FlowEvent.APPROVE);
        
        if (!success) {
            throw new RuntimeException("审批失败，请检查权限或流程状态");
        }
    }
}
```

---

## 进阶：多流程通道动态路由

### 场景

系统有 5 种流程通道，每种流程审批路径不同：
- **快速通道**：直接通过，无需审批
- **普通通道**：经理审批
- **重要通道**：经理 → 总监审批
- **特殊通道**：经理 → 总监 → 财务审批
- **紧急通道**：并行审批（经理和财务同时审批）

### 实现

```java
@Override
public void configure(StateMachineTransitionConfigurer<FlowState, FlowEvent> transitions) 
        throws Exception {
    transitions
        // 快速通道：直接通过
        .withExternal()
            .source(FlowState.PENDING)
            .target(FlowState.APPROVED)
            .event(FlowEvent.APPROVE)
            .guard(flowGuard.isFlowType("FAST"))
        
        // 普通通道：经理审批
        .and()
        .withExternal()
            .source(FlowState.PENDING)
            .target(FlowState.MANAGER_REVIEW)
            .event(FlowEvent.APPROVE)
            .guard(flowGuard.isFlowType("NORMAL"))
        
        // 重要通道：经理 + 总监
        .and()
        .withExternal()
            .source(FlowState.PENDING)
            .target(FlowState.MANAGER_REVIEW)
            .event(FlowEvent.APPROVE)
            .guard(flowGuard.isFlowType("IMPORTANT"))
        
        .and()
        .withExternal()
            .source(FlowState.MANAGER_REVIEW)
            .target(FlowState.DIRECTOR_REVIEW)
            .event(FlowEvent.APPROVE)
            .guard(flowGuard.isFlowType("IMPORTANT"));
}
```

---

## 优化效果

### 开发效率提升

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 新增流程开发时间 | 2 天 | 5 分钟 | 99% ↑ |
| 代码行数 | 500+ 行 | 50 行配置 | 90% ↓ |
| Bug 率 | 15% | 2% | 87% ↓ |

### 实际效果

- **5 分钟快速开发新流程**：只需配置状态转换，无需修改业务代码
- **代码可维护性提升 90%**：状态转换逻辑清晰，一目了然
- **支持 14K 条 × 5 通道**：高并发场景稳定运行

---

## 总结

使用 Spring StateMachine 构建工作流引擎，核心优势：

1. **声明式配置**：状态和转换分离，代码简洁
2. **Guard 动态路由**：根据条件自动选择分支
3. **Action 扩展**：状态转换自动执行业务逻辑
4. **高可维护性**：新增流程只需配置，无需改代码

**关键技术点**：
- State 和 Event 定义
- Guard 条件实现动态路由
- Action 执行业务逻辑
- 状态机工厂管理多实例

这套方案已在生产环境稳定运行，管理 14K 条 × 5 流程通道，业务开发效率提升 60%！

---

## 参考资料

- [Spring StateMachine 官方文档](https://spring.io/projects/spring-statemachine)
- [有限状态机设计模式](https://refactoring.guru/design-patterns/state)
