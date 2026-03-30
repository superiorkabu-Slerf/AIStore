import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Search, LayoutGrid, List, RotateCcw, ChevronRight, Info, Layers, Filter, SlidersHorizontal, ArrowUpDown, Sparkles, TrendingUp, Zap, DollarSign, ExternalLink, X, Calendar, Eye } from 'lucide-react';
import { models, trendEvents } from '../constants';
import { formatPrice, cn } from '../lib/utils';
import { useCompare } from '../hooks/useCompare';
import { FilterState, initialFilterState, mapNaturalLanguageToFilters } from '../lib/filterUtils';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';

export const Discover = () => {
  const { compareList, addToCompare } = useCompare();
  const placeholder = useRotatingPlaceholder();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [view, setView] = useState<'list' | 'grid'>('list');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);
  
  // Initialize state from URL
  const [filters, setFilters] = useState<FilterState>(() => {
    const state = { ...initialFilterState };
    if (searchParams.get('q')) state.searchQuery = searchParams.get('q') || '';
    if (searchParams.get('type')) state.selectedType = searchParams.get('type') || '全部';
    if (searchParams.get('scenario')) state.selectedScenario = searchParams.get('scenario') || '全部';
    if (searchParams.get('budget')) state.budgetLimit = Number(searchParams.get('budget')) || 1000;
    if (searchParams.get('context')) state.contextWindow = Number(searchParams.get('context')) || 0;
    if (searchParams.get('os')) state.isOpenSource = searchParams.get('os') || 'all';
    if (searchParams.get('sort')) state.sortBy = searchParams.get('sort') || 'default';
    return state;
  });

  // Handle focus and scroll from navigation state
  useEffect(() => {
    if (location.state?.focusSearch) {
      searchInputRef.current?.focus();
    }
    if (location.state?.scrollToTrends) {
      trendsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  // Sync state to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.searchQuery) params.q = filters.searchQuery;
    if (filters.selectedType !== '全部') params.type = filters.selectedType;
    if (filters.selectedScenario !== '全部') params.scenario = filters.selectedScenario;
    if (filters.budgetLimit !== 1000) params.budget = filters.budgetLimit.toString();
    if (filters.contextWindow !== 0) params.context = filters.contextWindow.toString();
    if (filters.isOpenSource !== 'all') params.os = filters.isOpenSource;
    if (filters.sortBy !== 'default') params.sort = filters.sortBy;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearchChange = (val: string) => {
    setFilters(prev => ({ ...prev, searchQuery: val }));
  };

  const handleNaturalLanguageSearch = () => {
    const mapped = mapNaturalLanguageToFilters(filters.searchQuery);
    setFilters(prev => ({ ...prev, ...mapped }));
  };

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
                           m.provider.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           m.tags.some(t => t.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      const matchesType = filters.selectedType === '全部' || 
                         m.modality === filters.selectedType || 
                         (filters.selectedType === '对话' && (m.modality === '纯文本' || m.modality === '多模态')) ||
                         (filters.selectedType === '生图' && m.modality === '图像生成');
      
      const matchesScenario = filters.selectedScenario === '全部' || m.scenarios.includes(filters.selectedScenario) || m.tags.includes(filters.selectedScenario);
      const matchesBudget = m.pricing.output <= filters.budgetLimit;
      const matchesContext = m.contextWindow >= filters.contextWindow;
      const matchesOpenSource = filters.isOpenSource === 'all' || 
                               (filters.isOpenSource === 'open' && m.isOpenSource) ||
                               (filters.isOpenSource === 'closed' && !m.isOpenSource);

      return matchesSearch && matchesType && matchesScenario && matchesBudget && matchesContext && matchesOpenSource;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_low') return a.pricing.output - b.pricing.output;
      if (filters.sortBy === 'performance') return b.eloScore - a.eloScore;
      if (filters.sortBy === 'context') return b.contextWindow - a.contextWindow;
      if (filters.sortBy === 'latest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (filters.sortBy === 'popular') return b.concurrencyRating - a.concurrencyRating;
      return 0; // default (recommended)
    });
  }, [filters]);

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  const removeFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: initialFilterState[key] }));
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    return value !== initialFilterState[key as keyof FilterState];
  }).length;

  return (
    <div className="modelhub-page py-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 text-white">找大模型</h1>
        <p className="text-zinc-400 text-base max-w-2xl">覆盖主流厂商的 200+ 模型实时参数、价格与性能数据，支持多维硬核筛选。</p>
      </div>

      {/* Trends Module */}
      <div ref={trendsRef} className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-[#1ed661]" size={20} />
          <h2 className="text-xl font-bold text-white">动态趋势与行动建议</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendEvents.slice(0, 3).map(event => (
            <div key={event.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 hover:bg-zinc-800/50 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                  event.type === 'price_drop' ? "bg-green-500/10 text-green-400" :
                  event.type === 'new_release' ? "bg-[#1ed661]/10 text-[#1ed661]" :
                  "bg-purple-500/10 text-purple-400"
                )}>
                  {event.type === 'price_drop' ? '降价提醒' : event.type === 'new_release' ? '新模型发布' : '性价比之选'}
                </div>
                <span className="text-[10px] text-zinc-600 font-mono">{event.date}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 group-hover:text-[#1ed661] transition-colors">{event.title}</h3>
              <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{event.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                  {event.relatedModels?.slice(0, 2).map(mid => (
                    <div key={mid} className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                      {mid[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                <Link 
                  to={event.actionUrl} 
                  className="text-[10px] text-[#1ed661] hover:text-[#1ed661] flex items-center gap-1 font-bold"
                >
                  立即查看 <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardcore Filter Bar */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Search & AI Assist */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={10} className="text-[#1ed661]" /> 需求搜索 (支持自然语言)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                className="w-full bg-zinc-800 border border-white/10 rounded-xl h-10 pl-10 pr-10 text-xs outline-none focus:border-[#1ed661]/50 transition-all"
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              />
              <button 
                onClick={handleNaturalLanguageSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                title="AI 智能解析"
              >
                <Zap size={14} />
              </button>
            </div>
          </div>

          {/* Budget Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">最高输出预算 (¥/百万)</label>
              <span className="text-xs font-mono text-[#1ed661]">¥{filters.budgetLimit}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="200" 
              step="1"
              value={filters.budgetLimit}
              onChange={(e) => setFilters({ ...filters, budgetLimit: Number(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1ed661]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
              <span>¥0</span>
              <span>¥100</span>
              <span>¥200+</span>
            </div>
          </div>

          {/* Scenarios & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">应用场景</label>
              <select 
                className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 px-3 text-xs outline-none focus:border-[#1ed661]/50 appearance-none cursor-pointer"
                value={filters.selectedScenario}
                onChange={(e) => setFilters({ ...filters, selectedScenario: e.target.value })}
              >
                {['全部', '生成文章', '生成图片', '办公', '代码开发', '复杂推理', '客服对话'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">模态类型</label>
              <select 
                className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 px-3 text-xs outline-none focus:border-[#1ed661]/50 appearance-none cursor-pointer"
                value={filters.selectedType}
                onChange={(e) => setFilters({ ...filters, selectedType: e.target.value })}
              >
                {['全部', '纯文本', '多模态', '图像生成', '视频生成'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Context & OS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">上下文窗口</label>
              <select 
                className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 px-3 text-xs outline-none focus:border-[#1ed661]/50 appearance-none cursor-pointer"
                value={filters.contextWindow}
                onChange={(e) => setFilters({ ...filters, contextWindow: Number(e.target.value) })}
              >
                <option value="0">全部</option>
                <option value="8000">8K 以上</option>
                <option value="32000">32K 以上</option>
                <option value="128000">128K 以上</option>
                <option value="200000">200K 以上</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">开源状态</label>
              <select 
                className="w-full bg-zinc-800 border border-white/10 rounded-lg h-10 px-3 text-xs outline-none focus:border-[#1ed661]/50 appearance-none cursor-pointer"
                value={filters.isOpenSource}
                onChange={(e) => setFilters({ ...filters, isOpenSource: e.target.value })}
              >
                <option value="all">全部</option>
                <option value="open">开源可部署</option>
                <option value="closed">闭源 API</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-2">当前筛选:</span>
            {filters.searchQuery && (
              <div className="flex items-center gap-1 px-2 py-1 bg-[#1ed661]/10 border border-[#1ed661]/20 rounded-md text-[10px] text-[#1ed661]">
                搜索: {filters.searchQuery}
                <button onClick={() => removeFilter('searchQuery')}><X size={10} /></button>
              </div>
            )}
            {filters.selectedType !== '全部' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-white/10 rounded-md text-[10px] text-zinc-400">
                类型: {filters.selectedType}
                <button onClick={() => removeFilter('selectedType')}><X size={10} /></button>
              </div>
            )}
            {filters.selectedScenario !== '全部' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-white/10 rounded-md text-[10px] text-zinc-400">
                场景: {filters.selectedScenario}
                <button onClick={() => removeFilter('selectedScenario')}><X size={10} /></button>
              </div>
            )}
            {filters.budgetLimit !== 1000 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 border border-white/10 rounded-md text-[10px] text-zinc-400">
                预算: ≤¥{filters.budgetLimit}
                <button onClick={() => removeFilter('budgetLimit')}><X size={10} /></button>
              </div>
            )}
            <button 
              onClick={resetFilters}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 ml-2 transition-colors"
            >
              <RotateCcw size={10} /> 清除全部
            </button>
          </div>
        )}
      </div>

      {/* View Toggle & Count */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-500">
            找到 <span className="text-white font-mono">{filteredModels.length}</span> 个匹配模型
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">排序方式</label>
            <select 
              className="bg-transparent text-[10px] text-zinc-400 outline-none cursor-pointer hover:text-white transition-colors"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            >
              <option value="default">推荐优先</option>
              <option value="price_low">成本优先</option>
              <option value="performance">性能优先</option>
              <option value="context">上下文优先</option>
              <option value="latest">最新发布</option>
              <option value="popular">热门关注</option>
            </select>
          </div>
        </div>
        <div className="flex items-center bg-zinc-900 border border-white/5 rounded-lg p-1">
          <button 
            onClick={() => setView('list')}
            className={cn("p-1.5 rounded-md transition-colors", view === 'list' ? "bg-zinc-800 text-white shadow-sm border border-white/10" : "text-zinc-500 hover:text-zinc-300")}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setView('grid')}
            className={cn("p-1.5 rounded-md transition-colors", view === 'grid' ? "bg-zinc-800 text-white shadow-sm border border-white/10" : "text-zinc-500 hover:text-zinc-300")}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Model List */}
      {view === 'list' ? (
        <div className="space-y-2 animate-in fade-in duration-500">
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              className="group flex items-center gap-4 p-4 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-900/80 transition-all cursor-pointer"
            >
              <Link to={`/ai-models/models/${model.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border border-white/5">
                  {model.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-[#1ed661] transition-colors truncate">{model.name}</span>
                    {model.pricing.freeTier && <span className="text-[8px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full font-bold border border-green-500/20 uppercase tracking-tighter">FREE</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest truncate">{model.provider}</span>
                    <span className="text-[10px] text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-500">{model.releaseDate}</span>
                    {model.recommendationReason && (
                      <>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] text-[#1ed661]/80 italic">“{model.recommendationReason}”</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="hidden xl:flex flex-col items-start w-48">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">适合场景</span>
                <div className="flex flex-wrap gap-1">
                  {model.suitableFor.slice(0, 2).map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 bg-zinc-800/50 text-zinc-400 rounded border border-white/5">{s}</span>
                  ))}
                </div>
              </div>
              
              <div className="hidden lg:flex flex-col items-end w-24">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">上下文</span>
                <span className="text-xs font-mono text-zinc-300 tabular-nums">{model.contextWindow / 1000}K</span>
              </div>
              
              <div className="flex flex-col items-end w-32">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">输出价格</span>
                <span className="text-xs font-mono text-white tabular-nums">¥{formatPrice(model.pricing.output)}<span className="text-zinc-600 ml-0.5">/M</span></span>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={(e) => { e.preventDefault(); addToCompare(model.id); }}
                  className={cn(
                    "p-2 rounded-lg border transition-all",
                    compareList.includes(model.id) ? "bg-[#1ed661]/10 border-[#1ed661]/20 text-[#1ed661]" : "bg-zinc-800 border-white/5 text-zinc-500 hover:text-white hover:border-white/20"
                  )}
                  title="加入对比"
                >
                  <Layers size={14} />
                </button>
                <a 
                  href={model.purchaseLinks.purchase || model.officialLinks} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-zinc-600 hover:text-[#1ed661] transition-colors"
                  title="前往官网"
                >
                  <ExternalLink size={14} />
                </a>
                <Link to={`/ai-models/models/${model.id}`} className="p-2 text-zinc-600 hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
          {filteredModels.map(model => (
            <div 
              key={model.id} 
              className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/80 transition-all flex flex-col gap-4 relative group"
            >
              <Link to={`/ai-models/models/${model.id}`} className="absolute inset-0 z-0" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-sm font-bold border border-white/5">
                    {model.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-[#1ed661] transition-colors">{model.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{model.provider} · {model.releaseDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); addToCompare(model.id); }}
                    className={cn(
                      "p-2 rounded-lg border transition-all",
                      compareList.includes(model.id) ? "bg-[#1ed661]/10 border-[#1ed661]/20 text-[#1ed661]" : "bg-zinc-800 border-white/5 text-zinc-500 hover:text-white hover:border-white/20"
                    )}
                  >
                    <Layers size={14} />
                  </button>
                  <a 
                    href={model.purchaseLinks.purchase} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-zinc-800 border border-white/5 rounded-lg text-zinc-500 hover:text-[#1ed661] transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {model.recommendationReason && (
                <div className="relative z-10 bg-[#1ed661]/5 border border-[#1ed661]/10 rounded-lg p-2">
                  <div className="text-[10px] text-[#1ed661] font-bold flex items-center gap-1 mb-1">
                    <Sparkles size={10} /> 推荐理由
                  </div>
                  <div className="text-[10px] text-zinc-400 italic">“{model.recommendationReason}”</div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 relative z-10">
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full text-zinc-400">{model.modality}</span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full text-zinc-400">{model.isOpenSource ? '开源' : '闭源'}</span>
                <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full text-zinc-400">{model.contextWindow / 1000}K Context</span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 relative z-10">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Input Price</div>
                  <div className="text-sm font-mono text-zinc-300 tabular-nums">¥{formatPrice(model.pricing.input)}<span className="text-zinc-600 ml-0.5 text-[10px]">/M</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Output Price</div>
                  <div className="text-sm font-mono text-white tabular-nums">¥{formatPrice(model.pricing.output)}<span className="text-zinc-600 ml-0.5 text-[10px]">/M</span></div>
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="text-[10px] text-zinc-500 flex items-start gap-1.5">
                  <Zap size={12} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">适合：{model.suitableFor.join(' · ')}</span>
                </div>
                <div className="text-[10px] text-zinc-600 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Info size={10} />
                    <span>来源: {model.dataSource?.name || '官方'}</span>
                  </div>
                  <span>{model.dataSource?.updatedAt || model.releaseDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredModels.length === 0 && (
        <div className="py-32 text-center">
          <div className="text-zinc-600 text-lg font-medium">没有找到符合条件的模型</div>
          <button onClick={resetFilters} className="text-[#1ed661] text-sm mt-4 hover:underline">清除所有筛选条件</button>
        </div>
      )}
    </div>
  );
};
