'use client'

import { portfolioConfig } from '@/config/portfolio'

export default function Resume() {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = portfolioConfig.resumePdfUrl
    link.download = '后端开发-郑怀荣-13417191284.pdf'
    link.click()
  }

  return (
    <section id="resume" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          个人简历
        </h2>
        
        <div className="bg-slate-800/50 rounded-2xl p-8 shadow-xl border border-slate-700/50">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-6">
              点击下方按钮下载完整简历 PDF 文件
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                下载简历 PDF
              </button>
              
              <a
                href={portfolioConfig.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                在线预览
              </a>
            </div>
          </div>
          
          {/* 简历预览区域 */}
          <div className="mt-8 border-t border-slate-700/50 pt-8">
            <iframe
              src={`${portfolioConfig.resumePdfUrl}#view=FitH`}
              className="w-full h-[600px] rounded-lg bg-white border border-slate-600"
              title="简历预览"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
