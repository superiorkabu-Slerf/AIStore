import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Compass,
  Filter,
  Gift,
  LayoutGrid,
  List,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { providers, models } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import { useCompare } from '../hooks/useCompare';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';
import { LogoAvatar } from '../components/LogoAvatar';

type ModalityFilter = '全部' | '纯文本' | '多模态' | '图像生成';
type OpenSourceFilter = '全部' | '闭源 API' | '开源可部署';
type ContextFilter = '全部' | '8K以下' | '8K-32K' | '32K-128K' | '128K+';
type SortFilter = '综合推荐' | '最新发布' | '价格最低';
type ViewMode = 'list' | 'grid';
type QuickTag = '全部' | '文本生成' | '多模态' | '图像生成' | '代码专精' | '含免费额度';
type RankingTab = '综合能力' | '代码能力' | '性价比';

const QUICK_TAGS: QuickTag[] = ['全部', '文本生成', '多模态', '图像生成', '代码专精', '含免费额度'];
const CONTEXT_OPTIONS: ContextFilter[] = ['全部', '8K以下', '8K-32K', '32K-128K', '128K+'];
const GRID_PAGE_SIZE = 8;
const LIST_PAGE_SIZE = 10;

export const Providers = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modelListRef = useRef<HTMLElement>(null);
  const { addToCompare, compareList } = useCompare();
  const placeholder = useRotatingPlaceholder();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickTag, setActiveQuickTag] = useState<QuickTag>('全部');
  const [selectedModality, setSelectedModality] = useState<ModalityFilter>('全部');
  const [selectedOpenSource, setSelectedOpenSource] = useState<OpenSourceFilter>('全部');
  const [selectedContext, setSelectedContext] = useState<ContextFilter>('全部');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState<SortFilter>('综合推荐');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [rankingTab, setRankingTab] = useState<RankingTab>('综合能力');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeQuickTag, maxPrice, minPrice, searchQuery, selectedContext, selectedModality, selectedOpenSource, sortBy, viewMode]);

  const shortcuts = [
    { name: '模型发现', desc: '按需求筛选合适模型', path: '/ai-models/discover', icon: Compass, color: 'text-[#1ed661]', bg: 'bg-[#1ed661]/10' },
    { name: '风云榜单', desc: '查看价格与性能趋势', path: '/ai-models/rankings', icon: Trophy, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { name: '深度对比', desc: '快速比较多个模型差异', path: '/ai-models/compare', icon: Sparkles, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { name: '厂商生态', desc: '查看厂商矩阵与选型建议', path: '/ai-models/ecosystem', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: '免费专区', desc: '收录国产免费模型入口', path: '/ai-models/free-zone', icon: Gift, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const handleShortcutClick = (name: string, path: string) => {
    if (name === '深度对比' && compareList.length === 0) {
      ['gpt-4o', 'deepseek-v3'].forEach(id => addToCompare(id));
      navigate('/ai-models/compare?models=gpt-4o,deepseek-v3');
      return;
    }

    navigate(path);
  };

  const handleQuickTagClick = (tag: QuickTag) => {
    setActiveQuickTag(tag);

    if (tag === '含免费额度' || tag === '代码专精' || tag === '图像生成' || tag === '多模态' || tag === '文本生成') {
      requestAnimationFrame(() => {
        modelListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveQuickTag('全部');
    setSelectedModality('全部');
    setSelectedOpenSource('全部');
    setSelectedContext('全部');
    setMinPrice(0);
    setMaxPrice(500);
    setSortBy('综合推荐');
  };

  const filteredModels = useMemo(() => {
    const list = models.filter(model => {
      const provider = providers.find(item => item.id === model.provider);
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        model.name.toLowerCase().includes(normalizedSearch) ||
        provider?.name.toLowerCase().includes(normalizedSearch) ||
        model.tags.some(tag => tag.toLowerCase().includes(normalizedSearch)) ||
        model.overview.toLowerCase().includes(normalizedSearch);

      const matchesModality =
        selectedModality === '全部' ||
        model.modality === selectedModality;

      const matchesOpenSource =
        selectedOpenSource === '全部' ||
        (selectedOpenSource === '闭源 API' && !model.isOpenSource) ||
        (selectedOpenSource === '开源可部署' && model.isOpenSource);

      const matchesContext =
        selectedContext === '全部' ||
        (selectedContext === '8K以下' && model.contextWindow > 0 && model.contextWindow < 8000) ||
        (selectedContext === '8K-32K' && model.contextWindow >= 8000 && model.contextWindow < 32000) ||
        (selectedContext === '32K-128K' && model.contextWindow >= 32000 && model.contextWindow < 128000) ||
        (selectedContext === '128K+' && model.contextWindow >= 128000);

      const matchesPrice = model.pricing.output >= minPrice && model.pricing.output <= maxPrice;

      const matchesQuickTag =
        activeQuickTag === '全部' ||
        (activeQuickTag === '文本生成' && (model.modality === '纯文本' || model.modality === '多模态')) ||
        (activeQuickTag === '多模态' && model.modality === '多模态') ||
        (activeQuickTag === '图像生成' && model.modality === '图像生成') ||
        (activeQuickTag === '代码专精' && (model.tags.includes('代码生成') || model.scenarios.includes('代码开发'))) ||
        (activeQuickTag === '含免费额度' && Boolean(model.pricing.freeTier));

      return matchesSearch && matchesModality && matchesOpenSource && matchesContext && matchesPrice && matchesQuickTag;
    });

    return list.sort((a, b) => {
      if (sortBy === '最新发布') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (sortBy === '价格最低') return a.pricing.output - b.pricing.output;

      const scoreA = a.eloScore + (a.pricing.freeTier ? 24 : 0) + (a.openaiCompatible ? 10 : 0);
      const scoreB = b.eloScore + (b.pricing.freeTier ? 24 : 0) + (b.openaiCompatible ? 10 : 0);
      return scoreB - scoreA;
    });
  }, [activeQuickTag, maxPrice, minPrice, searchQuery, selectedContext, selectedModality, selectedOpenSource, sortBy]);

  const bestValueModels = useMemo(() => {
    return [...models]
      .filter(model => model.pricing.output > 0 && model.performance.mmlu > 0)
      .sort((a, b) => (b.performance.mmlu / b.pricing.output) - (a.performance.mmlu / a.pricing.output))
      .slice(0, 3);
  }, []);

  const recentUpdates = useMemo(
    () =>
      [
        { modelId: 'deepseek-r1', updateType: 'new', updateLabel: '新发布', actionLabel: '查看详情', summary: '推理能力提升，成为热门开源推理选项。' },
        { modelId: 'gpt-4o-mini', updateType: 'price_drop', updateLabel: '价格下调', actionLabel: '查看替代方案', summary: '轻量级通用任务成本更低，适合客服和自动化。' },
        { modelId: 'deepseek-v3', updateType: 'new', updateLabel: '热度上升', actionLabel: '查看详情', summary: '中文场景和成本表现持续拉高讨论度。' },
      ]
        .map(item => {
          const model = models.find(entry => entry.id === item.modelId);
          return model ? { ...model, ...item } : null;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [],
  );

  const hotModels = useMemo(() => {
    return ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1']
      .map(id => models.find(model => model.id === id))
      .filter((model): model is NonNullable<typeof model> => Boolean(model));
  }, []);

  const topProviders = useMemo(() => providers.slice(0, 8), []);

  const rankingRows = useMemo(() => {
    const rankingSources: Record<RankingTab, { scoreLabel: string; getScore: (model: typeof models[number]) => number }> = {
      '综合能力': { scoreLabel: 'MMLU', getScore: (model) => model.performance.mmlu || 0 },
      '代码能力': { scoreLabel: 'HumanEval', getScore: (model) => model.performance.humaneval || 0 },
      '性价比': { scoreLabel: 'Value', getScore: (model) => Number((model.eloScore / Math.max(model.pricing.output, 1)).toFixed(2)) },
    };

    const source = rankingSources[rankingTab];

    return [...models]
      .filter(model => source.getScore(model) > 0)
      .sort((a, b) => source.getScore(b) - source.getScore(a))
      .slice(0, 5)
      .map(model => ({
        model,
        scoreLabel: source.scoreLabel,
        score: source.getScore(model),
      }));
  }, [rankingTab]);

  const getRankAccent = (index: number) => {
    if (index === 0) return 'text-amber-400';
    if (index === 1) return 'text-zinc-300';
    if (index === 2) return 'text-orange-400';
    return 'text-zinc-500';
  };

  const getRankMarker = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const renderCompareButton = (modelId: string) => {
    const isSelected = compareList.includes(modelId);
    return (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isSelected) addToCompare(modelId);
        }}
        className={cn(
          'text-xs transition-colors',
          isSelected ? 'text-blue-400' : 'text-zinc-500 hover:text-white'
        )}
      >
        {isSelected ? '✓ 已加入' : '加入对比'}
      </button>
    );
  };

  const handleHeroSearch = () => {
    const trimmedQuery = searchQuery.trim();
    const search = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';
    navigate(`/ai-models/discover${search}`, {
      state: {
        focusSearch: true,
        autoRecommend: Boolean(trimmedQuery),
      },
    });
  };

  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedModels = filteredModels.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="modelhub-page pb-28 font-sans">
      <section className="max-w-7xl mx-auto px-8 pt-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            <Sparkles size={12} className="text-[#1ed661]" />
            AI 模型中心
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
            找到最适合你业务的大模型
          </h1>
          <p className="mt-4 text-base text-zinc-400">覆盖 200+ 模型，实时价格、性能与跑分数据</p>

          <div className="relative mx-auto mt-10 max-w-2xl">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleHeroSearch();
                }
              }}
              placeholder={placeholder}
              className="h-16 w-full rounded-2xl border border-white/10 bg-zinc-900/80 pl-14 pr-24 text-base text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#1ed661]/35"
            />
            <button
              type="button"
              onClick={handleHeroSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
            >
              ⌘K
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleQuickTagClick(tag)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs transition-all',
                  tag === '含免费额度'
                    ? activeQuickTag === tag
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : activeQuickTag === tag
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/[0.03] text-zinc-500 border border-white/10 hover:text-zinc-300'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 mt-16 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {shortcuts.map(shortcut => (
            <button
              key={shortcut.name}
              onClick={() => handleShortcutClick(shortcut.name, shortcut.path)}
              className="w-full rounded-xl border border-white/5 bg-zinc-900/40 p-4 text-left transition-all duration-150 hover:bg-zinc-800 hover:border-white/10"
            >
              <div className={cn('mb-3 inline-flex rounded-lg p-2', shortcut.bg)}>
                <shortcut.icon size={18} className={shortcut.color} />
              </div>
              <div className="text-sm font-bold text-white">{shortcut.name}</div>
              <div className="mt-1 text-[10px] leading-5 text-zinc-500">{shortcut.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 mb-20 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#1ed661]" size={20} />
              <h2 className="text-2xl font-bold text-white">性价比趋势</h2>
            </div>
            <Link to="/ai-models/rankings" className="text-sm text-blue-400 hover:text-white transition-colors">
              查看完整榜单
            </Link>
          </div>
          <div className="space-y-4">
            {bestValueModels.map(model => (
              <div key={model.id} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-zinc-800/50">
                <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="md" className="bg-zinc-950" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{model.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {providers.find(provider => provider.id === model.provider)?.name || model.provider}
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-500 line-clamp-2">{model.positioningSummary}</p>
                </div>
                <div className="text-right">
                  <div className="tabular-nums text-sm font-medium text-white">¥{formatPrice(model.pricing.output)}/M</div>
                  <div className="text-[10px] text-zinc-600">输出价格</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-6">
          <div className="mb-6 flex items-center gap-2">
            <Clock className="text-purple-400" size={20} />
            <h2 className="text-2xl font-bold text-white">近期动态</h2>
          </div>
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-zinc-800/50">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg border border-white/5',
                  update.updateType === 'new' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-300'
                )}>
                  {update.updateType === 'new' ? <Sparkles size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-white">{update.name}</div>
                    <span className="rounded px-1.5 py-0.5 text-[10px] text-zinc-400 bg-white/[0.04]">{update.updateLabel}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-500">{update.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-sky-300" size={20} />
              <h2 className="text-2xl font-bold text-white">热门模型</h2>
            </div>
            <span className="text-sm text-zinc-500">持续热门</span>
          </div>
          <div className="space-y-4">
            {hotModels.map(model => (
              <button
                key={model.id}
                onClick={() => navigate(`/ai-models/models/${model.id}`)}
                className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-zinc-800/50"
              >
                <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="md" className="bg-zinc-950" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{model.name}</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {providers.find(provider => provider.id === model.provider)?.name || model.provider}
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-zinc-500 line-clamp-2">{model.popularityReason || model.positioningSummary}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={modelListRef} className="max-w-7xl mx-auto px-8 mb-20">
        <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">全部模型</h2>
            <p className="mt-2 text-sm text-zinc-400">按类型、开源状态、上下文与价格范围快速筛选模型。</p>
          </div>

          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value as ModalityFilter)}
                className="h-9 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none"
              >
                <option value="全部">全部</option>
                <option value="纯文本">纯文本</option>
                <option value="多模态">多模态</option>
                <option value="图像生成">图像生成</option>
              </select>
              <select
                value={selectedOpenSource}
                onChange={(e) => setSelectedOpenSource(e.target.value as OpenSourceFilter)}
                className="h-9 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none"
              >
                <option value="全部">全部</option>
                <option value="闭源 API">闭源 API</option>
                <option value="开源可部署">开源可部署</option>
              </select>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as ContextFilter)}
                className="h-9 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none"
              >
                {CONTEXT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2">
                <span className="text-xs text-zinc-500">¥{minPrice}</span>
                <div className="relative w-48">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-700" />
                  <div
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-500"
                    style={{
                      left: `${(minPrice / 500) * 100}%`,
                      right: `${100 - (maxPrice / 500) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={5}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                    className="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={5}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                    className="pointer-events-none absolute h-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
                <span className="text-xs text-zinc-500">¥{maxPrice}/M</span>
              </div>

              <button type="button" onClick={resetFilters} className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                重置筛选
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortFilter)}
                className="h-9 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-300 outline-none"
              >
                <option value="综合推荐">综合推荐</option>
                <option value="最新发布">最新发布</option>
                <option value="价格最低">价格最低</option>
              </select>

              <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn('rounded p-2 transition-colors', viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')}
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={cn('rounded p-2 transition-colors', viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>

              <div className="text-sm text-zinc-500">共 {filteredModels.length} 个模型</div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/20">
              <div className="grid grid-cols-[minmax(0,2.4fr)_120px_96px_132px_132px_118px_96px] gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                <div>模型</div>
                <div className="text-center">模态</div>
                <div className="text-center">上下文</div>
                <div className="text-right">输入</div>
                <div className="text-right">输出</div>
                <div className="text-center">标签</div>
                <div className="text-right">操作</div>
              </div>
              {paginatedModels.map(model => {
                const provider = providers.find(item => item.id === model.provider);

                return (
                  <Link
                    key={model.id}
                    to={`/ai-models/models/${model.id}`}
                    className="grid min-h-16 grid-cols-[minmax(0,2.4fr)_120px_96px_132px_132px_118px_96px] items-center gap-4 border-b border-white/5 px-5 py-3 transition-colors duration-150 hover:bg-zinc-800/50 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="sm" className="rounded-full bg-zinc-950 p-1" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{model.name}</div>
                        <div className="truncate text-xs text-zinc-500">{provider?.name || model.provider}</div>
                      </div>
                    </div>
                    <div className="justify-self-center rounded bg-white/[0.04] px-2 py-1 text-xs text-zinc-400">
                      {model.modality}
                    </div>
                    <div className="text-center text-sm text-zinc-400 tabular-nums">
                      {model.contextWindow > 0 ? `${Math.round(model.contextWindow / 1000)}K` : '-'}
                    </div>
                    <div className="text-right text-sm text-zinc-400 tabular-nums">¥{formatPrice(model.pricing.input)}/M</div>
                    <div className="text-right text-sm font-medium text-white tabular-nums">¥{formatPrice(model.pricing.output)}/M</div>
                    <div className="flex items-center justify-center gap-2">
                      {model.pricing.freeTier ? <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-xs text-green-400">免费</span> : null}
                      {model.isOpenSource ? <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-xs text-violet-400">开源</span> : null}
                    </div>
                    <div className="text-right">
                      {renderCompareButton(model.id)}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [grid-auto-rows:1fr]">
              {paginatedModels.map(model => {
                const provider = providers.find(item => item.id === model.provider);
                const isCompared = compareList.includes(model.id);

                return (
                  <Link
                    key={model.id}
                    to={`/ai-models/models/${model.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-white/5 bg-zinc-900/40 p-5 transition-all duration-150 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LogoAvatar src={model.logo || provider?.logo} alt={model.name} fallback={model.name[0]} size="sm" className="bg-zinc-950" />
                        <span className="text-xs font-bold text-zinc-400">{provider?.name || model.provider}</span>
                      </div>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-[#1ed661]/10 text-[#1ed661] border-[#1ed661]/20">
                        {model.modality}
                      </span>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-base font-bold text-white transition-colors group-hover:text-[#1ed661]">{model.name}</h3>
                      <p className="mt-2 line-clamp-3 text-xs leading-6 text-zinc-500">{model.positioningSummary}</p>
                      <p className="mt-2 text-[10px] text-zinc-600">发布时间: {model.releaseDate}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {model.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded-md border border-[#1ed661]/10 bg-[#1ed661]/5 px-2 py-1 text-[10px] text-[#1ed661]/70">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-5">
                      <div className="border-t border-white/5 pt-4 text-[11px]">
                        <div className="flex items-center justify-between text-zinc-600">
                          <span>输入</span>
                          <span className="tabular-nums text-zinc-400">¥{formatPrice(model.pricing.input)}/M</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-zinc-600">
                          <span>输出</span>
                          <span className="tabular-nums font-medium text-white">¥{formatPrice(model.pricing.output)}/M</span>
                        </div>
                        <div className="mt-4">
                          <span className={cn('text-xs transition-colors', isCompared ? 'text-blue-400' : 'text-zinc-500 hover:text-white')}>
                            {isCompared ? '✓ 已加入' : '加入对比'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {filteredModels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/20 py-24 text-center">
              <div className="text-lg font-medium text-zinc-600">没有找到符合条件的模型</div>
              <button onClick={resetFilters} className="mt-4 text-sm text-[#1ed661] hover:underline">
                清除所有筛选条件
              </button>
            </div>
          )}

          {filteredModels.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-zinc-500">
                第 {currentPageSafe} / {totalPages} 页，每页 {pageSize} 个模型
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPageSafe === 1}
                  className="inline-flex h-9 items-center rounded-lg border border-white/10 px-3 text-sm text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  上一页
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition-colors',
                      currentPageSafe === page
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                        : 'border-white/10 text-zinc-400 hover:text-white'
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPageSafe === totalPages}
                  className="inline-flex h-9 items-center rounded-lg border border-white/10 px-3 text-sm text-zinc-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">模型厂商</h2>
              <Link to="/ai-models/ecosystem" className="text-sm text-blue-400 transition-colors hover:text-white">
                查看全部厂商
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-400">横向查看主流厂商的代表模型、价格区间和模型规模。</p>
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar">
          {topProviders.map(provider => {
            const providerModels = models.filter(model => model.provider === provider.id);
            const pricedModels = providerModels.flatMap(model => [model.pricing.input, model.pricing.output]).filter(price => price > 0);
            const minProviderPrice = pricedModels.length ? Math.min(...pricedModels) : 0;
            const maxProviderPrice = pricedModels.length ? Math.max(...pricedModels) : 0;

            return (
              <Link
                key={provider.id}
                to={`/ai-models/providers/${provider.id}`}
                className="w-[260px] shrink-0 snap-start rounded-xl border border-white/5 bg-zinc-900 p-4 transition-colors duration-150 hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <LogoAvatar src={provider.logo} alt={provider.name} fallback={provider.name[0]} size="md" className="h-9 w-9 rounded-lg p-1.5 bg-zinc-950" />
                  <div className="text-base font-medium text-white">{provider.name}</div>
                </div>
                <div className="mt-3 text-sm text-zinc-400">
                  旗下 {providerModels.length} 个模型 · 价格 ¥{formatPrice(minProviderPrice)}-{formatPrice(maxProviderPrice)}/M
                </div>
                <div className="mt-3 text-xs leading-6 text-zinc-500">
                  代表: {providerModels.slice(0, 3).map(model => model.name).join(', ')}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 mb-20">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">排行榜</h2>
              <Link to="/ai-models/rankings" className="text-sm text-blue-400 transition-colors hover:text-white">
                查看完整榜单 →
              </Link>
            </div>
            <p className="mt-2 text-sm text-zinc-400">挑出最值得关注的 Top 5 模型，快速感知综合能力、代码能力与性价比。</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5">
              {(['综合能力', '代码能力', '性价比'] as RankingTab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRankingTab(tab)}
                  className={cn(
                    'border-b-2 pb-2 text-sm transition-colors',
                    rankingTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="text-xs text-zinc-600">更新于 2025-01-15</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30">
          {rankingRows.map((entry, index) => {
            const provider = providers.find(item => item.id === entry.model.provider);

            return (
              <button
                key={entry.model.id}
                type="button"
                onClick={() => navigate(`/ai-models/models/${entry.model.id}`)}
                className="grid w-full grid-cols-[90px_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_100px] items-center gap-4 border-b border-white/5 px-6 py-4 text-left transition-colors hover:bg-zinc-800/50 last:border-b-0"
              >
                <div className={cn('text-base font-medium', getRankAccent(index))}>
                  {getRankMarker(index)} {index + 1}
                </div>
                <div className="text-sm font-medium text-white truncate">{entry.model.name}</div>
                <div className="text-sm text-zinc-500 truncate">{provider?.name || entry.model.provider}</div>
                <div className="text-sm text-zinc-400">
                  {entry.scoreLabel} <span className="tabular-nums text-zinc-200">{entry.score}</span>
                </div>
                <div className="text-sm font-medium text-white tabular-nums">{entry.model.eloScore}</div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
