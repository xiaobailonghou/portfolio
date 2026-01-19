# 使用指南 - 你需要做什么

## 📝 第一步：填写个人信息（30 分钟）

### 1. 编辑配置文件

打开 `src/config/portfolio.ts`，找到所有 `TODO:` 标记的地方，按照注释填写：

#### 基本信息
```typescript
name: '张三',  // 你的名字
title: '后端开发工程师 | Java/Spring Boot',  // 你的职位
bio: '...',  // 简短介绍
```

#### 技能栈
根据你实际掌握的技术修改：
```typescript
skills: {
  '后端语言': ['Java', 'Python'],  // 删除不会的，添加会的
  ...
}
```

#### 实习经历
```typescript
experiences: [
  {
    company: 'XX科技',
    position: '后端开发实习生',
    period: '2024.06 - 2024.12',
    responsibilities: [
      '具体做了什么...',
    ],
    achievements: [
      '取得什么成果...',
    ],
  },
]
```

#### 项目作品
```typescript
projects: [
  {
    name: '项目名称',
    description: '项目介绍...',
    tech: ['技术1', '技术2'],
    highlights: [
      '项目亮点1',
      '项目亮点2',
    ],
  },
]
```

#### 社交链接
```typescript
social: {
  github: 'https://github.com/你的用户名',
  email: 'your@email.com',
  wechat: 'your_wechat',
}
```

---

## 📷 第二步：准备资源文件（10 分钟）

### 1. 头像照片
- 找一张你的证件照或职业照
- 命名为 `avatar.jpg`
- 放到 `public/` 文件夹

**要求**：
- 格式：JPG 或 PNG
- 建议尺寸：400x400 以上
- 正方形最佳
- 背景简洁

### 2. 简历 PDF
- 准备好你的简历 PDF
- 命名为 `resume.pdf`
- 放到 `public/` 文件夹

**提示**：
- 确保简历排版整洁
- PDF 文件大小建议 < 5MB
- 可以用 Adobe Acrobat 或 WPS 导出

### 3. 项目截图（可选）
- 如果有项目截图，放到 `public/projects/` 文件夹
- 然后在 `portfolio.ts` 的项目配置中填写路径：
  ```typescript
  image: '/projects/project1.png'
  ```

---

## ✍️ 第三步：写博客文章（1-2 小时）

### 1. 创建文章文件

在 `content/blog/` 文件夹创建新文件，例如：
- `spring-boot-optimization.md`
- `redis-cache-practice.md`
- `mysql-slow-query.md`

### 2. 文章格式

每篇文章都要遵循这个格式：

```markdown
---
title: 文章标题
date: 2024-01-15
category: 后端开发
excerpt: 这篇文章讲了什么，50-100 字摘要
tags:
  - Spring Boot
  - 性能优化
  - MySQL
---

# 文章标题

## 背景

为什么写这篇文章，遇到了什么问题...

## 问题分析

详细分析问题...

## 解决方案

### 方案一

具体代码：

\`\`\`java
public class Example {
    // 代码...
}
\`\`\`

### 方案二

...

## 总结

这次学到了什么...
```

### 3. 文章建议

写 3-5 篇技术博客，内容可以是：
- **实习中遇到的技术难点**：例如性能优化、bug 修复
- **项目中的技术方案**：例如如何实现某个功能
- **技术学习笔记**：例如 Spring Boot 原理、Redis 使用
- **问题解决过程**：例如线上问题排查

**注意**：
- 不要复制粘贴网上的文章
- 写真实的经历和思考
- 代码要能看懂，加注释
- 篇幅不用太长，500-1000 字即可

---

## 🧪 第四步：本地测试（10 分钟）

### 1. 安装依赖

打开终端，在项目文件夹运行：

```bash
npm install
```

等待安装完成（可能需要几分钟）。

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问网站

打开浏览器，访问：http://localhost:3000

### 4. 检查内容

逐个检查：
- ✅ 头像是否显示
- ✅ 个人信息是否正确
- ✅ 技能栈是否显示
- ✅ 实习经历是否完整
- ✅ 项目作品是否显示
- ✅ 博客文章是否显示
- ✅ 简历 PDF 是否能下载

### 5. 手机端测试

- 用手机访问 http://你的电脑IP:3000
- 或者按 F12 打开开发者工具，点击手机图标

### 6. 修复问题

如果有问题：
- 检查配置文件是否有语法错误
- 检查文件路径是否正确
- 检查文件名是否完全匹配（区分大小写）

---

## 🚀 第五步：部署上线（10 分钟）

详细步骤请看 `DEPLOYMENT.md` 文件。

简要步骤：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 等待自动部署
4. 得到网址

---

## ❓ 常见问题

### Q1: 我不会用 Git 和 GitHub 怎么办？

**A**: 跟着这个步骤：

1. **安装 Git**
   - Windows: https://git-scm.com/download/win
   - Mac: 终端输入 `git --version`，会自动安装

2. **注册 GitHub**
   - 访问 https://github.com
   - 点击 Sign up

3. **配置 Git**
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

4. **推送代码**（参考 DEPLOYMENT.md）

---

### Q2: npm install 失败怎么办？

**A**: 尝试：

```bash
# 清除缓存
npm cache clean --force

# 换成淘宝镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

---

### Q3: 我写的博客文章不显示

**A**: 检查：
1. 文件是否在 `content/blog/` 文件夹
2. 文件是否以 `.md` 结尾
3. Front Matter（`---` 部分）格式是否正确
4. 尤其注意 `tags` 的缩进（要用两个空格）

---

### Q4: 头像显示不出来

**A**: 检查：
1. 文件是否真的在 `public/avatar.jpg`
2. 文件名是否完全匹配（包括大小写）
3. 刷新浏览器（Ctrl + F5）

---

### Q5: 简历 PDF 下载不了

**A**: 检查：
1. `public/resume.pdf` 是否存在
2. `portfolio.ts` 中 `resumePdfUrl: '/resume.pdf'` 是否正确
3. PDF 文件是否损坏（尝试用其他 PDF 阅读器打开）

---

### Q6: 部署后内容没更新

**A**: 
1. 确认代码已经推送到 GitHub：`git push`
2. 在 Vercel 查看部署状态
3. 等待 1-2 分钟
4. 清除浏览器缓存（Ctrl + Shift + Delete）

---

### Q7: 我想修改网站样式/布局

**A**: 
- 颜色：编辑 `src/app/globals.css`
- 布局：编辑 `src/components/` 下对应的组件
- 需要一定的 React 和 Tailwind CSS 知识

---

### Q8: 多久能完成整个网站？

**A**: 
- 填写信息：30 分钟
- 准备资源：10 分钟
- 写博客：1-2 小时（3 篇）
- 测试部署：20 分钟
- **总计：2-3 小时**

---

## 📞 需要帮助

如果遇到问题：
1. 查看 `README.md`
2. 查看 `DEPLOYMENT.md`
3. 检查浏览器控制台错误信息
4. Google 搜索错误信息

---

## ✅ 检查清单

完成后，确认以下事项：

### 内容检查
- [ ] `portfolio.ts` 所有 TODO 都填写了
- [ ] 实习经历至少 1 条
- [ ] 项目作品至少 3 个
- [ ] 博客文章至少 3 篇
- [ ] 社交链接都正确

### 文件检查
- [ ] `public/avatar.jpg` 存在
- [ ] `public/resume.pdf` 存在
- [ ] 所有博客文章格式正确

### 功能检查
- [ ] 本地能正常访问
- [ ] 所有链接都能点击
- [ ] 简历能下载和预览
- [ ] 博客文章能打开
- [ ] 手机端显示正常

### 部署检查
- [ ] 代码已推送到 GitHub
- [ ] Vercel 部署成功
- [ ] 线上网站能访问
- [ ] 所有内容和本地一致

---

## 🎉 完成后

把你的作品集网址：
- 写在简历上
- 发送给 HR
- 放到招聘网站个人介绍
- 分享给朋友

祝春招顺利！💪
