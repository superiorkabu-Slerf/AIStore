import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Plus, Search, Download, Share2, Layers, Filter, Zap, DollarSign, Sparkles, ChevronRight, Scale, Trophy } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { models, providers } from '../constants';
import { cn, formatPrice } from '../lib/utils';
import type { Model } from '../types';
import { LogoAvatar } from '../components/LogoAvatar';
import { SubpageHero } from '../components/SubpageHero';
import { SubpageIntro } from '../components/SubpageIntro';

type ComparisonGroup = '基础属性' | '价格' | '性能' | '速度' | '功能支持' | '接入门槛';
type CompareValue = string | number | boolean | null;
type CompareType = 'min' | 'max';
type SupportStatus = '✅ 支持' | '❌ 不支持' | '⚠️ 部分支持' | '— 不适用';

type CompareExtra = {
  openSourceLabel: string;
  trainingCutoff: string;
  batchApiPrice: string | null;
  cacheHitPrice: string | null;
  features: {
    functionCalling: SupportStatus;
    jsonMode: SupportStatus;
    vision: SupportStatus;
    streaming: SupportStatus;
    fineTuning: SupportStatus;
  };
  access: {
    directInChina: SupportStatus;
    rateLimit: string;
    signupRequirement: string;
  };
};

type ComparisonRow = {
  label: string;
  group: ComparisonGroup;
  isSummary: boolean;
  compareType?: CompareType;
  getValue: (model: Model) => CompareValue;
  format?: (value: CompareValue, model: Model) => string;
};

const RADAR_COLORS = ['#3b82f6', '#22c55e', '#f59e0b'];

const compareExtras: Record<string, CompareExtra> = {
  'gpt-4o': {
    openSourceLabel: '闭源 API · 厂商服务条款',
    trainingCutoff: '2023-10',
    batchApiPrice: '支持批处理折扣',
    cacheHitPrice: '未单列',
    features: {
      functionCalling: '✅ 支持',
      jsonMode: '✅ 支持',
      vision: '✅ 支持',
      streaming: '✅ 支持',
      fineTuning: '⚠️ 部分支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按账号层级',
      signupRequirement: '需海外网络与支付',
    },
  },
  'gpt-4o-mini': {
    openSourceLabel: '闭源 API · 厂商服务条款',
    trainingCutoff: '2023-10',
    batchApiPrice: '支持批处理折扣',
    cacheHitPrice: '未单列',
    features: {
      functionCalling: '✅ 支持',
      jsonMode: '✅ 支持',
      vision: '✅ 支持',
      streaming: '✅ 支持',
      fineTuning: '⚠️ 部分支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按账号层级',
      signupRequirement: '需海外网络与支付',
    },
  },
  'o1': {
    openSourceLabel: '闭源 API · 厂商服务条款',
    trainingCutoff: '2024-06',
    batchApiPrice: '暂未单列',
    cacheHitPrice: '未单列',
    features: {
      functionCalling: '⚠️ 部分支持',
      jsonMode: '⚠️ 部分支持',
      vision: '❌ 不支持',
      streaming: '⚠️ 部分支持',
      fineTuning: '❌ 不支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按账号层级',
      signupRequirement: '需海外网络与支付',
    },
  },
  'claude-3-5-sonnet': {
    openSourceLabel: '闭源 API · 厂商服务条款',
    trainingCutoff: '2024-04',
    batchApiPrice: '暂未单列',
    cacheHitPrice: '支持缓存计费',
    features: {
      functionCalling: '✅ 支持',
      jsonMode: '✅ 支持',
      vision: '✅ 支持',
      streaming: '✅ 支持',
      fineTuning: '❌ 不支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按组织配额',
      signupRequirement: '需海外网络与支付',
    },
  },
  'deepseek-v3': {
    openSourceLabel: '开源可部署 · 官方开源协议',
    trainingCutoff: '2024-07',
    batchApiPrice: '企业方案可询',
    cacheHitPrice: '未提供',
    features: {
      functionCalling: '✅ 支持',
      jsonMode: '✅ 支持',
      vision: '❌ 不支持',
      streaming: '✅ 支持',
      fineTuning: '⚠️ 部分支持',
    },
    access: {
      directInChina: '✅ 支持',
      rateLimit: '按平台配额',
      signupRequirement: '邮箱即可注册',
    },
  },
  'deepseek-r1': {
    openSourceLabel: '开源可部署 · 官方开源协议',
    trainingCutoff: '2024-08',
    batchApiPrice: '企业方案可询',
    cacheHitPrice: '未提供',
    features: {
      functionCalling: '⚠️ 部分支持',
      jsonMode: '✅ 支持',
      vision: '❌ 不支持',
      streaming: '✅ 支持',
      fineTuning: '❌ 不支持',
    },
    access: {
      directInChina: '✅ 支持',
      rateLimit: '按平台配额',
      signupRequirement: '邮箱即可注册',
    },
  },
  'gemini-1-5-pro': {
    openSourceLabel: '闭源 API · 厂商服务条款',
    trainingCutoff: '2024-01',
    batchApiPrice: '暂未单列',
    cacheHitPrice: '支持缓存计费',
    features: {
      functionCalling: '✅ 支持',
      jsonMode: '✅ 支持',
      vision: '✅ 支持',
      streaming: '✅ 支持',
      fineTuning: '⚠️ 部分支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按项目配额',
      signupRequirement: 'Google 账号',
    },
  },
  'flux-1-dev': {
    openSourceLabel: '权重开放 · 官方许可限制',
    trainingCutoff: '未披露',
    batchApiPrice: '—',
    cacheHitPrice: '—',
    features: {
      functionCalling: '— 不适用',
      jsonMode: '— 不适用',
      vision: '— 不适用',
      streaming: '— 不适用',
      fineTuning: '⚠️ 部分支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按托管平台限制',
      signupRequirement: '需第三方平台账号',
    },
  },
  'kling': {
    openSourceLabel: '闭源产品 · 官方服务条款',
    trainingCutoff: '未披露',
    batchApiPrice: '—',
    cacheHitPrice: '—',
    features: {
      functionCalling: '— 不适用',
      jsonMode: '— 不适用',
      vision: '— 不适用',
      streaming: '— 不适用',
      fineTuning: '❌ 不支持',
    },
    access: {
      directInChina: '✅ 支持',
      rateLimit: '按积分与套餐',
      signupRequirement: '国内手机号',
    },
  },
  'luma-dream-machine': {
    openSourceLabel: '闭源产品 · 官方服务条款',
    trainingCutoff: '未披露',
    batchApiPrice: '—',
    cacheHitPrice: '—',
    features: {
      functionCalling: '— 不适用',
      jsonMode: '— 不适用',
      vision: '— 不适用',
      streaming: '— 不适用',
      fineTuning: '❌ 不支持',
    },
    access: {
      directInChina: '❌ 不支持',
      rateLimit: '按套餐配额',
      signupRequirement: '邮箱即可注册',
    },
  },
};

const getCompareExtra = (model: Model): CompareExtra => compareExtras[model.id] || {
  openSourceLabel: model.isOpenSource ? '开源可部署 · 官方开源协议' : '闭源 API · 厂商服务条款',
  trainingCutoff: '未披露',
  batchApiPrice: null,
  cacheHitPrice: null,
  features: {
    functionCalling: '❌ 不支持',
    jsonMode: '❌ 不支持',
    vision: model.modality === '多模态' ? '✅ 支持' : '❌ 不支持',
    streaming: model.modality === '纯文本' || model.modality === '多模态' ? '✅ 支持' : '— 不适用',
    fineTuning: '❌ 不支持',
  },
  access: {
    directInChina: '❌ 不支持',
    rateLimit: '未披露',
    signupRequirement: '未披露',
  },
};

const getProviderName = (providerId: string) => providers.find(provider => provider.id === providerId)?.name || providerId;

const formatTokenCount = (value: number | null) => {
  if (value === null || value <= 0) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  return `${value / 1000}K`;
};

const formatCurrency = (value: number | null) => value === null ? '—' : `¥${formatPrice(value)}`;

const formatNullableNumber = (value: number | null) => value === null ? '—' : `${value}`;

const formatDuration = (seconds: number | null) => {
  if (seconds === null) return '—';
  if (seconds < 1) return `${seconds.toFixed(1)}s`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${(seconds / 60).toFixed(1)} 分钟`;
};

const formatPercent = (value: number | null, digits = 1) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}%`;
};

const formatMultiplier = (value: number | null, digits = 1) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)} 倍`;
};

const getSharePercent = (part: number | null, whole: number | null) => {
  if (part === null || whole === null || whole <= 0) return null;
  return (part / whole) * 100;
};

const getReductionPercent = (current: number | null, baseline: number | null) => {
  if (current === null || baseline === null || baseline <= 0) return null;
  return (1 - current / baseline) * 100;
};

const getCombinedCost = (model: Model) => {
  if (model.pricing.priceUnit !== '百万 Token' || (model.pricing.input === 0 && model.pricing.output === 0)) return null;
  return model.pricing.input + model.pricing.output * 3;
};

const getThousandCharDuration = (model: Model) => {
  if (model.speed.tps <= 0) return null;
  return 1000 / model.speed.tps;
};

const comparisonRows: ComparisonRow[] = [
  { label: '发布日期', group: '基础属性', isSummary: false, getValue: model => model.releaseDate },
  { label: '模态', group: '基础属性', isSummary: true, getValue: model => model.modality },
  {
    label: '上下文窗口',
    group: '基础属性',
    isSummary: true,
    compareType: 'max',
    getValue: model => model.contextWindow > 0 ? model.contextWindow : null,
    format: value => formatTokenCount(typeof value === 'number' ? value : null),
  },
  {
    label: '最大输出',
    group: '基础属性',
    isSummary: false,
    compareType: 'max',
    getValue: model => model.maxOutput > 0 ? model.maxOutput : null,
    format: value => formatTokenCount(typeof value === 'number' ? value : null),
  },
  { label: '开源状态 + 协议', group: '基础属性', isSummary: true, getValue: model => getCompareExtra(model).openSourceLabel },
  { label: '训练数据截止', group: '基础属性', isSummary: false, getValue: model => getCompareExtra(model).trainingCutoff },

  {
    label: '输入价格 / 百万 Tokens',
    group: '价格',
    isSummary: true,
    compareType: 'min',
    getValue: model => model.pricing.priceUnit === '百万 Token' ? model.pricing.input : null,
    format: value => formatCurrency(typeof value === 'number' ? value : null),
  },
  {
    label: '输出价格 / 百万 Tokens',
    group: '价格',
    isSummary: true,
    compareType: 'min',
    getValue: model => model.pricing.priceUnit === '百万 Token' ? model.pricing.output : null,
    format: value => formatCurrency(typeof value === 'number' ? value : null),
  },
  {
    label: '综合成本 / 百万 Tokens',
    group: '价格',
    isSummary: true,
    compareType: 'min',
    getValue: model => getCombinedCost(model),
    format: value => formatCurrency(typeof value === 'number' ? value : null),
  },
  { label: 'Batch API 价格', group: '价格', isSummary: false, getValue: model => getCompareExtra(model).batchApiPrice || '未提供' },
  { label: '缓存命中价格', group: '价格', isSummary: false, getValue: model => getCompareExtra(model).cacheHitPrice || '未提供' },
  { label: '免费额度', group: '价格', isSummary: true, getValue: model => model.pricing.freeTier || '无' },

  {
    label: 'MMLU（综合能力）',
    group: '性能',
    isSummary: true,
    compareType: 'max',
    getValue: model => model.performance.mmlu > 0 ? model.performance.mmlu : null,
    format: value => formatNullableNumber(typeof value === 'number' ? value : null),
  },
  {
    label: 'HumanEval（代码能力）',
    group: '性能',
    isSummary: true,
    compareType: 'max',
    getValue: model => model.performance.humaneval > 0 ? model.performance.humaneval : null,
    format: value => formatNullableNumber(typeof value === 'number' ? value : null),
  },
  {
    label: 'GSM8K（数学推理）',
    group: '性能',
    isSummary: true,
    compareType: 'max',
    getValue: model => model.performance.gsm8k > 0 ? model.performance.gsm8k : null,
    format: value => formatNullableNumber(typeof value === 'number' ? value : null),
  },

  {
    label: '首字延迟 TTFT',
    group: '速度',
    isSummary: true,
    compareType: 'min',
    getValue: model => model.speed.ttft > 0 ? model.speed.ttft : null,
    format: value => typeof value === 'number' ? `${value}ms` : '—',
  },
  {
    label: '生成速度 TPS',
    group: '速度',
    isSummary: true,
    compareType: 'max',
    getValue: model => model.speed.tps > 0 ? model.speed.tps : null,
    format: value => formatNullableNumber(typeof value === 'number' ? value : null),
  },
  {
    label: '千字生成耗时',
    group: '速度',
    isSummary: false,
    compareType: 'min',
    getValue: model => getThousandCharDuration(model),
    format: value => formatDuration(typeof value === 'number' ? value : null),
  },
  {
    label: '并发评级',
    group: '速度',
    isSummary: false,
    compareType: 'max',
    getValue: model => model.concurrencyRating > 0 ? model.concurrencyRating : null,
    format: value => typeof value === 'number' ? `${value} / 5` : '—',
  },

  { label: '函数调用', group: '功能支持', isSummary: true, getValue: model => getCompareExtra(model).features.functionCalling },
  { label: 'JSON Mode', group: '功能支持', isSummary: false, getValue: model => getCompareExtra(model).features.jsonMode },
  { label: '视觉理解', group: '功能支持', isSummary: true, getValue: model => getCompareExtra(model).features.vision },
  { label: '流式输出', group: '功能支持', isSummary: true, getValue: model => getCompareExtra(model).features.streaming },
  { label: '微调支持', group: '功能支持', isSummary: false, getValue: model => getCompareExtra(model).features.fineTuning },

  { label: '国内可直连', group: '接入门槛', isSummary: true, getValue: model => getCompareExtra(model).access.directInChina },
  { label: '默认 Rate Limit', group: '接入门槛', isSummary: false, getValue: model => getCompareExtra(model).access.rateLimit },
  { label: '注册门槛', group: '接入门槛', isSummary: true, getValue: model => getCompareExtra(model).access.signupRequirement },
  {
    label: 'OpenAI API 兼容',
    group: '接入门槛',
    isSummary: true,
    getValue: model => model.openaiCompatible,
    format: value => value === true ? '✅ 原生兼容' : '❌ 不兼容',
  },
];

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

  const selectedModels = useMemo<Model[]>(() => {
    return selectedIds
      .map(id => models.find(m => m.id === id))
      .filter((model): model is Model => Boolean(model));
  }, [selectedIds]);

  const recommendations = useMemo(() => {
    if (selectedModels.length < 2) return null;

    const sortedByPrice = [...selectedModels].sort((a, b) => (getCombinedCost(a) ?? Number.MAX_SAFE_INTEGER) - (getCombinedCost(b) ?? Number.MAX_SAFE_INTEGER));
    const sortedByPerformance = [...selectedModels].sort((a, b) => (b.performance?.mmlu || 0) - (a.performance?.mmlu || 0));

    const balanced = [...selectedModels].sort((a, b) => {
      const scoreA = (a.performance?.mmlu || 0) / (getCombinedCost(a) || 0.1);
      const scoreB = (b.performance?.mmlu || 0) / (getCombinedCost(b) || 0.1);
      return scoreB - scoreA;
    })[0];

    return {
      cheapest: sortedByPrice[0],
      best: sortedByPerformance[0],
      balanced: balanced
    };
  }, [selectedModels]);

  const recommendationCards = useMemo(() => {
    if (!recommendations) return [];

    const sortedByCost = [...selectedModels].sort((a, b) => (getCombinedCost(a) ?? Number.MAX_SAFE_INTEGER) - (getCombinedCost(b) ?? Number.MAX_SAFE_INTEGER));
    const cheapest = recommendations.cheapest;
    const best = recommendations.best;
    const balanced = recommendations.balanced;
    const highestCost = [...sortedByCost].reverse().find(model => (getCombinedCost(model) ?? 0) > 0) || sortedByCost[sortedByCost.length - 1];
    const balanceReference = [...selectedModels]
      .filter(model => model.id !== balanced.id)
      .sort((a, b) => (b.performance.mmlu || 0) - (a.performance.mmlu || 0))[0] || best;

    const cheapestCost = getCombinedCost(cheapest);
    const highestCostValue = getCombinedCost(highestCost);
    const balancedCost = getCombinedCost(balanced);
    const balanceReferenceCost = getCombinedCost(balanceReference);

    const cheapestPct = getSharePercent(cheapestCost, highestCostValue);
    const balancedCostReduction = getReductionPercent(balancedCost, balanceReferenceCost);
    const balancedGap = Math.abs((balanceReference.performance.mmlu || 0) - (balanced.performance.mmlu || 0));

    return [
      {
        type: 'cost',
        title: '最低成本建议',
        model: cheapest,
        icon: DollarSign,
        color: 'text-green-400',
        bg: 'bg-green-500/5',
        border: 'border-green-500/10',
        desc: `${cheapest.name} 的综合成本 ${formatCurrency(cheapestCost)}/百万tokens，仅为 ${highestCost.name} 的 ${formatPercent(cheapestPct, cheapestPct !== null && cheapestPct < 10 ? 1 : 0)}。`,
      },
      {
        type: 'balanced',
        title: '均衡性价比建议',
        model: balanced,
        icon: Scale,
        color: 'text-[#1ed661]',
        bg: 'bg-[#1ed661]/5',
        border: 'border-[#1ed661]/10',
        desc: `${balanced.name} MMLU 仅低 ${balancedGap.toFixed(1)} 分，但成本低 ${formatPercent(balancedCostReduction, 0)}。`,
      },
      {
        type: 'performance',
        title: '最高性能建议',
        model: best,
        icon: Trophy,
        color: 'text-purple-400',
        bg: 'bg-purple-500/5',
        border: 'border-purple-500/10',
        desc: `${best.name}${best.modality === '多模态' ? ' 支持多模态' : ` 为${best.modality}模型`}，MMLU ${best.performance.mmlu || '—'} 为当前所选最高。`,
      },
    ];
  }, [recommendations, selectedModels]);

  const addModel = (id: string) => {
    if (selectedIds.length >= 3) return;
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

  const getRowValue = (model: Model, row: ComparisonRow) => row.getValue(model);

  const getBestValue = (row: ComparisonRow) => {
    if (!row.compareType || selectedModels.length < 2) return null;

    const values = selectedModels
      .map(model => getRowValue(model, row))
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (values.length === 0) return null;
    return row.compareType === 'min' ? Math.min(...values) : Math.max(...values);
  };

  const getDisplayValue = (model: Model, row: ComparisonRow) => {
    const value = getRowValue(model, row);

    if (row.format) {
      return row.format(value, model);
    }

    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? '✅ 是' : '❌ 否';
    return String(value);
  };

  const visibleRows = useMemo(() => {
    let rows = comparisonRows;

    if (viewMode === 'summary') {
      rows = rows.filter(row => row.isSummary);
    }

    if (showDiffOnly && selectedModels.length > 1) {
      rows = rows.filter(row => {
        const values = selectedModels.map(model => getRowValue(model, row));
        return !values.every(value => JSON.stringify(value) === JSON.stringify(values[0]));
      });
    }

    if (focusPrice) {
      rows = rows.filter(row => row.group === '价格' || row.group === '基础属性' || row.group === '接入门槛');
    }

    if (focusPerformance) {
      rows = rows.filter(row => row.group === '性能' || row.group === '速度' || row.group === '功能支持' || row.group === '基础属性');
    }

    return rows;
  }, [showDiffOnly, focusPrice, focusPerformance, viewMode, selectedModels]);

  const autoSummary = useMemo(() => {
    if (selectedModels.length < 2 || !recommendations) return null;

    const cheapest = recommendations.cheapest;
    const best = recommendations.best.id === cheapest.id
      ? [...selectedModels].filter(model => model.id !== cheapest.id).sort((a, b) => (b.performance.mmlu || 0) - (a.performance.mmlu || 0))[0] || recommendations.best
      : recommendations.best;
    const contextLeader = [...selectedModels].sort((a, b) => (b.contextWindow || 0) - (a.contextWindow || 0))[0];

    const outputShare = getSharePercent(cheapest.pricing.output || null, best.pricing.output || null);
    const speedDelta = best.speed.tps > 0 && cheapest.speed.tps > 0
      ? ((cheapest.speed.tps - best.speed.tps) / best.speed.tps) * 100
      : null;
    const mmluGap = Math.abs((best.performance.mmlu || 0) - (cheapest.performance.mmlu || 0));
    const contextCostRatio = cheapest.pricing.output > 0 && contextLeader.pricing.output > 0
      ? contextLeader.pricing.output / cheapest.pricing.output
      : null;
    const cautionModel = selectedModels.find(model => model.modality === '纯文本' && selectedModels.some(item => item.modality === '多模态'));

    const firstSentence = `${cheapest.name} 输出成本仅为 ${best.name} 的 ${formatPercent(outputShare, outputShare !== null && outputShare < 10 ? 1 : 0)}，${speedDelta !== null ? `响应速度${speedDelta >= 0 ? '快' : '慢'} ${formatPercent(Math.abs(speedDelta), Math.abs(speedDelta) < 10 ? 1 : 0)}` : '响应速度数据待补充'}，MMLU 跑分差距仅 ${mmluGap.toFixed(1)} 分。`;
    const secondSentence = contextLeader && contextLeader.id !== cheapest.id
      ? `${contextLeader.name} 拥有 ${formatTokenCount(contextLeader.contextWindow)} 超长上下文，但输出成本是 ${cheapest.name} 的 ${formatMultiplier(contextCostRatio, contextCostRatio !== null && contextCostRatio < 10 ? 1 : 0)}。`
      : null;
    const cautionSentence = cautionModel
      ? `注意：${cautionModel.name} 为纯文本模型，不支持图像输入。`
      : null;

    return [firstSentence, secondSentence, cautionSentence].filter(Boolean).join(' ');
  }, [recommendations, selectedModels]);

  const radarData = useMemo(() => {
    if (selectedModels.length === 0) return [];

    const maxTps = Math.max(...models.map(model => model.speed.tps || 0), 1);
    const maxContext = Math.max(...models.map(model => model.contextWindow || 0), 1);

    const featureScore = (model: Model) => {
      const features = Object.values(getCompareExtra(model).features);
      const total = features.reduce((sum, feature) => {
        if (feature === '✅ 支持') return sum + 100;
        if (feature === '⚠️ 部分支持') return sum + 60;
        if (feature === '— 不适用') return sum + 40;
        return sum;
      }, 0);

      return total / features.length;
    };

    const efficiencyScore = (model: Model) => {
      const cost = getCombinedCost(model);
      const validCosts = selectedModels.map(item => getCombinedCost(item)).filter((value): value is number => value !== null && value > 0);
      const minCost = validCosts.length ? Math.min(...validCosts) : null;
      if (cost === null || minCost === null || cost <= 0) return 0;
      return Math.min(100, (minCost / cost) * 100);
    };

    const axes = [
      { label: '综合能力', getValue: (model: Model) => model.performance.mmlu || 0 },
      { label: '代码能力', getValue: (model: Model) => model.performance.humaneval || 0 },
      { label: '数学推理', getValue: (model: Model) => model.performance.gsm8k || 0 },
      { label: '响应速度', getValue: (model: Model) => Math.min(100, ((model.speed.tps || 0) / maxTps) * 100) },
      { label: '长上下文', getValue: (model: Model) => Math.min(100, ((model.contextWindow || 0) / maxContext) * 100) },
      { label: '功能完整度', getValue: (model: Model) => featureScore(model) },
      { label: '成本效率', getValue: (model: Model) => efficiencyScore(model) },
    ];

    return axes.map(axis => {
      const row: Record<string, string | number> = { subject: axis.label };
      selectedModels.forEach(model => {
        row[model.id] = Number(axis.getValue(model).toFixed(1));
      });
      return row;
    });
  }, [selectedModels]);

  return (
    <div className="modelhub-page py-4">
      <SubpageHero
        badge="深度对比"
        title="模型深度对比"
        description="横向比较模型的基础属性、价格、性能、速度、功能支持和接入门槛，从多个维度快速选出最适合当前业务的组合。"
        icon={Layers}
      />
      <SubpageIntro
        title="深度对比"
        description="把多个模型放在同一张对比表里查看基础参数、成本结构、性能指标、功能支持和接入要求差异，适合做方案评估、预算平衡和最终选型。"
        highlights={['按 6 大分组对比', '支持差异高亮', '快速判断接入门槛']}
      />

      {/* Selection & Toggles */}
      <div className="flex flex-col gap-5 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {selectedModels.map(model => (
              <div key={model.id} className="flex items-center gap-2 px-3 h-10 bg-zinc-900 border border-white/10 rounded-full group">
                <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="sm" className="rounded-full bg-zinc-950" />
                <span className="text-sm font-medium text-white">{model.name}</span>
                <button
                  onClick={() => removeModel(model.id)}
                  className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {selectedModels.length < 3 && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-4 h-10 bg-zinc-900/50 border border-dashed border-white/10 rounded-full text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">添加模型</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="rounded-full border border-white/10 bg-zinc-900/60 px-3 py-1.5">
              已选 {selectedModels.length} / 3
            </span>
            <span>最多同时对比 3 个模型</span>
          </div>
        </div>
      </div>

      {/* Recommendation Cards */}
      {recommendationCards.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-[#1ed661]" size={20} />
            <h2 className="text-xl font-bold text-white">智能决策建议</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendationCards.map(rec => (
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
                      {rec.model ? getProviderName(rec.model.provider) : '—'}
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

      {autoSummary && (
        <div className="mb-12 rounded-2xl border border-white/8 bg-zinc-900/40 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-[#1ed661]" />
            <h3 className="text-lg font-bold text-white">自动对比结论</h3>
          </div>
          <p className="max-w-5xl text-sm leading-8 text-zinc-300">{autoSummary}</p>
        </div>
      )}

      {selectedModels.length > 0 && (
        <div className="mb-12 rounded-2xl border border-white/8 bg-zinc-900/40 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">模型能力雷达图</h3>
            <p className="mt-2 text-sm text-zinc-400">基于综合能力、代码、数学、速度、上下文、功能完整度和成本效率，对当前所选模型做直观对比。</p>
          </div>
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="68%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                {selectedModels.map((model, index) => (
                  <Radar
                    key={model.id}
                    name={model.name}
                    dataKey={model.id}
                    stroke={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fillOpacity={0.16}
                    strokeWidth={2.5}
                  />
                ))}
                <Legend wrapperStyle={{ paddingTop: 16 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedModels.length > 0 ? (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2 p-1 bg-zinc-900/50 border border-white/5 rounded-xl w-fit">
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

          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-x-auto relative">
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="px-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-56 sticky left-0 bg-zinc-950/95 backdrop-blur-md z-30 border-r border-white/5">对比维度</th>
                {selectedModels.map(model => (
                  <th key={model.id} className="px-6 py-6 min-w-[220px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <LogoAvatar src={model.logo} alt={model.name} fallback={model.name[0]} size="sm" className="rounded-lg bg-zinc-950" />
                        <div className="text-sm font-bold text-white">{model.name}</div>
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{getProviderName(model.provider)}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleRows.map((row, i) => {
                const isFirstInGroup = i === 0 || visibleRows[i - 1].group !== row.group;
                const bestValue = getBestValue(row);

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
                      <td className="px-6 py-4 text-xs text-zinc-400 font-medium sticky left-0 bg-zinc-950/95 backdrop-blur-md z-10 border-r border-white/5">
                        {row.label}
                      </td>
                      {selectedModels.map(model => {
                        const val = getRowValue(model, row);
                        const isBest = bestValue !== null && val === bestValue;
                        const displayVal = getDisplayValue(model, row);

                        return (
                          <td key={model.id} className={cn(
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
        </div>
      ) : (
        <div className="py-32 bg-zinc-900/20 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
            <Layers className="text-zinc-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">暂未选择对比模型</h2>
          <p className="text-zinc-500 mb-10 max-w-xs text-sm leading-relaxed">请从上方添加 2-3 个模型进行深度参数对比，我们将为您高亮最优选。</p>
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
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{getProviderName(m.provider)}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:border-white/20 transition-all">
                    <Plus size={16} />
                  </div>
                </button>
              ))}
              {filteredModels.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-zinc-600 text-sm font-medium">{selectedModels.length >= 3 ? '已达到最多 3 个模型' : '未找到可用模型'}</div>
                  <div className="text-zinc-700 text-xs mt-1">{selectedModels.length >= 3 ? '如需新增，请先移除一个已选模型' : '尝试搜索其他关键词'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
