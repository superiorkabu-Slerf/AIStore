import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { models, providers } from '../constants';
import { cn } from '../lib/utils';
import { Trophy, Database, Clock3, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

const ARENA_LEADERBOARD_URL = 'https://arena.ai/leaderboard/';

type MatrixMetricId =
  | 'overall'
  | 'expert'
  | 'hardPrompts'
  | 'coding'
  | 'math'
  | 'creativeWriting'
  | 'instructionFollowing'
  | 'longerQuery';

type SortColumn = 'model' | MatrixMetricId;

type LeaderboardRow = {
  id: string;
  baseModelId: string;
  name: string;
  provider: string;
  logo: string;
  metrics: Record<MatrixMetricId, number>;
};

const getLatestUpdatedAt = (list: typeof models) => {
  const dates = list
    .map(model => model.dataSource?.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return dates[0] || '2025-01-20';
};

const matrixColumns: Array<{ id: MatrixMetricId; title: string }> = [
  { id: 'overall', title: '综合' },
  { id: 'expert', title: '专家能力' },
  { id: 'hardPrompts', title: '复杂提示' },
  { id: 'coding', title: '编程' },
  { id: 'math', title: '数学' },
  { id: 'creativeWriting', title: '创意写作' },
  { id: 'instructionFollowing', title: '指令遵循' },
  { id: 'longerQuery', title: '长查询' },
];

export const Rankings = () => {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<SortColumn>('overall');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const leaderboardRows = useMemo<LeaderboardRow[]>(
    () =>
      Array.from({ length: 50 }, (_, index) => {
        const baseModel = models[index % models.length];
        const variantIndex = Math.floor(index / models.length);
        const stabilityScore = Number.parseFloat(baseModel.performance.avgStability.replace('%', '')) || 0;
        const modalityBonus = baseModel.modality === '多模态' ? 4 : baseModel.modality === '图像生成' ? 3 : 1.5;
        const cyclePenalty = variantIndex * 2.2 + (index % models.length) * 0.08;

        return {
          id: `${baseModel.id}-leaderboard-${index + 1}`,
          baseModelId: baseModel.id,
          name: variantIndex === 0 ? baseModel.name : `${baseModel.name} · 样本 ${String(variantIndex + 1).padStart(2, '0')}`,
          provider: baseModel.provider,
          logo: baseModel.logo,
          metrics: {
            overall: baseModel.eloScore - cyclePenalty * 5,
            expert:
              baseModel.performance.mmlu * 0.9 +
              baseModel.performance.humaneval * 0.45 +
              baseModel.performance.gsm8k * 0.35 -
              cyclePenalty,
            hardPrompts:
              stabilityScore * 0.6 +
              baseModel.performance.gsm8k * 0.25 +
              baseModel.performance.mmlu * 0.2 -
              cyclePenalty * 0.7,
            coding: baseModel.performance.humaneval - cyclePenalty * 0.8,
            math: baseModel.performance.gsm8k - cyclePenalty * 0.85,
            creativeWriting:
              baseModel.performance.mmlu * 0.65 +
              stabilityScore * 0.25 +
              modalityBonus -
              cyclePenalty * 0.75,
            instructionFollowing:
              stabilityScore + modalityBonus * 0.8 + (baseModel.openaiCompatible ? 1.5 : 0) - cyclePenalty * 0.55,
            longerQuery: baseModel.contextWindow / 1000 - cyclePenalty * 1.5,
          },
        };
      }),
    []
  );

  const matrixRankMaps = useMemo(() => {
    const buildRankMap = (metricId: MatrixMetricId) => {
      const sortedList = [...leaderboardRows].sort((a, b) => b.metrics[metricId] - a.metrics[metricId]);
      return new Map(sortedList.map((row, index) => [row.id, index + 1]));
    };

    return {
      overall: buildRankMap('overall'),
      expert: buildRankMap('expert'),
      hardPrompts: buildRankMap('hardPrompts'),
      coding: buildRankMap('coding'),
      math: buildRankMap('math'),
      creativeWriting: buildRankMap('creativeWriting'),
      instructionFollowing: buildRankMap('instructionFollowing'),
      longerQuery: buildRankMap('longerQuery'),
    } satisfies Record<MatrixMetricId, Map<string, number>>;
  }, [leaderboardRows]);

  const matrixRows = useMemo(
    () => {
      const sortedRows = [...leaderboardRows].sort((a, b) => {
        if (sortColumn === 'model') {
          return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }

        const aRank = matrixRankMaps[sortColumn].get(a.id) || Number.MAX_SAFE_INTEGER;
        const bRank = matrixRankMaps[sortColumn].get(b.id) || Number.MAX_SAFE_INTEGER;
        return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
      });

      return sortedRows;
    },
    [leaderboardRows, matrixRankMaps, sortColumn, sortDirection]
  );

  const getRankCellClass = (rank?: number) => {
    if (rank === 1) return 'bg-amber-500/12 text-amber-200';
    if (rank === 2) return 'bg-zinc-300/10 text-zinc-200';
    if (rank === 3) return 'bg-orange-400/12 text-orange-200';
    return 'text-zinc-300';
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    setSortDirection('asc');
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={13} className="text-zinc-500 transition-colors group-hover:text-zinc-300" />;
    }

    return sortDirection === 'asc'
      ? <ChevronUp size={13} className="text-zinc-200" />
      : <ChevronDown size={13} className="text-zinc-200" />;
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
        description="当前页面先保留综合矩阵榜单，把核心模型放在同一张表里做横向对比，方便用户快速看清综合能力和各专项能力的名次表现。当前列表先扩展为 50 条演示数据，用于预览大榜单的滚动和排序体验。"
        highlights={['仅保留综合榜单', '标注数据来源', '标注更新时间']}
      />

      <div className="space-y-10">
        <section className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Trophy size={22} className="text-[#1ed661]" />
              <h2 className="text-2xl font-bold text-white">综合矩阵榜单</h2>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-400">
              参考你给的矩阵榜单样式，把同一批模型在综合、专家能力、复杂提示、编程、数学、创意写作、指令遵循和长查询几个维度上的名次放到一张表里，方便横向看清谁更全面、谁偏科更明显。榜单区域支持固定高度内滚动浏览。
            </p>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  First Place 首位
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  Second Place 亚军
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs text-orange-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-300" />
                  Third Place 第三名
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 xl:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Database size={13} className="text-sky-300" />
                <a
                  href={ARENA_LEADERBOARD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 transition-colors hover:text-white"
                >
                  来源：arena.ai/leaderboard
                </a>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <Clock3 size={13} className="text-amber-300" />
                <span>更新：{getLatestUpdatedAt(models)}</span>
              </div>
            </div>
          </div>
          </div>

          <div className="max-h-[1120px] overflow-auto rounded-2xl border border-white/5">
            <table className="min-w-[1120px] w-full border-collapse text-left">
              <thead className="sticky top-0 z-30">
                <tr className="border-b border-white/5 bg-zinc-900/95 backdrop-blur-md">
                  <th className="sticky left-0 top-0 z-40 w-[320px] border-r border-b border-white/5 bg-zinc-900 px-5 py-4 shadow-[8px_0_24px_rgba(9,9,11,0.35)]">
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between gap-3 text-left"
                      onClick={() => handleSort('model')}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Search size={16} className="shrink-0 text-zinc-300" />
                        <span className="truncate text-base font-semibold text-white">模型</span>
                        <span className="shrink-0 text-sm font-medium text-zinc-500">
                          {matrixRows.length} / {matrixRows.length}
                        </span>
                      </div>
                      {renderSortIcon('model')}
                    </button>
                  </th>
                  {matrixColumns.map((column) => (
                    <th
                      key={column.id}
                      className="sticky top-0 z-30 min-w-[170px] border-r border-b border-white/5 bg-zinc-900/95 px-5 py-4 backdrop-blur-md last:border-r-0"
                    >
                      <button
                        type="button"
                        className="group flex w-full items-center justify-between gap-3 text-left"
                        onClick={() => handleSort(column.id)}
                      >
                        <span className="text-base font-semibold text-white">{column.title}</span>
                        {renderSortIcon(column.id)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {matrixRows.map((row) => {
                  const provider = providers.find((item) => item.id === row.provider);

                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                      onClick={() => navigate(`/ai-models/models/${row.baseModelId}`)}
                    >
                      <td className="sticky left-0 z-10 border-r border-white/5 bg-zinc-950 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <LogoAvatar src={row.logo} alt={row.name} fallback={row.name[0]} size="sm" className="rounded-md bg-zinc-950" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">{row.name}</div>
                            <div className="truncate text-xs uppercase tracking-[0.18em] text-zinc-500">{provider?.name || row.provider}</div>
                          </div>
                        </div>
                      </td>

                      {matrixColumns.map((column) => {
                        const rank = matrixRankMaps[column.id].get(row.id);

                        return (
                          <td
                            key={column.id}
                            className={cn(
                              'border-r border-white/5 px-5 py-4 font-mono text-sm tabular-nums last:border-r-0',
                              getRankCellClass(rank)
                            )}
                          >
                            {rank || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
