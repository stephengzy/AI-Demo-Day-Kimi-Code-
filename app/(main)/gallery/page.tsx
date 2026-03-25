'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ExternalLink } from 'lucide-react';

interface Demo {
  id: number;
  name: string;
  summary: string;
  track: 'optimizer' | 'builder';
  demo_link: string | null;
  submitter1_name: string;
  submitter1_dept: string;
  submitter2_name: string | null;
  submitter2_dept: string | null;
  background: string | null;
  solution: string | null;
  keywords: string | null;
  media_urls: string | string[];
  submitter_name: string;
  submitter_department: string;
  created_at: string;
}

export default function GalleryPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [optimizerExpanded, setOptimizerExpanded] = useState(true);
  const [builderExpanded, setBuilderExpanded] = useState(true);

  useEffect(() => {
    fetch('/api/demos')
      .then(r => r.json())
      .then(data => {
        setDemos(data.demos || []);
        if (data.demos?.length > 0) {
          setSelectedDemo(data.demos[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const optimizerDemos = demos.filter(d => d.track === 'optimizer');
  const builderDemos = demos.filter(d => d.track === 'builder');

  const filteredOptimizer = optimizerDemos.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBuilder = builderDemos.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 安全解析 media_urls（可能是 JSONB 数组或字符串）
  function parseMediaUrls(mediaUrls: string | string[] | null | undefined): string[] {
    if (!mediaUrls) return [];
    if (Array.isArray(mediaUrls)) return mediaUrls;
    if (typeof mediaUrls === 'string') {
      try {
        const parsed = JSON.parse(mediaUrls);
        return Array.isArray(parsed) ? parsed : [mediaUrls];
      } catch {
        // 如果不是 JSON，可能是单个 URL 字符串
        return [mediaUrls];
      }
    }
    return [];
  }
  
  const mediaUrls = parseMediaUrls(selectedDemo?.media_urls);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-on-surface-variant">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Header */}
      <header className="flex items-center justify-between flex-shrink-0 mb-4 px-12 pt-4 pb-2">
        <div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-on-surface">Gallery</h2>
          <p className="text-lg text-on-surface-variant mt-2 chinese-text">探索所有提交的 Demo 项目</p>
        </div>
      </header>

      {/* Split Pane Layout - 独立滚动 */}
      <section className="flex-1 flex gap-6 min-h-0 px-12 pb-12">
        {/* Left Pane: Project List - 独立滚动 */}
        <div className="w-1/3 flex flex-col h-full overflow-hidden">
          {/* Search */}
          <div className="relative mb-4 flex-shrink-0">
            <input
              className="w-full bg-surface-container-low border-none border-b border-outline/30 focus:ring-0 focus:border-primary text-sm px-4 py-3 rounded-lg transition-all"
              placeholder="搜索项目..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute right-3 top-3 text-outline" />
          </div>

          {/* Project List - 独立滚动区域 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 border border-outline-variant/10 rounded-lg bg-surface-container-low/30">
            {/* Optimizer Section */}
            <div className="border-b border-outline-variant/30">
              {/* 吸顶标题栏 */}
              <button 
                className="sticky top-0 z-10 flex items-center justify-between w-full py-3 px-3 cursor-pointer group bg-surface-container-low/95 backdrop-blur-sm border-b border-outline-variant/20"
                onClick={() => setOptimizerExpanded(!optimizerExpanded)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-secondary text-sm">⚡️</span>
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface">
                    Optimizer
                  </span>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    {filteredOptimizer.length}
                  </span>
                </div>
                <ChevronDown size={18} className={`text-outline transition-transform duration-300 ${optimizerExpanded ? '' : '-rotate-90'}`} />
              </button>
              {optimizerExpanded && (
                <div className="space-y-2 p-2">
                  {filteredOptimizer.map(demo => (
                    <div
                      key={demo.id}
                      onClick={() => setSelectedDemo(demo)}
                      className={`p-4 rounded-lg cursor-pointer transition-all group ${
                        selectedDemo?.id === demo.id 
                          ? 'bg-surface-container-lowest shadow-sm border-l-2 border-secondary' 
                          : 'bg-surface-container-low hover:bg-surface-container-high'
                      }`}
                    >
                      {/* 标题在最上面 */}
                      <h3 className={`text-base font-headline font-bold mb-2 leading-tight ${
                        selectedDemo?.id === demo.id ? '' : 'group-hover:text-primary'
                      }`}>
                        {demo.name}
                      </h3>
                      
                      {/* 简介 */}
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-2 chinese-text">
                        {demo.summary}
                      </p>
                      
                      {/* 底部：作者 + 关键词 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-outline">
                          {demo.submitter1_name}
                        </span>
                      </div>
                      {demo.keywords && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {demo.keywords.split(/[、,，]/).slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-secondary/10 text-secondary rounded">
                              {kw.trim()}
                            </span>
                          ))}
                          {demo.keywords.split(/[、,，]/).length > 3 && (
                            <span className="text-[10px] text-on-surface-variant">+{demo.keywords.split(/[、,，]/).length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Builder Section */}
            <div className="border-b border-outline-variant/30">
              {/* 吸顶标题栏 */}
              <button 
                className="sticky top-0 z-10 flex items-center justify-between w-full py-3 px-3 cursor-pointer group bg-surface-container-low/95 backdrop-blur-sm border-b border-outline-variant/20"
                onClick={() => setBuilderExpanded(!builderExpanded)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-tertiary text-sm">🛠️</span>
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface">
                    Builder
                  </span>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                    {filteredBuilder.length}
                  </span>
                </div>
                <ChevronDown size={18} className={`text-outline transition-transform duration-300 ${builderExpanded ? '' : '-rotate-90'}`} />
              </button>
              {builderExpanded && (
                <div className="space-y-2 p-2">
                  {filteredBuilder.map(demo => (
                    <div
                      key={demo.id}
                      onClick={() => setSelectedDemo(demo)}
                      className={`p-4 rounded-lg cursor-pointer transition-all group ${
                        selectedDemo?.id === demo.id 
                          ? 'bg-surface-container-lowest shadow-sm border-l-2 border-secondary' 
                          : 'bg-surface-container-low hover:bg-surface-container-high'
                      }`}
                    >
                      {/* 标题在最上面 */}
                      <h3 className={`text-base font-headline font-bold mb-2 leading-tight ${
                        selectedDemo?.id === demo.id ? '' : 'group-hover:text-primary'
                      }`}>
                        {demo.name}
                      </h3>
                      
                      {/* 简介 */}
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                        {demo.summary}
                      </p>
                      
                      {/* 底部：作者 + 关键词 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-outline">
                          {demo.submitter1_name}{demo.submitter2_name ? ` + ${demo.submitter2_name}` : ''}
                        </span>
                      </div>
                      {demo.keywords && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {demo.keywords.split(/[、,，]/).slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-tertiary/10 text-tertiary rounded">
                              {kw.trim()}
                            </span>
                          ))}
                          {demo.keywords.split(/[、,，]/).length > 3 && (
                            <span className="text-[10px] text-on-surface-variant">+{demo.keywords.split(/[、,，]/).length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Project Detail - 独立滚动 */}
        <div className="flex-1 bg-surface-container-low rounded-xl flex flex-col h-full overflow-hidden border border-outline-variant/10">
          {selectedDemo ? (
            <>
              <div className="px-8 pt-6 pb-4 flex-shrink-0 border-b border-outline-variant/10 bg-surface-container-low">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-bold text-on-surface-variant uppercase tracking-wide rounded">
                    {selectedDemo.track}
                  </span>
                  {selectedDemo.track === 'optimizer' ? (
                    <span className="text-secondary text-lg">⚡️</span>
                  ) : (
                    <span className="text-tertiary text-lg">🛠️</span>
                  )}
                </div>
                <h1 className="text-3xl font-headline font-bold text-on-surface">{selectedDemo.name}</h1>
                {/* One-Line Pitch 移到标题下方 */}
                <p className="mt-3 text-base text-on-surface-variant leading-relaxed">
                  {selectedDemo.summary}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                <div className="flex flex-col gap-8">
                  {/* 4. The Story - Why & How */}
                  {(selectedDemo.background || selectedDemo.solution) && (
                    <div className="pb-6 border-b border-outline-variant/20 space-y-6">
                      {/* Why */}
                      {selectedDemo.background && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-secondary font-bold mb-3">Why / 为什么要做</p>
                          <p className="text-on-surface-variant leading-relaxed text-base">
                            {selectedDemo.background}
                          </p>
                        </div>
                      )}
                      
                      {/* How */}
                      {selectedDemo.solution && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-tertiary font-bold mb-3">How / 怎么解决的</p>
                          <p className="text-on-surface-variant leading-relaxed text-base">
                            {selectedDemo.solution}
                          </p>
                        </div>
                      )}
                      
                      {/* Keywords */}
                      {selectedDemo.keywords && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">关键词 / Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedDemo.keywords.split(/[、,，]/).map((kw, i) => (
                              <span key={i} className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Who's the mastermind */}
                  <div className="pb-6 border-b border-outline-variant/20">
                    <p className="text-xs uppercase tracking-widest text-outline font-bold mb-3">Who's the Mastermind / 负责人</p>
                    <div className="flex items-center gap-2 text-base text-on-surface">
                      <span className="font-semibold">{selectedDemo.submitter1_name}</span>
                      <span className="text-on-surface-variant">({selectedDemo.submitter1_dept})</span>
                      {selectedDemo.submitter2_name && (
                        <>
                          <span className="text-outline">+</span>
                          <span className="font-semibold">{selectedDemo.submitter2_name}</span>
                          <span className="text-on-surface-variant">({selectedDemo.submitter2_dept})</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 5. Show Us the Goods */}
                  <div className="space-y-6">
                    {selectedDemo.demo_link && (
                      <section>
                        <p className="text-xs uppercase tracking-widest text-outline font-bold mb-3">Show Us the Goods / 作品链接</p>
                        <a 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-primary font-medium text-sm transition-colors"
                          href={selectedDemo.demo_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={16} />
                          <span>查看演示</span>
                        </a>
                      </section>
                    )}
                    {mediaUrls.length > 0 && (
                      <section>
                        <p className="text-xs uppercase tracking-widest text-outline font-bold mb-3">截图/录屏</p>
                        <div className="grid grid-cols-2 gap-4">
                          {mediaUrls.map((url: string, i: number) => (
                            <div key={i} className="aspect-video bg-surface-container-highest rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Media ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant overflow-y-auto custom-scrollbar">
              <p>暂无项目，请先提交 Demo</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
