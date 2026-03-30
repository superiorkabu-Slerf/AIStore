import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { models, providers } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import { Zap, Trophy, DollarSign, Gem, BarChart3, ChevronRight } from 'lucide-react';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

export const Rankings = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const navigate = useNavigate();

  const tabs = [
    { id: 'performance', name: '综合性能', icon: Trophy, label: 'Performance' },
    { id: 'speed', name: '极速推理', icon: Zap, label: 'Speed' },
    { id: 'cost', name: '极致成本', icon: DollarSign, label: 'Cost' },
    { id: 'value', name: '性价比', icon: Gem, label: 'Value' },
    { id: 'visuals', name: '全景视图', icon: BarChart3, label: 'Visuals' },
  ];

  const sortedModels = useMemo(() => {
    const list = [...models];
    switch (activeTab) {
      case 'performance':
        return list.sort((a, b) => b.performance.mmlu - a.performance.mmlu);
      case 'speed':
        return list.sort((a, b) => b.speed.tps - a.speed.tps);
      case 'cost':
        return list.sort((a, b) => a.pricing.output - b.pricing.output);
      case 'value':
        return list.sort((a, b) => (b.performance.mmlu / (b.pricing.output || 0.1)) - (a.performance.mmlu / (a.pricing.output || 0.1)));
      default:
        return list;
    }
  }, [activeTab]);

  const chartData = models.map(m => ({
    name: m.name,
    price: m.pricing.output,
    score: m.performance.mmlu,
    context: m.contextWindow / 1000,
    provider: m.provider,
    id: m.id
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-white/10 p-3 rounded-lg shadow-2xl text-xs">
          <div className="font-bold text-white mb-1">{data.name}</div>
          <div className="text-zinc-400">输出价格: ¥{data.price}/M</div>
          <div className="text-zinc-400">MMLU 跑分: {data.score}</div>
          <div className="text-zinc-400">上下文: {data.context}K</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modelhub-page py-4">
      <SubpageHero
        badge="风云榜单"
        title="模型风云榜"
        description="基于真实跑分、上下文长度、吞吐表现与计费数据做多维排序，帮助你快速判断性能、成本和性价比。"
        icon={Trophy}
      />
      <SubpageIntro
        title="风云榜单"
        description="从综合能力、速度、成本和性价比多个维度查看模型排名，快速判断谁更强、谁更省，以及不同模型分别适合什么任务。"
        highlights={['看综合能力排行', '切换成本与速度视角', '查看全景分布图']}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-zinc-900/50 border border-white/5 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-zinc-800 text-white shadow-sm border border-white/10" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            )}
          >
            <tab.icon size={16} />
            <span>{tab.name}</span>
            <span className="text-[10px] opacity-40 uppercase tracking-widest hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'visuals' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">性价比全景分布图</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" /> <span className="text-zinc-400">高性价比区</span></div>
              <div className="text-zinc-500">X轴: 价格 (¥/M) | Y轴: MMLU 跑分 | 气泡: Context 长度</div>
            </div>
          </div>
          <div className="h-[600px] bg-zinc-900/30 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-green-500/5 pointer-events-none border-br border-white/5" />
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  type="number" 
                  dataKey="price" 
                  name="价格" 
                  unit="¥" 
                  stroke="#3F3F46" 
                  fontSize={11}
                  tickFormatter={(v) => `¥${v}`}
                />
                <YAxis 
                  type="number" 
                  dataKey="score" 
                  name="跑分" 
                  domain={[80, 95]} 
                  stroke="#3F3F46" 
                  fontSize={11}
                />
                <ZAxis type="number" dataKey="context" range={[100, 1000]} name="上下文" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3F3F46' }} />
                <ReferenceArea {...({ x1: 0, x2: 20, y1: 88, y2: 95, fill: "#22C55E", fillOpacity: 0.05 } as any)} />
                <Scatter name="Models" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.provider === 'openai' ? '#3B82F6' : 
                        entry.provider === 'anthropic' ? '#F59E0B' : 
                        entry.provider === 'deepseek' ? '#22C55E' : '#A855F7'
                      } 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/ai-models/models/${entry.id}`)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden animate-in fade-in duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-16">Rank</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Provider</th>
                
                {activeTab === 'performance' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Best (MMLU)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Stability</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Modality</th>
                  </>
                )}

                {activeTab === 'speed' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">TTFT (ms)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">TPS (Tokens/s)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Concurrency</th>
                  </>
                )}

                {activeTab === 'cost' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Input (¥/M)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Output (¥/M)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Free Tier</th>
                  </>
                )}

                {activeTab === 'value' && (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">MMLU</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Price (Out)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right text-green-400">Value Index</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedModels.map((model, index) => (
                <tr 
                  key={model.id} 
                  className="hover:bg-zinc-900/80 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/ai-models/models/${model.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-mono text-xs font-bold",
                      index === 0 ? "text-yellow-500" : index === 1 ? "text-zinc-300" : index === 2 ? "text-amber-600" : "text-zinc-600"
                    )}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="sm" className="rounded-md bg-zinc-950" />
                      <span className="text-sm font-medium text-white group-hover:text-[#1ed661] transition-colors">{model.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{providers.find(provider => provider.id === model.provider)?.name || model.provider}</span>
                  </td>

                  {activeTab === 'performance' && (
                    <>
                      <td className="px-6 py-4 text-right font-mono text-sm text-white tabular-nums">{model.performance.mmlu}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-zinc-400 tabular-nums">{model.performance.avgStability}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-white/5 rounded-full text-zinc-400">{model.modality}</span>
                      </td>
                    </>
                  )}

                  {activeTab === 'speed' && (
                    <>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400 tabular-nums">{model.speed.ttft}ms</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-white tabular-nums">{model.speed.tps}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("w-1 h-3 rounded-sm", i < model.concurrencyRating ? "bg-[#1ed661]" : "bg-zinc-800")} />
                          ))}
                        </div>
                      </td>
                    </>
                  )}

                  {activeTab === 'cost' && (
                    <>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400 tabular-nums">¥{formatPrice(model.pricing.input)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-white tabular-nums">¥{formatPrice(model.pricing.output)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border",
                          model.pricing.freeTier ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-zinc-800 border-white/5 text-zinc-500"
                        )}>
                          {model.pricing.freeTier || "None"}
                        </span>
                      </td>
                    </>
                  )}

                  {activeTab === 'value' && (
                    <>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400 tabular-nums">{model.performance.mmlu}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-zinc-400 tabular-nums">¥{formatPrice(model.pricing.output)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-green-400 tabular-nums">
                        {(model.performance.mmlu / (model.pricing.output || 0.1)).toFixed(2)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
