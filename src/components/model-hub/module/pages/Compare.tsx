import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Plus, Search, Check, Copy, Download, Share2, Star, Layers, Filter, Zap, DollarSign, Sparkles, TrendingUp, Info, ChevronRight, Scale, Trophy } from 'lucide-react';
import { models, providers } from '../constants';
import { cn, formatPrice, formatNumber } from '../lib/utils';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

export const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIds = searchParams.get('models')?.split(',').filter(Boolean) || [];
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Smart Toggles
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary');
  const [focusPrice, setFocusPrice] = useState(false);
  const [focusPerformance, setFocusPerformance] = useState(false);

  const selectedModels = useMemo(() => {
    return selectedIds.map(id => models.find(m => m.id === id)).filter(Boolean);
  }, [selectedIds]);

  const recommendations = useMemo(() => {
    if (selectedModels.length < 2) return null;

    const sortedByPrice = [...selectedModels].sort((a, b) => a!.pricing.output - b!.pricing.output);
    const sortedByPerformance = [...selectedModels].sort((a, b) => (b!.performance?.mmlu || 0) - (a!.performance?.mmlu || 0));
    
    // Balanced: High performance but reasonable price
    const balanced = [...selectedModels].sort((a, b) => {
      const scoreA = (a!.performance?.mmlu || 0) / (a!.pricing.output || 0.1);
      const scoreB = (b!.performance?.mmlu || 0) / (b!.pricing.output || 0.1);
      return scoreB - scoreA;
    })[0];

    return {
      cheapest: sortedByPrice[0],
      best: sortedByPerformance[0],
      balanced: balanced
    };
  }, [selectedModels]);

  const addModel = (id: string) => {
    if (selectedIds.length >= 4) return;
    if (selectedIds.includes(id)) return;
    const newIds = [...selectedIds, id];
    setSearchParams({ models: newIds.join(',') });
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const removeModel = (id: string) => {
    const newIds = selectedIds.filter(s => s !== id);
    if (newIds.length === 0) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('models');
      setSearchParams(newParams);
    } else {
      setSearchParams({ models: newIds.join(',') });
    }
  };

  const filteredModels = models.filter(m => 
    !selectedIds.includes(m.id) && 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getValue = (model: any, path: string) => {
    return path.split('.').reduce((obj, key) => obj?.[key], model);
  };

  const getBestValue = (key: string, type: 'min' | 'max') => {
    if (selectedModels.length < 2) return null;
    const values = selectedModels.map(m => getValue(m, key)).filter(v => typeof v === 'number');
    if (values.length === 0) return null;
    return type === 'min' ? Math.min(...values) : Math.max(...values);
  };

  const comparisonRows = [
    { label: '厂商', key: 'provider', group: '基础', isSummary: true },
    { label: '发布日期', key: 'releaseDate', group: '基础', isSummary: false },
    { label: '模态', key: 'modality', group: '基础', isSummary: true },
    { label: '上下文窗口', key: 'contextWindow', group: '基础', type: 'max', format: (v: number) => `${v / 1000}K`, isSummary: true },
    
    { label: '输入价格/M', key: 'pricing.input', group: '价格', type: 'min', format: (v: number) => `¥${formatPrice(v)}`, isSummary: true },
    { label: '输出价格/M', key: 'pricing.output', group: '价格', type: 'min', format: (v: number) => `¥${formatPrice(v)}`, isSummary: true },
    { label: '免费额度', key: 'pricing.freeTier', group: '价格', isSummary: false },
    
    { label: 'MMLU 跑分', key: 'performance.mmlu', group: '性能', type: 'max', isSummary: true },
    { label: 'HumanEval', key: 'performance.humaneval', group: '性能', type: 'max', isSummary: false },
    { label: '平均稳定性', key: 'performance.avgStability', group: '性能', type: 'max', isSummary: false },
    
    { label: '首字延迟 (TTFT)', key: 'speed.ttft', group: '速度', type: 'min', format: (v: number) => `${v}ms`, isSummary: true },
    { label: '生成速度 (TPS)', key: 'speed.tps', group: '速度', type: 'max', isSummary: true },
    { label: '并发评级', key: 'concurrencyRating', group: '速度', type: 'max', format: (v: number) => `${v}/5`, isSummary: false },
    
    { label: 'OpenAI 兼容', key: 'openaiCompatible', group: '能力', format: (v: boolean) => v ? '✅ 原生' : '❌ 不支持', isSummary: true },
  ];

  const visibleRows = useMemo(() => {
    let rows = comparisonRows;
    
    if (viewMode === 'summary') {
      rows = rows.filter(row => row.isSummary);
    }

    if (showDiffOnly && selectedModels.length > 1) {
      rows = rows.filter(row => {
        const values = selectedModels.map(m => getValue(m, row.key));
        return !values.every(v => JSON.stringify(v) === JSON.stringify(values[0]));
      });
    }

    if (focusPrice) {
      rows = rows.filter(row => row.group === '价格' || row.group === '基础');
    }

    if (focusPerformance) {
      rows = rows.filter(row => row.group === '性能' || row.group === '速度' || row.group === '基础');
    }

    return rows;
  }, [showDiffOnly, focusPrice, focusPerformance, viewMode, selectedModels]);

  return (
    <div className="modelhub-page py-4">
      <SubpageHero
        badge="深度对比"
        title="模型深度对比"
        description="横向比较模型的价格、性能、上下文与兼容性，从多个维度快速选出最适合当前业务的组合。"
        icon={Layers}
      />
      <SubpageIntro
        title="深度对比"
        description="把多个模型放在同一张对比表里查看价格、性能、上下文和兼容性差异，适合做方案评估、预算平衡和最终选型。"
        highlights={['横向比较多个模型', '聚焦价格或性能', '快速找到差异项']}
      />

      {/* Recommendation Cards */}
      {recommendations && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-[#1ed661]" size={20} />
            <h2 className="text-xl font-bold text-white">智能决策建议</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: 'cost', title: '最低成本建议', model: recommendations.cheapest, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/10', desc: '在当前选择中，该模型拥有最低的 API 调用成本。' },
              { type: 'balanced', title: '均衡性价比建议', model: recommendations.balanced, icon: Scale, color: 'text-[#1ed661]', bg: 'bg-[#1ed661]/5', border: 'border-[#1ed661]/10', desc: '性能与价格的最佳平衡点，适合大多数通用业务场景。' },
              { type: 'performance', title: '最高性能建议', model: recommendations.best, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/10', desc: '不计成本，追求极致的推理能力与生成质量。' },
            ].map(rec => (
              <div key={rec.type} className={cn("p-6 rounded-2xl border flex flex-col gap-4", rec.bg, rec.border)}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-zinc-900 border border-white/5", rec.color)}>
                    <rec.icon size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <LogoAvatar src={rec.model?.logo} alt={rec.model?.name || ''} fallback={rec.model?.name?.[0] || '?'} size="md" className="bg-zinc-950" />
                  <div>
                    <div className="text-sm font-bold text-white">{rec.model?.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      {providers.find(provider => provider.id === rec.model?.provider)?.name || rec.model?.provider}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{rec.desc}</p>
                <Link to={`/ai-models/models/${rec.model?.id}`} className="mt-auto text-xs font-bold text-[#1ed661] hover:text-[#1ed661] flex items-center gap-1">
                  查看详情 <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection & Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-3">
          {selectedModels.map(model => (
            <div key={model!.id} className="flex items-center gap-2 px-3 h-10 bg-zinc-900 border border-white/10 rounded-full group">
              <LogoAvatar src={model!.logo} alt={model!.name} fallback={model!.name[0]} size="sm" className="rounded-full bg-zinc-950" />
              <span className="text-sm font-medium text-white">{model!.name}</span>
              <button 
                onClick={() => removeModel(model!.id)}
                className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {selectedModels.length < 4 && (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 h-10 bg-zinc-900/50 border border-dashed border-white/10 rounded-full text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all"
            >
              <Plus size={16} />
              <span className="text-sm font-medium">添加模型</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 p-1 bg-zinc-900/50 border border-white/5 rounded-xl w-fit">
          <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 mr-2">
            <button 
              onClick={() => setViewMode('summary')}
              className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", viewMode === 'summary' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              精简视图
            </button>
            <button 
              onClick={() => setViewMode('full')}
              className={cn("px-3 py-1 rounded-md text-[10px] font-bold transition-all", viewMode === 'full' ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              完整视图
            </button>
          </div>
          <div className="w-px h-4 bg-white/5 mx-1" />
          <button 
            onClick={() => setShowDiffOnly(!showDiffOnly)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              showDiffOnly ? "bg-zinc-800 text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Filter size={14} />
            仅看差异
          </button>
          <div className="w-px h-4 bg-white/5 mx-1" />
          <button 
            onClick={() => { setFocusPrice(!focusPrice); setFocusPerformance(false); }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              focusPrice ? "bg-zinc-800 text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <DollarSign size={14} />
            侧重价格
          </button>
          <button 
            onClick={() => { setFocusPerformance(!focusPerformance); setFocusPrice(false); }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              focusPerformance ? "bg-zinc-800 text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Zap size={14} />
            侧重性能
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      {selectedModels.length > 0 ? (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-14 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-48 sticky left-0 bg-zinc-950/80 backdrop-blur-md z-30">Dimension</th>
                {selectedModels.map(model => (
                  <th key={model!.id} className="px-6 py-8 min-w-[200px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-xs font-bold border border-white/5">{model!.name[0]}</div>
                        <div className="text-sm font-bold text-white">{model!.name}</div>
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{model!.provider}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleRows.map((row, i) => {
                const isFirstInGroup = i === 0 || visibleRows[i-1].group !== row.group;
                const bestValue = row.type ? getBestValue(row.key, row.type as any) : null;

                return (
                  <React.Fragment key={row.label}>
                    {isFirstInGroup && (
                      <tr className="bg-zinc-900/20">
                        <td colSpan={selectedModels.length + 1} className="px-6 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          {row.group}
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-zinc-900/50 transition-colors group">
                      <td className="px-6 py-4 text-xs text-zinc-400 font-medium sticky left-0 bg-zinc-950/80 backdrop-blur-md z-10 border-r border-white/5">
                        {row.label}
                      </td>
                      {selectedModels.map(model => {
                        const val = getValue(model, row.key);
                        const isBest = bestValue !== null && val === bestValue;
                        const displayVal = row.format ? (row.format as any)(val) : (val || '—');

                        return (
                          <td key={model!.id} className={cn(
                            "px-6 py-4 text-sm tabular-nums transition-all",
                            isBest ? "text-green-400 font-bold bg-green-500/5" : "text-zinc-300"
                          )}>
                            <div className="flex items-center gap-1.5">
                              {displayVal}
                              {isBest && <span className="text-[10px] text-green-500 animate-pulse">✦</span>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-32 bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
            <Layers className="text-zinc-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">暂未选择对比模型</h2>
          <p className="text-zinc-500 mb-10 max-w-xs text-sm leading-relaxed">请从上方添加 2-4 个模型进行深度参数对比，我们将为您高亮最优选。</p>
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
          >
            <Plus size={18} /> 立即添加
          </button>
        </div>
      )}

      {/* Actions */}
      {selectedModels.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-all">
            <Download size={14} /> 导出为图片 (PNG)
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-all"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('链接已复制', {
                description: '您可以直接分享给他人查看此对比。'
              });
            }}
          >
            <Share2 size={14} /> 分享对比链接
          </button>
        </div>
      )}

      {/* Add Model Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 h-16 border-b border-white/5">
              <Search className="text-zinc-500 mr-3" size={20} />
              <input 
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 text-base"
                placeholder="搜索模型名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredModels.map(m => (
                <button 
                  key={m.id}
                  onClick={() => addModel(m.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-left group"
                >
                  <LogoAvatar src={m.logo} alt={m.name} fallback={m.name[0]} size="md" className="group-hover:border-white/10 transition-all bg-zinc-950" />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white group-hover:text-[#1ed661] transition-colors">{m.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{providers.find(provider => provider.id === m.provider)?.name || m.provider}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-white/20 transition-all">
                    <Plus size={16} />
                  </div>
                </button>
              ))}
              {filteredModels.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-zinc-600 text-sm font-medium">未找到可用模型</div>
                  <div className="text-zinc-700 text-xs mt-1">尝试搜索其他关键词</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
