import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '后端开发工程师 - 个人作品集',
  description: '后端开发工程师个人作品集，展示项目经验、技术博客和实习经历',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
