import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, MapPin, ShieldCheck, Layers, ChevronRight, Info, History, LayoutGrid, CheckCircle2, Globe, Cpu, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { providers, models, trendEvents } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import { useCompare } from '../contexts/CompareContext';

export const ProviderDetail = () => {
  const { id } = useParams();
  const provider = providers.find(p => p.id === id);
  const providerModels = models.filter(m => m.provider === id);
  const { addToCompare } = useCompare();

  if (!provider) return <div className="p-20 text-center text-zinc-500">厂商不存在</div>;

  const minPrice = providerModels.length > 0 ? Math.min(...providerModels.map(m => m.pricing.input)) : 0;
  const maxContext = providerModels.length > 0 ? Math.max(...providerModels.map(m => m.contextWindow)) : 0;

  // Group models by use case
  const groupedModels = {
    '复杂任务': providerModels.filter(m => m.modelType === '旗舰模型' || m.tags.includes('推理')),
    '低成本调用': providerModels.filter(m => m.modelType === '轻量模型' || m.pricing.input < 10),
    '推理任务': providerModels.filter(m => m.tags.includes('推理') || m.name.toLowerCase().includes('r1') || m.name.toLowerCase().includes('o1')),
    '多模态任务': providerModels.filter(m => m.modality === '多模态'),
  };

  const providerEvents = trendEvents.filter(e => e.modelId && models.find(m => m.id === e.modelId)?.provider === id);

  return (
    <div className="modelhub-page py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
        <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center p-4 shrink-0 border border-white/5 shadow-2xl shadow-[#1ed661]/5">
          <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white tracking-tighter">{provider.name}</h1>
            <a 
              href={provider.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:border-white/20 transition-all"
            >
              访问官网 <ExternalLink size={14} />
            </a>
          </div>
          <p className="text-[#1ed661] text-sm font-bold mb-4 flex items-center gap-2">
            <Sparkles size={14} />
            {provider.positioningSummary}
          </p>
          <p className="text-zinc-400 text-lg mb-8 max-w-3xl leading-relaxed">
            {provider.description}
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500 mb-8">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-zinc-700" />
              {provider.region}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-zinc-700" />
              {provider.compliance}
            </div>
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-zinc-700" />
              融资阶段：<span className="text-zinc-300 font-mono">{provider.funding}</span>
            </div>
          </div>

          {/* Capability Tags */}
          <div className="flex flex-wrap gap-2">
            {provider.capabilityTags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-1 bg-zinc-900 border border-white/5 rounded-lg text-zinc-400 font-bold uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { label: '模型总数', value: providerModels.length, icon: Cpu },
          { label: '最低价格 (¥/百万)', value: `¥${formatPrice(minPrice)}`, icon: Layers },
          { label: '最大上下文', value: `${maxContext / 1000}K`, icon: Globe },
          { label: '合规认证', value: provider.compliance, icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-2">
              <stat.icon size={12} /> {stat.label}
            </div>
            <div className="text-xl font-bold text-white font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Model Matrix - Grouped by Use Case */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <LayoutGrid className="text-[#1ed661]" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">模型矩阵</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(groupedModels).map(([group, models]) => {
            if (models.length === 0) return null;
            return (
              <div key={group} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                  {group}
                  <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{models.length}</span>
                </h3>
                <div className="space-y-4">
                  {models.map(m => (
                    <Link key={m.id} to={`/ai-models/models/${m.id}`} className="flex items-center justify-between group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-[#1ed661] transition-colors">{m.name}</span>
                        <span className="text-[10px] text-zinc-600">{m.contextWindow / 1000}K 上下文</span>
                      </div>
                      <ChevronRight size={14} className="text-zinc-800 group-hover:text-zinc-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection Suggestions */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="text-green-400" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">选型建议</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerModels.slice(0, 2).map((m, i) => (
            <div key={m.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-lg font-bold border border-white/5">
                    {m.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{m.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{i === 0 ? '适合高精度复杂任务' : '适合大规模低成本调用'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => addToCompare(m.id)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  加入对比
                </button>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {m.recommendationReason}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <Link to={`/ai-models/models/${m.id}`} className="text-[#1ed661] text-sm font-bold hover:underline">查看详情</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline - Version and Price Dynamics */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <History className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">版本与价格动态</h2>
        </div>
        <div className="relative pl-8 border-l border-white/10 space-y-12">
          {providerEvents.length > 0 ? providerEvents.map((event, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-purple-500" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-zinc-500 mb-1">{event.date}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-zinc-400 max-w-2xl">{event.reason}</p>
                </div>
                <Link 
                  to={event.actionUrl}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all whitespace-nowrap"
                >
                  {event.ctaLabel}
                </Link>
              </div>
            </div>
          )) : (
            <div className="text-zinc-600 text-sm">暂无近期动态</div>
          )}
        </div>
      </div>

      {/* All Models List */}
      <div className="mb-16">
        <h3 className="text-lg font-bold text-white tracking-tight mb-6">全部模型列表</h3>
        <div className="grid grid-cols-1 gap-3">
          {providerModels.map(model => (
            <Link 
              key={model.id} 
              to={`/ai-models/models/${model.id}`}
              className="group flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all"
            >
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border border-white/5">
                {model.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate">{model.name}</span>
                  {model.pricing.freeTier && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">免费</span>}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{model.modality} · {model.releaseDate}</div>
              </div>
              <div className="hidden md:flex flex-col items-end w-24">
                <span className="text-[10px] px-2 py-0.5 bg-[#1ed661]/10 text-[#1ed661] rounded font-bold uppercase tracking-tighter">{model.modality}</span>
              </div>
              <div className="hidden lg:flex flex-col items-end w-24">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">上下文</span>
                <span className="text-sm font-bold font-mono text-zinc-300">{model.contextWindow / 1000}K</span>
              </div>
              <div className="flex flex-col items-end w-28">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">输入价格</span>
                <span className="text-sm font-bold font-mono text-zinc-300">¥{formatPrice(model.pricing.input)}/百万</span>
              </div>
              <ChevronRight size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
