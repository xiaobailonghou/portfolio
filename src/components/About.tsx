import { portfolioConfig } from '@/config/portfolio'

export default function About() {
  return (
    <section id="about" className="py-20 px-4 bg-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          关于我
        </h2>
        
        <div className="bg-slate-800/50 rounded-2xl p-8 shadow-xl border border-slate-700/50">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {portfolioConfig.about}
            </p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {portfolioConfig.stats.experience}
              </div>
              <div className="text-gray-400">开发经验</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {portfolioConfig.stats.projects}+
              </div>
              <div className="text-gray-400">项目经验</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {portfolioConfig.stats.articles}+
              </div>
              <div className="text-gray-400">技术文章</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
