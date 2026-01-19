# 博客文章目录

## 如何添加博客文章

1. 在 `content/blog/` 文件夹下创建新的 `.md` 文件
2. 文件名就是文章的 URL，例如 `my-post.md` -> `/blog/my-post`
3. 每篇文章必须包含 Front Matter（文件开头的 `---` 部分）

## 文章模板

创建新文章时，复制以下模板：

```markdown
---
title: 文章标题
date: 2024-01-15
category: 后端开发
excerpt: 文章摘要，会显示在列表页
tags:
  - 标签1
  - 标签2
  - 标签3
---

# 文章标题

这里开始写正文内容...

## 二级标题

### 三级标题

正文支持完整的 Markdown 语法。

代码块示例：

\`\`\`java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
\`\`\`

列表：
- 项目1
- 项目2
- 项目3

引用：
> 这是一段引用文字

链接：[链接文字](https://example.com)
```

## 注意事项

- 日期格式：YYYY-MM-DD
- tags 是数组格式，每个标签独占一行
- excerpt 会显示在博客列表页，建议 50-100 字
- 文章内容支持完整的 Markdown 语法，包括代码高亮
