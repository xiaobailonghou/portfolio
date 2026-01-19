import { portfolioConfig } from '@/config/portfolio'

export default function Skills() {
  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          技术栈
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(portfolioConfig.skills).map(([category, items]) => (
            <div
              key={category}
              className="bg-slate-800/50 rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-700/50 text-gray-300 rounded-full text-sm border border-slate-600/50 hover:border-blue-500/50 hover:text-blue-300 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
