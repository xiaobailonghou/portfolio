import { portfolioConfig } from '@/config/portfolio'

export default function Experience() {
  return (
    <section id="experience" className="py-20 px-4 bg-slate-900/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          实习经历
        </h2>
        
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-12">
            {portfolioConfig.experiences.map((exp, index) => (
              <div
                key={index}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* 时间点 */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 z-10"></div>
                
                {/* 内容卡片 */}
                <div className={`ml-8 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="bg-slate-800/50 rounded-xl p-6 shadow-xl border border-slate-700/50 hover:border-blue-500/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                      <span className="text-sm text-blue-400 whitespace-nowrap ml-4">
                        {exp.period}
                      </span>
                    </div>
                    <div className="text-lg text-blue-300 mb-3">{exp.position}</div>
                    <ul className="space-y-2 text-gray-400">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="text-sm text-gray-500 mb-2">主要成果：</div>
                        <ul className="space-y-1 text-gray-400 text-sm">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-400 mr-2">✓</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
