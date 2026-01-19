import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  category?: string
  tags?: string[]
  content: string
}

export function getBlogPosts(): BlogPost[] {
  // 确保目录存在
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || '',
        date: data.date ? String(data.date) : '',
        excerpt: data.excerpt || '',
        category: data.category,
        tags: data.tags || [],
        content,
      }
    })

  // 按日期排序
  return allPosts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || '',
      date: data.date ? String(data.date) : '',
      excerpt: data.excerpt || '',
      category: data.category,
      tags: data.tags || [],
      content,
    }
  } catch {
    return null
  }
}
