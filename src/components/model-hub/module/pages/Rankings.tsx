import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import { models, providers } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import { Zap, Trophy, DollarSign, Gem, BarChart3, Database, Clock3 } from 'lucide-react';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

type RankingSectionId = 'performance' | 'speed' | 'cost' | 'value';

type RankingSection = {
  id: RankingSectionId;
  title: string;
  description: string;
  icon: typeof Trophy;
  sourceHint: string;
};

const rankingSections: RankingSection[] = [
  {
    id: 'performance',
    title: '综合性能',
    description: '优先看模型的综合能力与稳定性，适合做高质量输出和复杂任务选型。',
    icon: Trophy,
    sourceHint: '基于模型公开基准、厂商技术报告与榜单内置 ELO 综合整理。',
  },
  {
    id: 'speed',
    title: '极速推理',
    description: '关注首字延迟与吞吐速度，更适合客服、Agent 和实时交互类场景。',
    icon: Zap,
    sourceHint: '基于平台实测与公开性能指标整理，重点反映响应速度表现。',
  },
  {
    id: 'cost',
    title: '极致成本',
    description: '从调用价格角度看模型排序，帮助你快速找到更省预算的方案。',
    icon: DollarSign,
    sourceHint: '基于厂商公开计费标准整理，价格单位统一为每百万 Token。',
  },
  {
    id: 'value',
    title: '性价比',
    description: '结合能力和价格做横向比较，适合做生产环境里的投入产出判断。',
    icon: Gem,
    sourceHint: '按能力分数和价格比值估算，仅用于横向对比，不代表唯一决策标准。',
  },
];

const getSortedModels = (sectionId: RankingSectionId) => {
  const list = [...models];

  switch (sectionId) {
    case 'performance':
      return list
        .filter(model => model.performance.mmlu > 0)
        .sort((a, b) => b.performance.mmlu - a.performance.mmlu);
    case 'speed':
      return list
        .filter(model => model.speed.tps > 0)
        .sort((a, b) => b.speed.tps - a.speed.tps);
    case 'cost':
      return list.sort((a, b) => a.pricing.output - b.pricing.output);
    case 'value':
      return list
        .filter(model => model.performance.mmlu > 0)
        .sort((a, b) => (b.performance.mmlu / (b.pricing.output || 0.1)) - (a.performance.mmlu / (a.pricing.output || 0.1)));
    default:
      return list;
  }
};

const getSourceNames = (list: typeof models) => {
  return Array.from(
    new Set(
      list
        .map(model => model.dataSource?.name)
        .filter((value): value is string => Boolean(value))
    )
  ).slice(0, 4);
};

const getLatestUpdatedAt = (list: typeof models) => {
  const dates = list
    .map(model => model.dataSource?.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return dates[0] || '2025-01-20';
};

export const Rankings = () => {
  const navigate = useNavigate();

  const sectionData = useMemo(
    () =>
      rankingSections.map(section => {
        const rankedModels = getSortedModels(section.id).slice(0, 10);
        return {
          ...section,
          rankedModels,
          sourceNames: getSourceNames(rankedModels),
          latestUpdatedAt: getLatestUpdatedAt(rankedModels),
        };
      }),
    []
  );

  const chartData = useMemo(
    () =>
      models.map(model => ({
        name: model.name,
        price: model.pricing.output,
        score: model.performance.mmlu,
        context: model.contextWindow / 1000,
        provider: model.provider,
        id: model.id,
      })),
    []
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-white/10 bg-zinc-900 p-3 text-xs shadow-2xl">
        <div className="mb-1 font-bold text-white">{data.name}</div>
        <div className="text-zinc-400">输出价格: ¥{data.price}/M</div>
        <div className="text-zinc-400">MMLU 跑分: {data.score}</div>
        <div className="text-zinc-400">上下文: {data.context}K</div>
      </div>
    );
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
        description="参考 Arena Leaderboard 的信息组织方式，但改成更适合当前项目的分维度展示。每个维度单独成块展示，用户可以更直接地理解每张榜单在比什么。"
        highlights={['按维度分块展示', '每块单独标注数据来源', '每块单独标注更新时间']}
      />

      <div className="space-y-10">
        {sectionData.map(section => (
          <section key={section.id} className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <section.icon size={22} className="text-[#1ed661]" />
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">{section.description}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                    <Database size={13} className="text-sky-300" />
                    数据来源
                  </div>
                  <p className="mt-2 text-xs leading-6 text-zinc-400">{section.sourceHint}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {section.sourceNames.map(source => (
                      <span key={source} className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] text-zinc-400">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                    <Clock3 size={13} className="text-amber-300" />
                    最近更新
                  </div>
                  <div className="mt-3 text-xl font-bold text-white">{section.latestUpdatedAt}</div>
                  <p className="mt-2 text-xs leading-6 text-zinc-400">该维度榜单按当前收录数据中的最近更新时间展示。</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-zinc-900/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-16">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Provider</th>

                    {section.id === 'performance' && (
                      <>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">MMLU</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Stability</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Modality</th>
                      </>
                    )}

                    {section.id === 'speed' && (
                      <>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">TTFT</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">TPS</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Concurrency</th>
                      </>
                    )}

                    {section.id === 'cost' && (
                      <>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Input</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Output</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Free Tier</th>
                      </>
                    )}

                    {section.id === 'value' && (
                      <>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">MMLU</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-zinc-500">Output</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-green-400">Value Index</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {section.rankedModels.map((model, index) => {
                    const provider = providers.find(item => item.id === model.provider);

                    return (
                      <tr
                        key={model.id}
                        className="cursor-pointer transition-colors hover:bg-zinc-900/80"
                        onClick={() => navigate(`/ai-models/models/${model.id}`)}
                      >
                        <td className="px-6 py-4">
                          <span className={cn(
                            'font-mono text-xs font-bold',
                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-zinc-600'
                          )}>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="sm" className="rounded-md bg-zinc-950" />
                            <span className="text-sm font-medium text-white">{model.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs uppercase tracking-wider text-zinc-500">{provider?.name || model.provider}</span>
                        </td>

                        {section.id === 'performance' && (
                          <>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-white">{model.performance.mmlu}</td>
                            <td className="px-6 py-4 text-right font-mono text-xs tabular-nums text-zinc-400">{model.performance.avgStability}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="rounded-full border border-white/5 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{model.modality}</span>
                            </td>
                          </>
                        )}

                        {section.id === 'speed' && (
                          <>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-zinc-400">{model.speed.ttft}ms</td>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-white">{model.speed.tps}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-0.5">
                                {[...Array(5)].map((_, barIndex) => (
                                  <div
                                    key={barIndex}
                                    className={cn('h-3 w-1 rounded-sm', barIndex < model.concurrencyRating ? 'bg-[#1ed661]' : 'bg-zinc-800')}
                                  />
                                ))}
                              </div>
                            </td>
                          </>
                        )}

                        {section.id === 'cost' && (
                          <>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-zinc-400">¥{formatPrice(model.pricing.input)}</td>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-white">¥{formatPrice(model.pricing.output)}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={cn(
                                'rounded-full border px-2 py-0.5 text-[10px]',
                                model.pricing.freeTier ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-white/5 bg-zinc-800 text-zinc-500'
                              )}>
                                {model.pricing.freeTier || 'None'}
                              </span>
                            </td>
                          </>
                        )}

                        {section.id === 'value' && (
                          <>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-zinc-400">{model.performance.mmlu}</td>
                            <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-zinc-400">¥{formatPrice(model.pricing.output)}</td>
                            <td className="px-6 py-4 text-right font-mono text-sm font-bold tabular-nums text-green-400">
                              {(model.performance.mmlu / (model.pricing.output || 0.1)).toFixed(2)}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <BarChart3 size={22} className="text-sky-300" />
                <h2 className="text-2xl font-bold text-white">全景视图</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
                用一张分布图同时看价格、MMLU 跑分和上下文窗口，快速判断不同模型落在什么区间。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Database size={13} className="text-sky-300" />
                <span>来源：{getSourceNames(models).join(' / ')}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Clock3 size={13} className="text-amber-300" />
                <span>更新：{getLatestUpdatedAt(models)}</span>
              </div>
            </div>
          </div>

          <div className="h-[600px] overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30 p-8">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  type="number"
                  dataKey="price"
                  name="价格"
                  unit="¥"
                  stroke="#3F3F46"
                  fontSize={11}
                  tickFormatter={(value) => `¥${value}`}
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
                <ReferenceArea {...({ x1: 0, x2: 20, y1: 88, y2: 95, fill: '#22C55E', fillOpacity: 0.05 } as any)} />
                <Scatter name="Models" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.provider === 'openai' ? '#3B82F6' :
                        entry.provider === 'anthropic' ? '#F59E0B' :
                        entry.provider === 'deepseek' ? '#22C55E' :
                        '#A855F7'
                      }
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => navigate(`/ai-models/models/${entry.id}`)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
