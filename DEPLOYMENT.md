# 部署指南

本文档详细说明如何将你的作品集部署到互联网，让 HR 可以随时访问。

## 🎯 推荐方案：Vercel（免费 + 最简单）

### 为什么选择 Vercel？
- ✅ **完全免费**（个人使用）
- ✅ **无需服务器知识**
- ✅ **自动 HTTPS**
- ✅ **全球 CDN 加速**
- ✅ **自动部署**：推送代码自动更新网站
- ✅ **提供免费域名**：`你的名字.vercel.app`

---

## 📋 部署步骤（总共 10 分钟）

### 第一步：准备代码

1. **确保你已经填好个人信息**
   - 检查 `src/config/portfolio.ts` 是否填写完整
   - 确认 `public/avatar.jpg` 和 `public/resume.pdf` 已放入

2. **本地测试**
   ```bash
   npm run dev
   ```
   访问 http://localhost:3000 确认一切正常

3. **构建测试**
   ```bash
   npm run build
   ```
   确保没有错误

---

### 第二步：推送到 GitHub

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - Repository name: `portfolio` 或其他名字
   - 选择 Public（公开）
   - 点击 "Create repository"

2. **推送代码**
   ```bash
   # 初始化 git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit: My portfolio"
   
   # 添加远程仓库（替换成你的 GitHub 用户名和仓库名）
   git remote add origin https://github.com/你的用户名/portfolio.git
   
   # 推送
   git branch -M main
   git push -u origin main
   ```

---

### 第三步：部署到 Vercel

1. **注册/登录 Vercel**
   - 访问 https://vercel.com
   - 点击 "Sign Up" 或 "Log In"
   - 选择 "Continue with GitHub"（用 GitHub 账号登录）

2. **导入项目**
   - 登录后，点击 "Add New..." → "Project"
   - 在列表中找到你的 `portfolio` 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: Next.js（会自动检测）
   - Root Directory: `./`（保持默认）
   - Build Command: `npm run build`（保持默认）
   - Output Directory: `.next`（保持默认）
   - 点击 "Deploy"

4. **等待部署**
   - 大约 1-2 分钟
   - 部署成功后会显示 "Congratulations!"
   - 你会得到一个网址，例如：`portfolio-xxx.vercel.app`

5. **访问你的网站**
   - 点击访问链接
   - 完成！你的作品集已经上线了

---

## 🔄 更新网站内容

以后要更新内容，只需要：

```bash
# 修改文件后
git add .
git commit -m "更新个人信息"
git push
```

Vercel 会自动检测到推送，自动重新部署，大约 1-2 分钟后更新就会生效。

---

## 🌐 绑定自定义域名（可选）

如果你有自己的域名（例如 `zhangsan.com`）：

1. **在 Vercel 添加域名**
   - 进入你的项目
   - 点击 "Settings" → "Domains"
   - 输入你的域名，点击 "Add"

2. **配置 DNS**
   - Vercel 会告诉你需要添加的 DNS 记录
   - 去你的域名提供商（阿里云、腾讯云等）
   - 添加对应的 A 记录或 CNAME 记录
   - 等待几分钟到几小时生效

---

## 🎨 修改 Vercel 域名

默认域名是随机的（`portfolio-xxx.vercel.app`），你可以改成自己名字：

1. 在 Vercel 项目中，点击 "Settings" → "Domains"
2. 在 "Vercel Domains" 部分，点击 "Edit"
3. 改成 `你的名字.vercel.app`（例如 `zhangsan.vercel.app`）
4. 保存即可

---

## 📊 查看访问统计

Vercel 提供基础的访问统计：

1. 进入你的项目
2. 点击 "Analytics"
3. 可以看到访问量、地理位置等信息

如果需要更详细的统计，可以集成 Google Analytics 或百度统计。

---

## 🐛 常见问题

### Q: 部署后页面是空白的
**A**: 检查浏览器控制台是否有错误，通常是：
- `portfolio.ts` 配置文件有语法错误
- 图片路径不正确
- 构建时有错误但被忽略了

**解决方法**：
```bash
npm run build
```
查看构建输出，修复所有错误和警告

---

### Q: 简历 PDF 无法访问（404）
**A**: 确保：
- `public/resume.pdf` 文件确实存在
- 文件名完全匹配（区分大小写）
- 重新部署：`git add . && git commit -m "fix" && git push`

---

### Q: 博客文章不显示
**A**: 检查：
- `content/blog/` 文件夹是否存在
- `.md` 文件的 Front Matter 格式是否正确
- 重新构建：`npm run build`

---

### Q: 图片不显示
**A**: 确保：
- 图片放在 `public/` 文件夹
- 路径以 `/` 开头，例如 `/avatar.jpg`
- 图片格式是 `.jpg`、`.png` 等常见格式

---

### Q: 部署后样式乱了
**A**: 通常是 Tailwind CSS 配置问题：
- 确保 `tailwind.config.ts` 的 `content` 包含所有文件
- 确保 `postcss.config.js` 存在
- 清除缓存重新部署

---

### Q: 想删除项目重新部署
**A**: 
1. 在 Vercel 项目设置中点击 "Delete Project"
2. 重新 Import 即可

---

## 📱 分享你的作品集

部署成功后，你可以：

1. **在简历中添加链接**
   ```
   个人作品集：https://你的名字.vercel.app
   ```

2. **在求职邮件中提到**
   ```
   您好，我是 XXX，正在申请贵公司的后端开发岗位。
   我的个人作品集：https://你的名字.vercel.app
   ```

3. **在招聘网站个人简介中添加**
   - Boss直聘
   - 牛客网
   - LinkedIn

---

## 🚀 高级优化（可选）

### 添加网站图标（Favicon）
在 `public/` 放入 `favicon.ico`

### 添加 SEO 元信息
编辑 `src/app/layout.tsx` 的 `metadata`

### 添加 Google Analytics
1. 注册 Google Analytics
2. 在 `layout.tsx` 添加跟踪代码

### 性能优化
- 压缩图片（推荐 tinypng.com）
- 使用 WebP 格式
- 懒加载图片

---

## 🎉 完成

恭喜！你的作品集现在已经：
- ✅ 在互联网上永久可访问
- ✅ 自动 HTTPS 安全连接
- ✅ 全球 CDN 加速
- ✅ 随时更新内容

把网址发给 HR 吧！

---

## 💡 小贴士

1. **定期更新**：有新项目或博客就更新上去
2. **保持简洁**：不要堆砌太多项目，质量 > 数量
3. **检查链接**：确保所有 GitHub 链接、演示链接都能访问
4. **移动端测试**：用手机访问看看效果
5. **要二维码**：可以用 `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=你的网址` 生成二维码放到简历上

祝春招顺利！🎉
