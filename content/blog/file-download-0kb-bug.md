---
title: 文件下载后变成0KB问题完整分析与修复
date: 2025-12-30
category: Bug修复
excerpt: 深入分析 Fastjson 序列化 FileSystemResource 导致文件被清空的底层原因，从 Java I/O 到 POSIX 标准，完整剖析这个破坏性 Bug 的修复方案。
tags:
  - Bug修复
  - 文件I/O
  - Fastjson
  - Spring
  - Java
---

# 文件下载后变成0KB问题完整分析与修复

> **问题严重性**: 🔴 高危 - 导致服务器文件被清空且不可恢复

## 🚨 问题现象

### 用户反馈

在实习期间遇到一个诡异的 Bug：

- **现象1**: 用户上传文件（如12KB的.md文件）到服务器，上传成功
- **现象2**: 点击下载按钮，下载的文件变成0KB
- **现象3**: 检查服务器上的实际文件，发现也变成了0KB

### 问题时间线

```
1. 文件上传 → 服务器保存成功（12KB）✅
2. 用户点击下载
3. 服务器处理下载请求
4. 服务器文件被清空（0KB）❌
5. 浏览器收到空文件（0KB）❌
```

### 关键特征

- ⚠️ **触发时机**: 只有在点击下载时才会发生
- ⚠️ **破坏性**: 不仅下载的是空文件，服务器源文件也被破坏
- ⚠️ **不可逆**: 文件一旦被清空，无法恢复

---

## 🔍 问题根源

### 完整Bug链路

```
用户点击下载
    ↓
FileController.downloadFile()
    ↓
返回 ResponseEntity<Resource>
    ↓
OperLogAspect 拦截（@OperLog注解）
    ↓
JSON.toJSONString(responseEntity)  ← 记录操作日志
    ↓
Fastjson 序列化 FileSystemResource
    ↓
调用所有 getter 方法获取属性
    ↓
resource.getOutputStream()  ← 元凶！
    ↓
new FileOutputStream(file)  ← 文件被清空
    ↓
文件变成 0KB
    ↓
浏览器收到空文件
```

### 核心原因

**Fastjson 在序列化对象时，会调用所有 getter 方法来获取属性值。**

当序列化 `FileSystemResource` 时：

```java
// Fastjson 内部流程
1. computeGetters()  // 获取所有 getter 方法
2. 依次调用每个 getter：
   - getFile() ✅
   - getPath() ✅
   - isWritable() ✅
   - getOutputStream() ❌ ← 这里！
```

Spring `FileSystemResource.getOutputStream()` 的实现：

```java
@Override
public OutputStream getOutputStream() throws IOException {
    // 直接创建 FileOutputStream，会立即截断文件！
    return new FileOutputStream(this.file);
}
```

---

## 🔬 底层原理

### FileOutputStream 的截断行为

#### Java API 设计

```java
// 两种构造方式
new FileOutputStream(file)        // 默认：截断模式（清空文件）
new FileOutputStream(file, true)  // append=true：追加模式（保留内容）
```

#### 底层实现（POSIX标准）

```java
// FileOutputStream 源码
public FileOutputStream(File file, boolean append) {
    if (append) {
        fd = open(name, O_WRONLY | O_APPEND);  // 追加模式
    } else {
        fd = open(name, O_WRONLY | O_CREAT | O_TRUNC);  // 截断模式
        //                                      ^^^^^^
        //                                      这个标志导致文件被清空！
    }
}
```

#### 操作系统层面的文件打开模式

| 模式 | Java | C语言 | Linux | 行为 |
|------|------|-------|-------|------|
| 截断写入 | `FileOutputStream(file)` | `fopen(file, "w")` | `O_WRONLY \| O_TRUNC` | 文件被清空 |
| 追加写入 | `FileOutputStream(file, true)` | `fopen(file, "a")` | `O_WRONLY \| O_APPEND` | 内容保留 |
| 只读 | `FileInputStream(file)` | `fopen(file, "r")` | `O_RDONLY` | 只读取 |
| 读写 | `RandomAccessFile(file, "rw")` | `fopen(file, "r+")` | `O_RDWR` | 不截断 |

**关键标志位**：
- `O_CREAT`: 如果文件不存在则创建
- `O_TRUNC`: 如果文件存在则截断为0 ← **元凶**
- `O_APPEND`: 追加模式，不截断

### 为什么要这样设计？

**写入模式的默认语义：覆盖原文件**

```java
// 典型用例：保存配置文件
FileOutputStream fos = new FileOutputStream("config.txt");
fos.write("新配置".getBytes());
fos.close();
```

- ✅ **预期行为**：新配置覆盖旧配置
- ❌ **如果不截断**：新配置会混入旧配置 → 文件损坏

**这是POSIX标准的设计，所有编程语言都遵循：**
- C语言: `fopen(file, "w")` → 截断
- Python: `open(file, "w")` → 截断
- Java: `FileOutputStream` → 截断
- Node.js: `fs.writeFileSync()` → 截断
- Go: `os.Create()` → 截断

### 关键时机：构造函数就会清空文件

```java
// 测试代码
File file = new File("test.txt");
// 文件当前大小：100 字节

FileOutputStream fos = new FileOutputStream(file);  // ← 这一行就清空了！
// 文件现在大小：0 字节

// 即使不调用 write()，文件已经是 0 字节了
fos.close();
```

**重点**：
- ❌ 不是 `write()` 清空的
- ❌ 不是 `close()` 清空的
- ✅ 是构造函数清空的（打开文件的瞬间）

---

## 🧪 测试验证

### 测试1：验证 FileOutputStream 的截断行为

```java
@Test
public void test_FileOutputStream_truncate() throws IOException {
    // 创建有内容的文件
    File file = new File("test.txt");
    FileWriter writer = new FileWriter(file);
    writer.write("这是测试内容，有一些字节。");
    writer.close();
    
    System.out.println("原始大小: " + file.length() + " 字节");  // 输出：30 字节
    
    // 仅创建 FileOutputStream，不写入任何数据
    FileOutputStream fos = new FileOutputStream(file);
    
    System.out.println("创建后大小: " + file.length() + " 字节");  // 输出：0 字节 ❌
    
    fos.close();
}
```

**结果**：仅仅创建对象，文件就被清空了！

### 测试2：Fastjson 序列化 FileSystemResource

```java
@Test
public void test_Fastjson_serialize_Resource() throws IOException {
    File file = new File("test.txt");
    FileWriter writer = new FileWriter(file);
    writer.write("测试内容");
    writer.close();
    
    System.out.println("序列化前: " + file.length() + " 字节");  // 12 字节
    
    // 创建 Resource
    Resource resource = new FileSystemResource(file);
    ResponseEntity<Resource> response = ResponseEntity.ok().body(resource);
    
    // 序列化（模拟 OperLogAspect 的操作）
    String json = JSON.toJSONString(response);
    
    System.out.println("序列化后: " + file.length() + " 字节");  // 0 字节 ❌
}
```

**结果**：序列化后文件被清空！

### 测试3：找出真正的元凶

```java
@Test
public void test_which_getter_clears_file() throws Exception {
    File file = new File("test.txt");
    FileWriter writer = new FileWriter(file);
    writer.write("测试内容");
    writer.close();
    
    FileSystemResource resource = new FileSystemResource(file);
    Method[] methods = FileSystemResource.class.getMethods();
    
    for (Method method : methods) {
        if (method.getName().startsWith("get") && method.getParameterCount() == 0) {
            long sizeBefore = file.length();
            method.invoke(resource);
            long sizeAfter = file.length();
            
            if (sizeAfter != sizeBefore) {
                System.out.println("元凶: " + method.getName());
                // 输出：元凶: getOutputStream
            }
        }
    }
}
```

**实测结果**：
- ✅ `getFile()` - 安全
- ✅ `getPath()` - 安全
- ✅ `isWritable()` - 安全（只检查权限）
- ✅ `isReadable()` - 安全
- ❌ **`getOutputStream()` - 会清空文件！** ← 元凶

---

## 🔧 修复方案

### 修改前（有问题的代码）

```java
// OperLogAspect.java
@AfterReturning(value = "operLogPoinCut()", returning = "keys")
public void saveOperLog(JoinPoint joinPoint, Object keys) {
    // ...
    
    // 直接序列化返回值，包括 Resource 对象
    operlog.setResParam(JSON.toJSONString(keys));  // ❌ 会清空文件
    
    operationLogService.addOperationLog(operlog);
}
```

### 修改后（修复代码）

```java
// OperLogAspect.java
@AfterReturning(value = "operLogPoinCut()", returning = "keys")
public void saveOperLog(JoinPoint joinPoint, Object keys) {
    // ...
    
    String resParam;
    
    // 检测是否为文件响应
    if (keys instanceof ResponseEntity) {
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) keys;
        Object body = responseEntity.getBody();
        
        if (body instanceof Resource) {
            // ✅ 跳过 Resource 对象的序列化，只记录元信息
            Resource resource = (Resource) body;
            Map<String, Object> simplifiedResponse = new HashMap<>();
            simplifiedResponse.put("statusCode", responseEntity.getStatusCode().name());
            simplifiedResponse.put("headers", responseEntity.getHeaders());
            simplifiedResponse.put("resourceDescription", resource.getDescription());
            simplifiedResponse.put("resourceExists", resource.exists());
            // 不序列化 body，不调用 getOutputStream()
            resParam = JSON.toJSONString(simplifiedResponse);
        } else {
            // 非文件响应，正常序列化
            resParam = JSON.toJSONString(keys);
        }
    } else {
        resParam = JSON.toJSONString(keys);
    }
    
    operlog.setResParam(resParam);
    operationLogService.addOperationLog(operlog);
}
```

### 关键改进

1. **检测文件响应**：判断是否为 `ResponseEntity<Resource>`
2. **跳过深度序列化**：不序列化 Resource 对象本身
3. **只记录元信息**：状态码、响应头、资源描述
4. **避免调用危险方法**：不会触发 `getOutputStream()`

---

## 📚 知识总结

### 核心要点

| 问题 | 答案 |
|------|------|
| **什么导致文件被清空？** | `FileOutputStream` 构造函数使用 `O_TRUNC` 标志打开文件 |
| **什么时候清空？** | 构造对象的瞬间，不需要调用 `write()` |
| **为什么会触发？** | Fastjson 序列化时调用 `getOutputStream()` 方法 |
| **真正的元凶？** | `FileSystemResource.getOutputStream()` 方法 |
| **为什么不是 `isWritable()`？** | `isWritable()` 只调用 `file.canWrite()`，不打开文件 |
| **如何避免？** | 不要序列化 Resource 对象，或使用自定义序列化器 |

### 最佳实践

#### ✅ 安全的做法

```java
// 1. 检查可写性：使用 File.canWrite()
boolean writable = file.canWrite();  // ✅ 安全

// 2. 读取文件：使用 FileInputStream
InputStream is = new FileInputStream(file);  // ✅ 只读，安全

// 3. 追加内容：使用 append 模式
FileOutputStream fos = new FileOutputStream(file, true);  // ✅ 不截断
```

#### ❌ 危险的做法

```java
// 1. 测试可写性：不要创建 FileOutputStream
FileOutputStream test = new FileOutputStream(file);  // ❌ 文件被清空
test.close();

// 2. 序列化文件资源对象
JSON.toJSONString(fileSystemResource);  // ❌ 会调用 getOutputStream()

// 3. 默认写入模式
FileOutputStream fos = new FileOutputStream(file);  // ❌ 会截断文件
```

### 跨语言对比

所有语言的默认写入模式都会截断文件，这是 POSIX 标准：

```java
// Java
FileOutputStream fos = new FileOutputStream("file.txt");  // 截断

// Python
f = open("file.txt", "w")  // 截断

// C
FILE* f = fopen("file.txt", "w");  // 截断

// Node.js
fs.writeFileSync("file.txt", data);  // 截断

// Go
f, _ := os.Create("file.txt")  // 截断
```

---

## 🎯 总结

这是一个由多个技术细节叠加造成的 Bug：

1. **Fastjson 序列化机制**：自动调用所有 getter 方法
2. **Spring Resource 设计**：提供 `getOutputStream()` 方法
3. **Java I/O 语义**：`FileOutputStream` 默认截断文件
4. **POSIX 标准**：`O_TRUNC` 标志在打开文件时立即清空

**修复的关键**：识别出 Resource 对象，避免深度序列化，只记录元信息。

**教训**：
- 序列化第三方对象前要谨慎，尤其是涉及 I/O 操作的
- 理解底层原理很重要（FileOutputStream 的截断行为）
- AOP 拦截要考虑各种边界情况

---

## 📖 参考资料

- [Java FileOutputStream 官方文档](https://docs.oracle.com/javase/8/docs/api/java/io/FileOutputStream.html)
- [Spring Resource 接口文档](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/io/Resource.html)
- [Fastjson GitHub](https://github.com/alibaba/fastjson)
- [POSIX 文件 I/O 标准](https://pubs.opengroup.org/onlinepubs/9699919799/)
