import Link from 'next/link'
import { getBlogPosts } from '@/lib/blog'

export default function Blog() {
  const posts = getBlogPosts()

  return (
    <section id="blog" className="py-20 px-4 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          技术博客
        </h2>
        <p className="text-center text-gray-400 mb-12">
          分享开发中遇到的问题和解决方案
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-slate-800/50 rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-blue-500/50 transition-all hover:transform hover:scale-105 block"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <span>{post.date}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400">{post.category}</span>
                  </>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="text-gray-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-600/10 text-blue-400 rounded text-xs border border-blue-500/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-blue-400 text-sm flex items-center">
                阅读全文
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            暂无博客文章，敬请期待...
          </div>
        )}
      </div>
    </section>
  )
}
