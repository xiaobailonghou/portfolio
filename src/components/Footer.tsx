import { portfolioConfig } from '@/config/portfolio'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 px-4 bg-slate-900/80 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">联系方式</h3>
            <div className="space-y-2 text-gray-400">
              {portfolioConfig.social.email && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${portfolioConfig.social.email}`} className="hover:text-blue-400">
                    {portfolioConfig.social.email}
                  </a>
                </div>
              )}
              {portfolioConfig.social.wechat && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 11a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"/>
                    <path d="M16.5 4C12.9 4 10 6.5 10 9.6c0 2 1.1 3.7 2.8 4.8-.2.6-.6 1.8-.6 1.8s1.7-.4 2.4-.8c.5.1 1 .2 1.6.2 3.6 0 6.5-2.5 6.5-5.6S20.1 4 16.5 4z"/>
                  </svg>
                  <span>微信：{portfolioConfig.social.wechat}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">快速链接</h3>
            <div className="space-y-2">
              <a href="#about" className="block text-gray-400 hover:text-blue-400 transition-colors">关于我</a>
              <a href="#projects" className="block text-gray-400 hover:text-blue-400 transition-colors">项目作品</a>
              <a href="#blog" className="block text-gray-400 hover:text-blue-400 transition-colors">技术博客</a>
              <a href="#resume" className="block text-gray-400 hover:text-blue-400 transition-colors">个人简历</a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4">社交媒体</h3>
            <div className="flex gap-4">
              {portfolioConfig.social.github && (
                <a
                  href={portfolioConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 pt-8 border-t border-slate-800">
          <p>© {currentYear} {portfolioConfig.name}. All rights reserved.</p>
          <p className="text-sm mt-2">Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
