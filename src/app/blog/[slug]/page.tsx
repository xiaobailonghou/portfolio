import { getBlogPost, getBlogPosts } from '@/lib/blog'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'
import Link from 'next/link'

export async function generateStaticParams() {
  const posts = getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">文章未找到</h1>
          <Link href="/#blog" className="text-blue-400 hover:text-blue-300">
            返回博客列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <article className="max-w-4xl mx-auto">
        <Link
          href="/#blog"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回博客列表
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{post.date}</span>
            {post.category && (
              <>
                <span>•</span>
                <span className="text-blue-400">{post.category}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg prose-invert max-w-none">
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ className, children }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-slate-700 px-2 py-1 rounded text-blue-300">{children}</code>
                  ) : (
                    <code className={className}>{children}</code>
                  )
                },
                ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <Link
            href="/#blog"
            className="inline-flex items-center text-blue-400 hover:text-blue-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回博客列表
          </Link>
        </div>
      </article>
    </div>
  )
}
