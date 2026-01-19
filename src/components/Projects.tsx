import { portfolioConfig } from '@/config/portfolio'

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          项目作品
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {portfolioConfig.projects.map((project, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl overflow-hidden shadow-xl border border-slate-700/50 hover:border-blue-500/50 transition-all hover:transform hover:scale-105"
            >
              {/* 项目图片/截图 */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-blue-400/30">
                    {project.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {project.name}
                </h3>
                
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                {/* 技术栈标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                {/* 项目亮点 */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">项目亮点：</div>
                    <ul className="space-y-1 text-sm text-gray-400">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-400 mr-2">▸</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 链接 */}
                <div className="flex gap-4 mt-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      在线演示
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
