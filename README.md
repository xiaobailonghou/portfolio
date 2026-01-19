# 后端开发工程师 - 个人作品集

一个现代化的个人作品集网站，专为后端开发工程师春招设计。

## ✨ 特性

- 🎨 现代化极简设计，黑白灰 + 蓝色点缀
- 📱 完全响应式，支持手机、平板、电脑访问
- 🚀 基于 Next.js 14，性能优秀
- 📝 Markdown 博客系统，轻松写技术文章
- 📄 简历在线预览和下载
- 🎯 一键部署到 Vercel，免费且稳定
- 🔍 SEO 友好，方便 HR 搜索

## 🎯 网站结构

```
首页
├── 个人介绍（头像、简介、联系方式）
├── 技术栈展示（后端技能）
├── 实习经历（时间轴形式）
├── 项目作品（5个，带演示链接）
├── 技术博客（难点解决方案文章列表）
└── 简历区（在线预览 + PDF下载）
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 填写你的个人信息

编辑 `src/config/portfolio.ts` 文件，按照注释提示填写：
- 基本信息（姓名、职位、自我介绍）
- 技能栈
- 实习经历
- 项目作品
- 社交链接

### 3. 添加资源文件

在 `public` 文件夹放入以下文件：
- `avatar.jpg` - 你的头像照片
- `resume.pdf` - 你的简历 PDF 文件
- `projects/` - 项目截图（可选）

### 4. 写博客文章

在 `content/blog/` 文件夹创建 `.md` 文件，参考 `example-post.md`：

```markdown
---
title: 文章标题
date: 2024-01-15
category: 后端开发
excerpt: 文章摘要
tags:
  - Spring Boot
  - 性能优化
---

# 文章内容

这里开始写你的技术博客...
```

### 5. 本地预览

```bash
npm run dev
```

访问 http://localhost:3000 查看效果

### 6. 构建生产版本

```bash
npm run build
npm start
```

## 📦 部署到 Vercel（推荐）

### 方式一：通过 GitHub（推荐）

1. 将代码推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/portfolio.git
git push -u origin main
```

2. 访问 [Vercel](https://vercel.com)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 点击 Deploy

完成！你会得到一个 `你的用户名.vercel.app` 域名

### 方式二：通过 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 📝 内容更新指南

### 修改个人信息
编辑 `src/config/portfolio.ts`

### 添加博客文章
在 `content/blog/` 创建新的 `.md` 文件

### 更新简历
替换 `public/resume.pdf`

### 更新头像
替换 `public/avatar.jpg`

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **Markdown**: react-markdown + rehype-highlight
- **部署**: Vercel

## 📂 项目结构

```
Portfolio/
├── src/
│   ├── app/              # Next.js 应用页面
│   │   ├── layout.tsx
│   │   ├── page.tsx      # 主页
│   │   └── blog/         # 博客文章页面
│   ├── components/       # React 组件
│   │   ├── Hero.tsx      # 首屏
│   │   ├── About.tsx     # 关于我
│   │   ├── Skills.tsx    # 技能展示
│   │   ├── Experience.tsx # 实习经历
│   │   ├── Projects.tsx  # 项目作品
│   │   ├── Blog.tsx      # 博客列表
│   │   └── Resume.tsx    # 简历
│   ├── config/
│   │   └── portfolio.ts  # 配置文件（你要填的）
│   └── lib/
│       └── blog.ts       # 博客系统
├── content/
│   └── blog/             # 博客文章（Markdown）
├── public/               # 静态资源
│   ├── avatar.jpg        # 头像（你要放的）
│   ├── resume.pdf        # 简历（你要放的）
│   └── projects/         # 项目截图
└── package.json
```

## ❓ 常见问题

### Q: 如何修改网站配色？
A: 编辑 `tailwind.config.ts` 和 `src/app/globals.css`

### Q: 如何添加更多社交链接？
A: 编辑 `src/config/portfolio.ts` 的 `social` 部分，然后在 `Hero.tsx` 和 `Footer.tsx` 添加对应图标

### Q: 博客文章的代码高亮不生效？
A: 确保代码块指定了语言，例如：\`\`\`java

### Q: 部署后简历 PDF 无法访问？
A: 确保 `public/resume.pdf` 文件存在，且在 `portfolio.ts` 配置正确

### Q: 如何绑定自己的域名？
A: 在 Vercel 项目设置中添加自定义域名，然后在域名提供商那里添加 DNS 记录

## 📞 需要帮助？

- 查看 Next.js 文档：https://nextjs.org/docs
- 查看 Tailwind CSS 文档：https://tailwindcss.com/docs
- 查看 Vercel 部署文档：https://vercel.com/docs

## 📄 许可证

MIT License - 随意使用和修改

---

Made with ❤️ for 2026 春招
