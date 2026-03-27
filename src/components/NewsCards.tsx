import React from 'react';
import { Calendar, CalendarDays, Clock3, Flame } from 'lucide-react';
import { NewsItem } from '../types';
import { Card, Badge } from './Common';
import { cn } from '../lib/utils';

export const TimelineItem: React.FC<{ item: NewsItem; showDate: boolean; onClick: () => void; isCurrent?: boolean }> = ({ item, showDate, onClick, isCurrent = false }) => (
  <div className="relative group cursor-pointer" onClick={onClick}>
    {showDate && (
      <div className="flex items-center gap-2 mb-6 mt-8 first:mt-0">
        <div className="px-3 py-1 bg-[#1ed661]/10 border border-[#1ed661]/20 rounded-lg text-xs font-bold text-[#1ed661] flex items-center gap-2">
          <Calendar size={12} />
          {item.date}
        </div>
        <div className="h-[1px] flex-grow bg-white/5" />
      </div>
    )}
    <div className="relative pl-12 pb-12">
      <div className="absolute left-[19px] top-0 bottom-0 w-[1px] bg-white/10" />
      <div className="absolute left-0 top-2 w-10 h-10 flex items-center justify-center">
        <div
          className={cn(
            'w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125',
            isCurrent ? 'bg-[#1ed661] shadow-[0_0_12px_#1ed661]' : 'bg-white/25'
          )}
        />
      </div>
      <Card className="p-6 border border-white/10 bg-white/[0.03] backdrop-blur-[10px] hover:border-[#1ed661]/30">
        <div className="flex items-center justify-between mb-3">
          <Badge label={item.categoryTag} />
          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
            <Flame size={12} fill="currentColor" />
            {item.importance}
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-3 group-hover:text-[#1ed661] transition-colors leading-[1.5]">{item.title}</h3>
        <p className="text-sm text-white/60 line-clamp-2 leading-[1.7]">{item.summary}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-white/45">
          <Clock3 size={12} />
          <span>{item.exactTime}</span>
        </div>
      </Card>
    </div>
  </div>
);

export const ArticleCard: React.FC<{
  item: NewsItem;
  onClick: () => void;
  compact?: boolean;
  className?: string;
  variant?: 'default' | 'learning';
}> = ({ item, onClick, compact = false, className = '', variant = 'default' }) => (
  (() => {
    const tutorialLevel =
      item.type === 'tutorial'
        ? item.difficulty === 'expert'
          ? '专家'
          : item.difficulty === 'intermediate'
            ? '进阶'
            : '入门'
        : null;
    const tutorialLevelClass =
      tutorialLevel === '专家'
        ? 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/35'
        : tutorialLevel === '进阶'
          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35'
          : 'bg-lime-500/15 text-lime-300 border-lime-400/35';

    if (variant === 'learning') {
      return (
        <button className={cn("article-card group w-full h-full text-left flex flex-col overflow-hidden", className)} onClick={onClick}>
          <div className="article-cover">
            <img
              src={item.cover}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="article-pill-row">
              <span className="article-pill">{item.categoryTag}</span>
              {tutorialLevel && <span className="article-pill">{tutorialLevel}</span>}
            </div>
          </div>
          <div className="article-body">
            <h3 className="article-title line-clamp-2">{item.title}</h3>
            <div className="article-data-bar">
              <div className="article-data-item">
                <span className="article-data-label">日期</span>
                <span className="article-data-value">
                  <CalendarDays size={14} className="lp-icon" />
                  {item.date}
                </span>
              </div>
              <div className="article-data-item">
                <span className="article-data-label">热度</span>
                <span className="article-data-value">
                  <Flame size={14} className="lp-icon" />
                  {item.importance}
                </span>
              </div>
            </div>
            <p className="article-summary line-clamp-3">{item.summary}</p>
          </div>
        </button>
      );
    }

    return (
      <Card className={cn("group cursor-pointer flex flex-col h-full overflow-hidden relative", className)} onClick={onClick}>
        <div className="aspect-video overflow-hidden">
          <img
            src={item.cover}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className={cn("flex flex-col flex-grow", compact ? "p-4" : "p-6")}>
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <Badge label={item.categoryTag} />
            {tutorialLevel && <Badge label={tutorialLevel} className={tutorialLevelClass} />}
            {item.isEditorsChoice && (
              <span className="px-2 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded shadow-lg">Editor's Choice</span>
            )}
          </div>
          <div className={cn("flex items-center justify-between text-xs text-gray-500", compact ? "mb-3" : "mb-4")}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1"><Calendar size={12} />{item.date}</div>
            </div>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={12} fill="currentColor" />
              {item.importance}
            </div>
          </div>
          <h3 className={cn("font-semibold mb-3 line-clamp-2 group-hover:text-[#1ed661] transition-colors leading-[1.6]", compact ? "text-base md:text-lg" : "text-base md:text-lg")}>{item.title}</h3>
          <p className={cn("text-sm text-white/60 leading-[1.6]", compact ? "line-clamp-2" : "line-clamp-3")}>{item.summary}</p>
        </div>
      </Card>
    );
  })()
);
