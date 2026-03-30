import React, { useMemo, useState } from 'react';
import { ExternalLink, Gift, Search } from 'lucide-react';
import { freeModelEntries } from '../constants';
import { cn } from '../lib/utils';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

const categoryOptions = ['全部', '对话', '推理', '办公', '长文本', '设计', '视频'] as const;

export const FreeZone = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof categoryOptions)[number]>('全部');

  const filteredEntries = useMemo(() => {
    return freeModelEntries.filter(entry => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === '全部' || entry.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="modelhub-page py-4">
      <SubpageHero
        badge="免费专区"
        title="国产免费模型入口"
        description="聚合一批可直接体验的国产免费模型与创作工具入口，先试用，再决定是否继续接入 API 或工作流。"
        icon={Gift}
        accentClassName="text-sky-300"
      />
      <SubpageIntro
        title="免费专区"
        description="这里集中收录可直接体验的免费模型与工具入口，适合先做能力验证、体验对比和团队试用，再决定是否继续接入 API 或工作流。"
        highlights={['查看免费入口', '按场景筛选', '直达官网试用']}
      />

      <section className="bg-zinc-900/35 border border-white/5 rounded-3xl p-6 md:p-8 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">免费模型列表</h2>
            <p className="text-sm text-zinc-500 mt-2">按场景浏览免费入口，覆盖对话、推理、办公、视频与创作工具。</p>
          </div>
          <div className="text-xs text-zinc-600">
            当前收录 <span className="text-white font-mono">{filteredEntries.length}</span> 个免费入口
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索模型、厂商或标签"
                className="w-full bg-zinc-950/70 border border-white/10 rounded-2xl h-12 pl-12 pr-4 text-sm outline-none focus:border-[#1ed661]/40 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setActiveCategory(option)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                    activeCategory === option
                      ? 'bg-[#1ed661]/10 border-[#1ed661]/40 text-[#1ed661]'
                      : 'bg-zinc-950/70 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEntries.map(entry => (
              <a
                key={entry.id}
                href={entry.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#101720] border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/90 hover:border-white/10 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <LogoAvatar src={entry.logo} alt={entry.name} fallback={entry.name[0]} size="md" className="bg-zinc-950" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-zinc-300 truncate">{entry.provider}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{entry.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-[#1ed661]/10 text-[#1ed661] rounded-md border border-[#1ed661]/20 font-bold">
                    {entry.category}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#1ed661] transition-colors">{entry.name}</h3>
                <p className="text-sm text-zinc-500 leading-7 mb-4 min-h-[84px]">{entry.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {entry.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-[#1ed661]/5 text-[#1ed661]/80 text-[10px] rounded-md border border-[#1ed661]/10">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">免费方式</div>
                    <div className="text-sm font-bold text-zinc-200 mt-1">{entry.freeType}</div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1ed661]">
                    前往官网
                    <ExternalLink size={14} />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {filteredEntries.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-zinc-600 text-lg font-medium">没有找到匹配的免费模型入口</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('全部');
                }}
                className="text-[#1ed661] text-sm mt-4 hover:underline"
              >
                清空筛选
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
