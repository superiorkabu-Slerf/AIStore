import React from 'react';
import { Calendar, Flame } from 'lucide-react';
import { NewsItem } from '../types';
import { Card, Badge } from './Common';
import { cn } from '../lib/utils';

export const TimelineItem: React.FC<{ item: NewsItem; showDate: boolean; onClick: () => void }> = ({ item, showDate, onClick }) => (
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
      <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#1ed661] to-transparent opacity-20 border-l-2 border-dashed border-[#1ed661]" />
      <div className="absolute left-0 top-2 w-10 h-10 flex items-center justify-center">
        <div className="w-3 h-3 bg-[#1ed661] rounded-full shadow-[0_0_15px_#1ed661] group-hover:scale-125 transition-transform" />
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#1ed661]">{item.exactTime}</span>
            <Badge label={item.categoryTag} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400">
            <Flame size={12} fill="currentColor" />
            {item.importance}
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-[#1ed661] transition-colors leading-snug">{item.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
      </Card>
    </div>
  </div>
);

export const ArticleCard: React.FC<{ item: NewsItem; onClick: () => void; compact?: boolean; className?: string }> = ({ item, onClick, compact = false, className = '' }) => (
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
      <h3 className={cn("font-bold mb-3 line-clamp-2 group-hover:text-[#1ed661] transition-colors leading-snug", compact ? "text-base md:text-lg" : "text-base md:text-lg")}>{item.title}</h3>
      <p className={cn("text-sm text-gray-400 leading-relaxed", compact ? "line-clamp-2" : "line-clamp-3")}>{item.summary}</p>
    </div>
  </Card>
);
