import { portfolioConfig } from '@/config/portfolio'

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-8 relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <img
              src={portfolioConfig.avatar}
              alt="头像"
              className="w-full h-full rounded-full object-cover bg-slate-800"
            />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {portfolioConfig.name}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-6">
          {portfolioConfig.title}
        </p>
        
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          {portfolioConfig.bio}
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#projects"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            查看项目
          </a>
          <a
            href="#blog"
            className="px-8 py-3 border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all transform hover:scale-105"
          >
            技术博客
          </a>
          <a
            href="#resume"
            className="px-8 py-3 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 rounded-lg transition-all transform hover:scale-105"
          >
            下载简历
          </a>
        </div>
        
        <div className="mt-12 flex gap-6 justify-center">
          {portfolioConfig.social.github && (
            <a
              href={portfolioConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          )}
          {portfolioConfig.social.email && (
            <a
              href={`mailto:${portfolioConfig.social.email}`}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
