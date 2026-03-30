import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Layers, ChevronRight, ShieldCheck, Search, Sparkles, ArrowRight, Filter, LayoutGrid, List, ChevronLeft, ExternalLink, Trophy, TrendingUp, Clock, Compass, TrendingDown } from 'lucide-react';
import { providers, models } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';
import { useCompare } from '../hooks/useCompare';

export const Providers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const placeholder = useRotatingPlaceholder();
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedScenario, setSelectedScenario] = useState('全部');
  const navigate = useNavigate();
  const { addToCompare, compareList } = useCompare();

  const modelTypes = ['全部', '对话', '生图', '嵌入', '重排序', '语音', '视频'];
  const scenarios = [
    '全部', 'RAG', '通用助手', '旗舰全能', '文案创作', '长文本处理', '数学推理', 
    'Vibe Coding', '快速响应', '多模态理解 / 识别', '语音合成', '语音交互', 
    '图像生成', '图像编辑', '视频生成', 'AIGC 内容创作', '游戏互动', 
    '角色扮演', '内容翻译', '领域知识综合'
  ];

  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === '全部' || m.modality === selectedType || (selectedType === '对话' && (m.modality === '纯文本' || m.modality === '多模态'));
      const matchesScenario = selectedScenario === '全部' || m.scenarios.includes(selectedScenario) || m.tags.includes(selectedScenario);
      return matchesSearch && matchesType && matchesScenario;
    });
  }, [searchQuery, selectedType, selectedScenario]);

  const hotModels = ['DeepSeek-R1', 'Qwen2-VL-72B-Instruct', 'GLM-4-7B', 'Kimi-k1.5', 'MiniMax-M2'];

  const shortcuts = [
    { name: '模型发现', desc: '按需求筛选合适模型', icon: Compass, path: '/ai-models/discover', color: 'text-[#1ed661]', bg: 'bg-[#1ed661]/10' },
    { name: '风云榜单', desc: '查看价格与性能趋势', icon: Trophy, path: '/ai-models/rankings', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: '深度对比', desc: '快速比较多个模型差异', icon: Layers, path: '/ai-models/compare', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: '厂商生态', desc: '查看厂商矩阵与选型建议', icon: ShieldCheck, path: '/ai-models/ecosystem', color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  // Dashboard data
  const bestValueModels = useMemo(() => [...models]
    .sort((a, b) => (a.pricing.output / a.eloScore) - (b.pricing.output / b.eloScore))
    .slice(0, 3), []);

  const recentUpdates = useMemo(() => models.slice(0, 3).map((m, i) => ({
    ...m,
    updateType: i === 0 ? 'new' : 'price_drop',
    updateLabel: i === 0 ? '新发布' : '价格下调',
    actionLabel: i === 0 ? '查看详情' : '查看替代方案'
  })), []);

  const handleShortcutClick = (path: string, name: string) => {
    if (name === '模型发现') {
      navigate('/ai-models/discover', { state: { focusSearch: true } });
    } else if (name === '风云榜单') {
      navigate('/ai-models/rankings');
    } else if (name === '深度对比') {
      if (compareList.length === 0) {
        // Add default models if pool is empty
        const defaultModels = models.slice(0, 2);
        defaultModels.forEach(m => addToCompare(m.id));
      }
      navigate('/ai-models/compare?models=gpt-4o,deepseek-v3');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="modelhub-page pb-24 font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(30,214,97,0.16),transparent_52%)]" />
        <div className="max-w-7xl mx-auto px-4 relative text-center">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-12 bg-[#1ed661]/20 rounded-2xl flex items-center justify-center border border-[#1ed661]/30">
                <Sparkles className="text-[#1ed661]" size={24} />
             </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-white">
            模型广场
          </h1>
          <p className="mx-auto max-w-3xl text-zinc-500 text-lg mb-12 leading-8">
            以 `AI百科` 的信息组织方式，把模型参数、价格、动态与厂商矩阵集中到一个入口里。先看总览，再进入发现、榜单、对比和详情页，选型路径会更顺。
          </p>

          <div className="max-w-3xl mx-auto relative group mb-8">
            <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
              <input 
                type="text" 
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none px-6 py-3 text-sm placeholder:text-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => navigate(`/ai-models/discover${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)}
                className="bg-[#1ed661] hover:bg-[#33e56f] text-black px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#1ed661]/20"
              >
                <Search size={18} />
                搜索
              </button>
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {shortcuts.map(s => (
              <button 
                key={s.name} 
                onClick={() => handleShortcutClick(s.path, s.name)}
                className="flex flex-col items-start p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-800/80 hover:border-white/10 transition-all duration-200 group text-left w-full"
              >
                <div className={cn("p-2 rounded-lg mb-3 transition-transform group-hover:scale-110", s.bg)}>
                  <s.icon className={s.color} size={20} />
                </div>
                <div className="font-bold text-sm text-white mb-1">{s.name}</div>
                <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
            <span className="text-zinc-600 font-bold uppercase tracking-widest">热门模型</span>
            {hotModels.map(m => (
              <button 
                key={m} 
                onClick={() => setSearchQuery(m)}
                className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Value Trends */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#1ed661]" size={20} />
              <h2 className="text-xl font-bold text-white">性价比趋势</h2>
            </div>
            <Link to="/ai-models/rankings" className="text-sm text-[#1ed661] hover:underline flex items-center gap-1">
              查看完整榜单 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {bestValueModels.map(model => (
              <div 
                key={model.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-sm border border-white/5">
                  {model.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{model.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{model.provider}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-mono text-green-400">¥{formatPrice(model.pricing.output)}</div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-tighter">/百万 Token</div>
                  </div>
                  <button 
                    onClick={() => addToCompare(model.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    加入对比
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-purple-400" size={20} />
            <h2 className="text-xl font-bold text-white">近期动态</h2>
          </div>
          <div className="space-y-4">
            {recentUpdates.map((update, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group/item">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center border border-white/5",
                  update.updateType === 'new' ? "bg-green-500/10 text-green-500" : "bg-[#1ed661]/10 text-[#1ed661]"
                )}>
                  {update.updateType === 'new' ? <Sparkles size={18} /> : <TrendingDown size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{update.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-zinc-400">{update.updateLabel}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {update.updateType === 'new' ? '全新旗舰模型上线，能力大幅提升' : 'API 价格下调，性价比进一步提升'}
                  </p>
                </div>
                <Link 
                  to={update.updateType === 'new' ? `/ai-models/models/${update.id}` : '/ai-models/discover'}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
                >
                  {update.actionLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2 w-20 shrink-0">模型类型</span>
            <div className="flex flex-wrap gap-2">
              {modelTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    selectedType === type 
                      ? "bg-[#1ed661]/10 border-[#1ed661]/50 text-[#1ed661]" 
                      : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-6">
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-2 w-20 shrink-0">应用场景</span>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(scenario => (
                <button
                  key={scenario}
                  onClick={() => setSelectedScenario(scenario)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    selectedScenario === scenario 
                      ? "bg-[#1ed661]/10 border-[#1ed661]/50 text-[#1ed661]" 
                      : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                  )}
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Model List Section */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            发现并使用最适合你的 AI 模型
          </h2>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <span>按默认排序</span>
              <ChevronRight size={14} className="rotate-90" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <Filter size={14} />
              <span>倒序</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredModels.map(model => {
            const provider = providers.find(p => p.id === model.provider);
            return (
              <Link 
                key={model.id}
                to={`/ai-models/models/${model.id}`}
                className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:bg-zinc-900 transition-all group flex flex-col gap-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center p-1.5 border border-white/5">
                      {provider ? (
                        <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-bold">{model.name[0]}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{provider?.name || model.provider}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border",
                    model.modality === '图像生成' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-[#1ed661]/10 text-[#1ed661] border-[#1ed661]/20"
                  )}>
                    {model.modality === '图像生成' ? '生图' : '对话'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#1ed661] transition-colors line-clamp-1">{model.name}</h3>
                  <p className="text-[10px] text-zinc-600 mt-1.5">发布时间: {model.releaseDate}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {model.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-[#1ed661]/5 text-[#1ed661]/70 text-[10px] rounded-md border border-[#1ed661]/10">{tag}</span>
                  ))}
                </div>

                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-600 uppercase tracking-tighter font-medium">输入: <span className="text-[#1ed661] font-mono">¥{model.pricing.input}</span> / 百万 Token</span>
                  </div>
                  <div className="flex flex-col text-right gap-1">
                    <span className="text-zinc-600 uppercase tracking-tighter font-medium">输出: <span className="text-purple-400 font-mono">¥{model.pricing.output}</span> / 百万 Token</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredModels.length === 0 && (
          <div className="py-32 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl">
            <div className="text-zinc-600 text-lg font-medium">没有找到符合条件的模型</div>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType('全部'); setSelectedScenario('全部'); }} 
              className="text-[#1ed661] text-sm mt-4 hover:underline"
            >
              清除所有筛选条件
            </button>
          </div>
        )}

        {/* Pagination Mockup */}
        <div className="mt-16 flex justify-center items-center gap-2">
          <button className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-600 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          {[1, 2, 3, 4, 5, 6].map(p => (
            <button key={p} className={cn(
              "w-10 h-10 rounded-lg text-sm font-bold transition-all border",
              p === 1 ? "bg-[#1ed661] border-[#1ed661] text-black" : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white"
            )}>{p}</button>
          ))}
          <button className="p-2 bg-zinc-900 border border-white/5 rounded-lg text-zinc-600 hover:text-white transition-colors"><ChevronRight size={18} /></button>
          <div className="ml-4 px-4 py-2 bg-zinc-900 border border-white/5 rounded-lg text-xs text-zinc-500 flex items-center gap-2">
            20 / page <ChevronRight size={14} className="rotate-90" />
          </div>
        </div>
      </section>

      {/* Provider Ecosystem Section - Moved to bottom */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">按系列探索，快速找到你需要的模型</h2>
          <p className="text-zinc-500 text-lg">全球领先的 AI 研发机构与算力服务商</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.slice(0, 5).map(provider => (
            <Link 
              key={provider.id} 
              to={`/ai-models/providers/${provider.id}`}
              className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-8 hover:bg-zinc-900 transition-all group relative"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center p-3 shrink-0 border border-white/5">
                  <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white group-hover:text-[#1ed661] transition-colors">{provider.name}</h2>
                  <p className="text-xs text-zinc-500 line-clamp-3 mt-2 leading-relaxed">{provider.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {models.filter(m => m.provider === provider.id).slice(0, 3).map(m => (
                  <span key={m.id} className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-500 font-medium border border-white/5">{m.name}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                <span className="flex items-center gap-2">探索系列 <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
          
          <Link 
            to="/ai-models/ecosystem"
            className="bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-[#1ed661]/50 transition-all group"
          >
            <div className="text-[#1ed661] group-hover:scale-110 transition-transform">
              <ArrowRight size={40} />
            </div>
            <span className="text-base font-bold text-zinc-400 group-hover:text-[#1ed661] transition-colors">更多系列 / 厂商查询</span>
          </Link>
        </div>
      </section>

      {/* Model Capability Ranking Table Section */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">模型能力排行榜</h2>
          <p className="text-zinc-500 text-lg">基于 MMLU、代码及数学能力的硬核排名</p>
        </div>

        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">排名</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">模型</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">厂商</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">综合 (MMLU)</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">代码 (HumanEval)</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">数学 (GSM8K)</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">稳定性</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">模态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...models]
                  .filter(m => m.performance.mmlu > 0) // Only show models with benchmark data
                  .sort((a, b) => b.performance.mmlu - a.performance.mmlu)
                  .slice(0, 10)
                  .map((model, idx) => {
                    const provider = providers.find(p => p.id === model.provider);
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    
                    return (
                      <tr key={model.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-6">
                          <span className={cn(
                            "text-sm font-mono font-bold",
                            isTop3 ? "text-orange-500" : "text-zinc-600"
                          )}>
                            {rank.toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <Link to={`/ai-models/models/${model.id}`} className="flex items-center gap-4 group/link">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-sm border border-white/5 group-hover:border-[#1ed661]/30 transition-colors">
                              {model.name[0]}
                            </div>
                            <span className="text-sm font-bold text-zinc-200 group-hover/link:text-[#1ed661] transition-colors">{model.name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{provider?.name || model.provider}</span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-mono font-bold text-zinc-300">{model.performance.mmlu}</span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-mono text-zinc-500">{model.performance.humaneval || '-'}</span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-mono text-zinc-500">{model.performance.gsm8k || '-'}</span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-mono text-zinc-400">{model.performance.avgStability}</span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <span className={cn(
                            "text-[10px] px-3 py-1 rounded-full font-bold border",
                            model.modality === '多模态' 
                              ? "bg-purple-500/5 text-purple-400 border-purple-500/20" 
                              : "bg-zinc-800 text-zinc-400 border-white/5"
                          )}>
                            {model.modality}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
