import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp,
  Search,
  Clock,
  Eye,
  FileText,
  Star,
  Share2,
  Heart,
  MessageCircle,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Home,
  Code,
  BookOpen,
  GraduationCap,
  Newspaper,
  ChevronDown,
  Cpu,
  Shield,
  Zap,
  PlayCircle,
  ThumbsUp,
  RotateCw,
  Sun,
  Moon,
  AlignJustify,
  List,
  Flame,
  LayoutGrid,
  TrendingDown,
  Film,
  Headphones,
  Pause,
  CalendarDays,
  UserRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NEWS_DATA, TOOLS_DATA, GLOSSARY_DATA, SPECIALS_DATA } from './data';
import { NewsItem, Tool, GlossaryItem } from './types';
import { cn } from './lib/utils';
import { Card, Badge } from './components/Common';
import { ScrollProgress, MouseGlow } from './components/Effects';
import { TimelineItem, ArticleCard } from './components/NewsCards';
import ModelHubModule from './components/model-hub/ModelHubModule';
import BasicGuidePage from './components/BasicGuidePage';
import MessageChannelsPage from './components/MessageChannelsPage';
import InfrastructurePlatformsPage from './components/InfrastructurePlatformsPage';
import AIToolsPage from './components/AIToolsPage';
import AIToolsPage2 from './components/AIToolsPage2';

type ListTab = 'flash' | 'article' | 'tutorial' | 'knowledge' | 'video' | 'podcast';
type SearchTab = 'all' | ListTab;
type View =
  | 'home'
  | 'ai_tools'
  | 'ai_tools_2'
  | 'guide'
  | 'channels'
  | 'infrastructure'
  | 'model_hub'
  | 'portal'
  | 'list'
  | 'detail'
  | 'term'
  | 'tool'
  | 'section'
  | 'search'
  | 'video'
  | 'podcast'
  | 'learning_path';
type ContentSort = 'hot' | 'latest' | 'most_read';
type ContentDateRange = 'all' | '3d' | '7d' | '30d';
type FlashViewMode = 'compact' | 'detail';
type ContentLayoutMode = 'list' | 'card';
type SourceFilter = 'all' | 'anthropic' | 'openai' | 'meta' | 'google';
type ThemeFilter = 'all' | 'model' | 'hardware' | 'policy' | 'open_source';

type WaterfallBlock = {
  id: string;
  type: 'text' | 'quote' | 'image' | 'video';
  text?: string;
  imageUrl?: string;
  caption?: string;
  videoUrl?: string;
  poster?: string;
};

type TermArticle = {
  id: string;
  term: string;
  title: string;
  summary: string;
  cover: string;
  date: string;
  readCount: number;
  topicTags: string[];
};

type CommentItem = {
  id: string;
  userName: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
};

type FlashTickerItem = {
  id: string;
  title: string;
  date: string;
  exactTime: string;
  slug: string;
};

type VideoItem = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  summary: string;
  author: string;
  date: string;
  duration: string;
  views: number;
  likes: number;
  tags: string[];
  sourceName: string;
  sourceUrl: string;
  videoUrl: string;
};

type PodcastItem = {
  id: string;
  slug: string;
  title: string;
  cover: string;
  summary: string;
  host: string;
  date: string;
  duration: string;
  plays: number;
  likes: number;
  tags: string[];
  sourceName: string;
  sourceUrl: string;
  audioUrl: string;
  transcript: string[];
};

type LearningPathDay = {
  id: string;
  dayLabel: string;
  title: string;
  trackTag: string;
  summary: string;
  highlights: string[];
  deliverable: string;
  learners: number;
  targetHash: string;
};

const LEARNING_PATH_7D: LearningPathDay[] = [
  {
    id: 'path-day-1',
    dayLabel: 'DAY 01',
    title: '认知搭建：LLM 与术语地图',
    trackTag: '基础认知',
    summary: '快速建立模型、Token、上下文窗口与推理成本的统一认知。',
    highlights: ['阅读 2 篇入门文章', '完成术语百科 5 个核心词条'],
    deliverable: '一页术语速记卡 + 模型能力对照表',
    learners: 26341,
    targetHash: '#/list?tab=knowledge'
  },
  {
    id: 'path-day-2',
    dayLabel: 'DAY 02',
    title: '提示工程：可复用 Prompt 模板',
    trackTag: 'Prompt',
    summary: '围绕结构化输出、角色设定和约束条件，形成可复用模板。',
    highlights: ['拆解 3 种提示结构', '完成 1 组多轮提示实验'],
    deliverable: 'Prompt 模板库 v1（3-5 条）',
    learners: 21908,
    targetHash: '#/list?tab=tutorial'
  },
  {
    id: 'path-day-3',
    dayLabel: 'DAY 03',
    title: '工作流：从单点调用到链路编排',
    trackTag: 'Skill',
    summary: '把检索、生成、校验串成一条可执行流程，形成基础自动化。',
    highlights: ['配置 1 条内容工作流', '增加结果校验步骤'],
    deliverable: '可复用工作流草图 + 参数说明',
    learners: 18452,
    targetHash: '#/list?tab=article'
  },
  {
    id: 'path-day-4',
    dayLabel: 'DAY 04',
    title: '模型实战：微调与评测入门',
    trackTag: '实战教程',
    summary: '理解微调边界与评测指标，避免只看单一分数做决策。',
    highlights: ['跑通 1 次微调演示', '记录成本/效果变化'],
    deliverable: '评测记录表 + 调参备忘',
    learners: 17630,
    targetHash: '#/list?tab=tutorial'
  },
  {
    id: 'path-day-5',
    dayLabel: 'DAY 05',
    title: 'Agent 设计：任务拆解与工具调用',
    trackTag: 'Agent',
    summary: '用任务规划 + 工具路由的方式，提高复杂任务成功率。',
    highlights: ['定义 1 套 Agent 目标', '补充失败回退策略'],
    deliverable: 'Agent 流程图 + 失败兜底清单',
    learners: 15824,
    targetHash: '#/list?tab=knowledge'
  },
  {
    id: 'path-day-6',
    dayLabel: 'DAY 06',
    title: '安全与治理：合规检查清单',
    trackTag: '安全合规',
    summary: '把提示注入、数据泄露和版权风险纳入发布前检查。',
    highlights: ['梳理 6 项风险点', '完成 1 版安全策略模板'],
    deliverable: '发布前检查清单 v1',
    learners: 14203,
    targetHash: '#/list?tab=article'
  },
  {
    id: 'path-day-7',
    dayLabel: 'DAY 07',
    title: '综合演练：7 天成果复盘',
    trackTag: '项目收官',
    summary: '汇总一周产出并构建可复用模板，形成后续迭代基线。',
    highlights: ['整理关键数据与结论', '规划下一阶段目标'],
    deliverable: '学习复盘文档 + 下周迭代计划',
    learners: 13117,
    targetHash: '#/list?tab=article'
  }
];

const SOURCE_FILTER_OPTIONS: Array<{ value: SourceFilter; label: string }> = [
  { value: 'all', label: '全部来源' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' }
];

const THEME_FILTER_OPTIONS: Array<{ value: ThemeFilter; label: string }> = [
  { value: 'all', label: '全部主题' },
  { value: 'model', label: '模型' },
  { value: 'hardware', label: '硬件' },
  { value: 'policy', label: '政策' },
  { value: 'open_source', label: '开源' }
];

const VIDEO_DATA: VideoItem[] = [
  {
    id: 'video-1',
    slug: 'claude-3-5-coding-breakthrough',
    title: 'Claude 3.5 Sonnet 实测：代码修复与重构效率全面提升',
    cover: 'https://picsum.photos/seed/video-claude/1280/720',
    summary: '用真实项目任务复盘 Claude 3.5 在 bug 定位、代码改写和单测生成中的表现边界。',
    author: 'Aistore Video Lab',
    date: '2026-03-25',
    duration: '12:38',
    views: 32800,
    likes: 1680,
    tags: ['模型评测', 'Anthropic', '编码'],
    sourceName: 'Aistore 视频频道',
    sourceUrl: 'https://www.bilibili.com',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'video-2',
    slug: 'gpt-agent-workflow-demo',
    title: 'GPT Agent 工作流演示：从需求到自动执行的完整链路',
    cover: 'https://picsum.photos/seed/video-agent/1280/720',
    summary: '拆解一个可复用 Agent 工作流，展示任务规划、工具调用与结果校验。',
    author: 'Open Workflow Club',
    date: '2026-03-24',
    duration: '18:22',
    views: 27600,
    likes: 1320,
    tags: ['OpenAI', 'Agent', '实战'],
    sourceName: 'Aistore 视频频道',
    sourceUrl: 'https://www.bilibili.com',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'video-3',
    slug: 'gemini-context-window-practice',
    title: 'Gemini 长上下文实战：200万 Token 到底能做什么',
    cover: 'https://picsum.photos/seed/video-gemini/1280/720',
    summary: '从文档分析、代码审计到多模态检索，验证长上下文在业务中的真实收益。',
    author: 'Model Frontier',
    date: '2026-03-23',
    duration: '09:47',
    views: 19400,
    likes: 906,
    tags: ['Google', '模型', '多模态'],
    sourceName: 'Aistore 视频频道',
    sourceUrl: 'https://www.bilibili.com',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'video-4',
    slug: 'meta-open-source-model-roadmap',
    title: 'Meta 开源模型路线图：Llama 生态如何落地企业应用',
    cover: 'https://picsum.photos/seed/video-llama/1280/720',
    summary: '围绕 Llama 的工具链、部署形态和社区资源，梳理开源方案选型路径。',
    author: 'Open Source AI',
    date: '2026-03-22',
    duration: '14:05',
    views: 22100,
    likes: 1189,
    tags: ['Meta', '开源', '企业应用'],
    sourceName: 'Aistore 视频频道',
    sourceUrl: 'https://www.bilibili.com',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  }
];

const PODCAST_DATA: PodcastItem[] = [
  {
    id: 'podcast-1',
    slug: 'ai-weekly-01-model-product-gap',
    title: 'AI 周度对谈 01：模型能力与产品落地之间的“最后一公里”',
    cover: 'https://picsum.photos/seed/podcast-1/960/540',
    summary: '讨论从 Demo 到上线最容易被忽略的评测、成本和稳定性问题。',
    host: 'Aistore Podcast',
    date: '2026-03-25',
    duration: '36:20',
    plays: 12800,
    likes: 920,
    tags: ['产品落地', '模型评测'],
    sourceName: 'Aistore 博客频道',
    sourceUrl: 'https://caip.org.cn/aiCommunity/ai-podcast',
    audioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    transcript: [
      '本期围绕“模型能力和产品指标如何对齐”展开讨论，重点拆解上线阶段最常见的三类误区。',
      '我们建议先定义业务成功标准，再反推模型评测维度，避免只看通用 benchmark 分数。',
      '在真实环境中，稳定性、可观测性和回退机制往往比单次效果更关键。'
    ]
  },
  {
    id: 'podcast-2',
    slug: 'ai-weekly-02-agent-evaluation',
    title: 'AI 周度对谈 02：Agent 系统如何做可解释评估',
    cover: 'https://picsum.photos/seed/podcast-2/960/540',
    summary: '从任务拆解、工具选择到失败回放，建立一套可解释的 Agent 评估框架。',
    host: 'AI Systems Roundtable',
    date: '2026-03-24',
    duration: '42:08',
    plays: 9600,
    likes: 740,
    tags: ['Agent', '评测方法'],
    sourceName: 'Aistore 博客频道',
    sourceUrl: 'https://caip.org.cn/aiCommunity/ai-podcast',
    audioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    transcript: [
      'Agent 评估不能只看任务完成率，还应同时关注路径质量与资源消耗。',
      '建议记录每一步调用上下文，建立失败样本库，便于后续快速定位回归问题。',
      '把评估过程产品化，才能在团队扩张时保持一致的交付质量。'
    ]
  },
  {
    id: 'podcast-3',
    slug: 'ai-weekly-03-policy-and-open-source',
    title: 'AI 周度对谈 03：政策收紧下，开源生态会走向何处？',
    cover: 'https://picsum.photos/seed/podcast-3/960/540',
    summary: '结合近期监管动态与社区趋势，讨论开源模型的机会与边界。',
    host: 'Policy x OpenSource',
    date: '2026-03-23',
    duration: '33:16',
    plays: 7300,
    likes: 518,
    tags: ['政策', '开源'],
    sourceName: 'Aistore 博客频道',
    sourceUrl: 'https://caip.org.cn/aiCommunity/ai-podcast',
    audioUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    transcript: [
      '政策和开源并不是对立关系，关键在于治理机制是否清晰、透明且可追溯。',
      '企业在使用开源模型时，应补齐版权、数据边界和责任链条的风险控制。',
      '未来竞争重点将转向“开源能力 + 工程交付”的组合效率。'
    ]
  }
];

const buildTutorialFeed = (items: NewsItem[]): NewsItem[] => {
  const existing = items.filter((item) => item.type === 'tutorial');
  const levelMap: Array<'beginner' | 'intermediate' | 'expert'> = ['beginner', 'intermediate', 'expert', 'intermediate'];
  if (existing.length > 0) {
    return existing.map((item, idx) => ({
      ...item,
      difficulty: item.difficulty || levelMap[idx % levelMap.length]
    }));
  }

  return items
    .filter((item) => item.type === 'article')
    .slice(0, 4)
    .map((item, idx) => ({
      ...item,
      id: `t-${item.id}`,
      slug: `${item.slug}-tutorial`,
      type: 'tutorial' as const,
      title: `教程 | ${item.title}`,
      categoryTag: '实战教程',
      summary: `${item.summary} 本教程版补充了操作步骤、环境准备与常见问题。`,
      date: `2026-03-${String(22 - idx).padStart(2, '0')}`,
      readCount: Math.max(6800, Math.round(item.readCount * 0.72)),
      difficulty: levelMap[idx % levelMap.length]
    }));
};

const buildTermArticles = (glossary: GlossaryItem[]): TermArticle[] =>
  glossary.map((item, idx) => ({
    id: item.id,
    term: item.term,
    title: `术语百科 | ${item.term}`,
    summary: `${item.definition} 该词条已补充可落地场景和实践建议，适合快速建立认知框架。`,
    cover: `https://picsum.photos/seed/term-${encodeURIComponent(item.term)}/900/540`,
    date: `2026-03-${String(24 - (idx % 6)).padStart(2, '0')}`,
    readCount: 3800 + idx * 760,
    topicTags:
      item.term === 'Agent' || item.term === 'RAG' || item.term === 'Prompt' || item.term === 'Fine-tuning'
        ? ['Skill', '应用实践']
        : item.term === 'LLM' || item.term === 'Token'
          ? ['大模型', '基础概念']
          : item.term === 'Multimodal' || item.term === 'Diffusion'
            ? ['多模态', '生成式AI']
            : ['大模型', '术语入门']
  }));

const parseDateValue = (date: string): number => new Date(`${date}T00:00:00+08:00`).getTime();
const parseDateTimeValue = (date: string, time?: string): number => {
  const normalized = (time || '00:00').padStart(5, '0');
  return new Date(`${date}T${normalized}:00+08:00`).getTime();
};

const buildAppHashUrl = (targetHash: string): string =>
  `${window.location.origin}${window.location.pathname}${window.location.search}${targetHash}`;

const openNewsDetailInNewTab = (slug: string, fromHash?: string): void => {
  const sourceHash = fromHash || window.location.hash || '#/portal';
  const targetHash = `#/detail/${slug}?from=${encodeURIComponent(sourceHash)}`;
  window.open(buildAppHashUrl(targetHash), '_blank', 'noopener,noreferrer');
};

const navigateToTermDetail = (termId: string, fromHash?: string): void => {
  const sourceHash = fromHash || window.location.hash || '#/portal';
  window.location.hash = `#/term/${termId}?from=${encodeURIComponent(sourceHash)}`;
};

const getBackLabelFromHash = (targetHash: string): string => {
  if (targetHash === '#/' || targetHash.startsWith('#/home')) return '返回首页';
  if (targetHash.startsWith('#/portal')) return '返回AI百科';
  if (targetHash.startsWith('#/search')) return '返回搜索';
  if (targetHash.startsWith('#/list')) {
    const params = new URLSearchParams(targetHash.split('?')[1] || '');
    const tab = params.get('tab');
    if (tab === 'flash') return '返回AI快讯';
    if (tab === 'article') return '返回深度好文';
    if (tab === 'tutorial') return '返回精选教程';
    if (tab === 'knowledge') return '返回术语百科';
    if (tab === 'video') return '返回优质视频';
    if (tab === 'podcast') return '返回AI播客';
    return '返回列表';
  }
  return '返回上层';
};

const getNewsSource = (item: NewsItem): SourceFilter => {
  const text = `${item.title} ${item.summary} ${item.sourceName}`.toLowerCase();
  if (text.includes('anthropic') || text.includes('claude')) return 'anthropic';
  if (text.includes('openai') || text.includes('gpt') || text.includes('sora')) return 'openai';
  if (text.includes('meta') || text.includes('llama')) return 'meta';
  if (text.includes('google') || text.includes('gemini')) return 'google';
  return 'openai';
};

const getNewsTheme = (item: NewsItem): ThemeFilter => {
  const text = `${item.title} ${item.summary} ${item.categoryTag}`.toLowerCase();
  if (
    text.includes('gpu') ||
    text.includes('芯片') ||
    text.includes('硬件') ||
    text.includes('blackwell') ||
    text.includes('nvidia') ||
    text.includes('英伟达')
  ) {
    return 'hardware';
  }
  if (
    text.includes('法案') ||
    text.includes('监管') ||
    text.includes('政策') ||
    text.includes('法律') ||
    text.includes('合规') ||
    text.includes('欧盟')
  ) {
    return 'policy';
  }
  if (text.includes('开源') || text.includes('opensource') || text.includes('open source')) {
    return 'open_source';
  }
  return 'model';
};

const getVideoSource = (item: VideoItem): SourceFilter => {
  const text = `${item.title} ${item.summary} ${item.sourceName} ${item.author}`.toLowerCase();
  if (text.includes('anthropic') || text.includes('claude')) return 'anthropic';
  if (text.includes('openai') || text.includes('gpt') || text.includes('sora')) return 'openai';
  if (text.includes('meta') || text.includes('llama')) return 'meta';
  if (text.includes('google') || text.includes('gemini')) return 'google';
  return 'openai';
};

const getVideoTheme = (item: VideoItem): ThemeFilter => {
  const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();
  if (text.includes('硬件') || text.includes('芯片') || text.includes('gpu')) return 'hardware';
  if (text.includes('政策') || text.includes('监管') || text.includes('合规') || text.includes('法案')) return 'policy';
  if (text.includes('开源') || text.includes('open source')) return 'open_source';
  return 'model';
};

const getPodcastSource = (item: PodcastItem): SourceFilter => {
  const text = `${item.title} ${item.summary} ${item.host}`.toLowerCase();
  if (text.includes('anthropic') || text.includes('claude')) return 'anthropic';
  if (text.includes('openai') || text.includes('gpt') || text.includes('sora')) return 'openai';
  if (text.includes('meta') || text.includes('llama')) return 'meta';
  if (text.includes('google') || text.includes('gemini')) return 'google';
  return 'openai';
};

const getPodcastTheme = (item: PodcastItem): ThemeFilter => {
  const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();
  if (text.includes('硬件') || text.includes('芯片') || text.includes('gpu')) return 'hardware';
  if (text.includes('政策') || text.includes('监管') || text.includes('合规') || text.includes('法案')) return 'policy';
  if (text.includes('开源') || text.includes('open source')) return 'open_source';
  return 'model';
};

const getVideoTopicTags = (item: VideoItem): string[] => Array.from(new Set(item.tags));
const getPodcastTopicTags = (item: PodcastItem): string[] => Array.from(new Set(item.tags));

const formatAudioTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const safe = Math.floor(seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const parseDurationLabelToSeconds = (duration: string): number => {
  const [minText, secText] = duration.split(':');
  const mins = Number(minText);
  const secs = Number(secText);
  if (!Number.isFinite(mins) || !Number.isFinite(secs)) return 0;
  return mins * 60 + secs;
};

const getNewsTopicTags = (item: NewsItem): string[] => {
  const tags = new Set<string>([item.categoryTag]);
  const text = `${item.title} ${item.summary}`.toLowerCase();

  if (text.includes('gpt') || text.includes('llama') || text.includes('claude') || text.includes('gemini') || text.includes('模型')) {
    tags.add('大模型');
  }
  if (text.includes('教程') || text.includes('实战') || text.includes('微调') || text.includes('指南')) {
    tags.add('Skill');
  }
  if (text.includes('agent')) {
    tags.add('Agent');
  }
  if (text.includes('视频') || text.includes('图像') || text.includes('多模态') || text.includes('sora')) {
    tags.add('多模态');
  }
  if (text.includes('法律') || text.includes('监管') || text.includes('合规') || text.includes('法案')) {
    tags.add('安全合规');
  }

  return Array.from(tags);
};

const getTermTopicTags = (item: TermArticle): string[] => {
  return Array.from(new Set(['术语百科', ...item.topicTags]));
};

const buildPortalFlashFeed = (news: NewsItem[]): FlashTickerItem[] => {
  const base = news
    .filter((item) => item.type === 'flash')
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.date,
      exactTime: item.exactTime || '00:00',
      slug: item.slug
    }));

  const contentSlugs = news.filter((item) => item.type !== 'flash').map((item) => item.slug);
  const fallbackSlug = contentSlugs[0] || news[0]?.slug || 'gpt-5-rumors';
  const pickSlug = (idx: number) => contentSlugs[idx % Math.max(contentSlugs.length, 1)] || fallbackSlug;

  const mock: FlashTickerItem[] = [
    { id: 'mx-f1', title: 'Meta 发布开源语音模型 V2，实时对话延迟下降 37%', date: '2026-03-24', exactTime: '22:45', slug: pickSlug(0) },
    { id: 'mx-f2', title: '阿里云推出 Agent 平台新版本，支持多模型编排', date: '2026-03-24', exactTime: '21:10', slug: pickSlug(1) },
    { id: 'mx-f3', title: '开源社区发布 RAG 评测基准 2.0，新增中文场景', date: '2026-03-24', exactTime: '19:35', slug: pickSlug(2) },
    { id: 'mx-f4', title: '苹果端侧 AI SDK 更新，图像理解性能提升 18%', date: '2026-03-24', exactTime: '18:20', slug: pickSlug(3) },
    { id: 'mx-f5', title: '欧盟公布 AI 合规检查新指引，企业需补充透明度文档', date: '2026-03-23', exactTime: '16:50', slug: pickSlug(4) },
    { id: 'mx-f6', title: '字节开源 Prompt 调优工具，支持自动回归测试', date: '2026-03-23', exactTime: '15:05', slug: pickSlug(5) }
  ];

  return [...base, ...mock];
};

const buildWaterfallBlocks = (news: NewsItem): WaterfallBlock[] => {
  const seed = encodeURIComponent(news.slug);

  return [
    {
      id: `${news.id}-wf-1`,
      type: 'text',
      text: `${news.summary} 这一段用于模拟抓取正文片段，后续可以直接拼接外部平台返回的原始段落内容。`
    },
    {
      id: `${news.id}-wf-2`,
      type: 'image',
      imageUrl: news.cover || `https://picsum.photos/seed/${seed}-wf-image-a/1100/760`,
      caption: '抓取配图占位，可替换为原文图片。'
    },
    {
      id: `${news.id}-wf-4`,
      type: 'text',
      text: `围绕「${news.title}」，这里继续承接抓取正文，保持“图文混排 + 长段落”阅读体验，不做人工摘抄分类。`
    },
    {
      id: `${news.id}-wf-5`,
      type: 'video',
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: `https://picsum.photos/seed/${seed}-wf-video/1100/700`
    },
    {
      id: `${news.id}-wf-6`,
      type: 'image',
      imageUrl: `https://picsum.photos/seed/${seed}-wf-image-b/1100/980`,
      caption: '附加图像占位，用于还原原文流式结构。'
    },
    {
      id: `${news.id}-wf-7`,
      type: 'text',
      text: '这里预留追踪更新段落，可继续接入抓取时间、原站点信息、原文链接与修订记录。'
    }
  ];
};

const buildVirtualComments = (news: NewsItem): CommentItem[] => [
  {
    id: `${news.id}-comment-1`,
    userName: '产品经理-Luna',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    content: `这条「${news.categoryTag}」信息很及时，我们准备本周做一轮方案评估。`,
    time: '2小时前',
    likes: 16
  },
  {
    id: `${news.id}-comment-2`,
    userName: '架构师-Kevin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin',
    content: '希望后续补一版更细的性能和成本对比，会更容易做路线决策。',
    time: '1小时前',
    likes: 9
  },
  {
    id: `${news.id}-comment-3`,
    userName: '开发者-Mia',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
    content: '瀑布流阅读方式更像原文信息流，适合这种抓取来源场景。',
    time: '35分钟前',
    likes: 5
  }
];

const buildTermParagraphs = (term: string, definition: string): string[] => [
  `${term} 的核心定义：${definition}`,
  `${term} 在产品和工程实践中，通常对应能力边界、成本结构和评估指标三个观察面。`,
  `落地 ${term} 时，建议同时建设监控与回滚策略，确保从概念验证平滑过渡到稳定上线。`
];

const getNewsModuleLabel = (news: NewsItem): string => {
  if (news.type === 'flash') return '快讯';
  if (news.type === 'tutorial') return '教程';
  return '深度文章';
};

const getTutorialLevel = (item: NewsItem): string | null => {
  if (item.type !== 'tutorial') return null;
  if (item.difficulty === 'expert') return '专家';
  if (item.difficulty === 'intermediate') return '进阶';
  if (item.difficulty === 'beginner') return '入门';
  return '入门';
};

const getTutorialLevelBadgeClass = (level: string): string => {
  if (level === '专家') return 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/35';
  if (level === '进阶') return 'bg-cyan-500/15 text-cyan-300 border-cyan-400/35';
  return 'bg-lime-500/15 text-lime-300 border-lime-400/35';
};

const NewsHorizontalCard: React.FC<{
  item: NewsItem;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-4 md:p-5 flex gap-4"
  >
    <div className="w-36 md:w-44 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge label={item.categoryTag} />
        {item.type === 'tutorial' && getTutorialLevel(item) && (
          <Badge
            label={getTutorialLevel(item) as string}
            className={getTutorialLevelBadgeClass(getTutorialLevel(item) as string)}
          />
        )}
      </div>
      <h4 className="text-lg font-bold text-white line-clamp-2 mb-2">{item.title}</h4>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
        <span>{item.date}</span>
        <span className="flex items-center gap-1"><Flame size={12} fill="currentColor" className="text-orange-400" /> {item.importance}</span>
      </div>
    </div>
  </button>
);

const VideoHorizontalCard: React.FC<{
  item: VideoItem;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-4 md:p-5 flex gap-4"
  >
    <div className="relative w-36 md:w-44 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <span className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-black/65 text-[10px] font-bold text-white">{item.duration}</span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge label="优质视频" className="bg-pink-500/15 text-pink-300 border-pink-400/35" />
        {item.tags.slice(0, 1).map((tag) => (
          <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
        ))}
      </div>
      <h4 className="text-lg font-bold text-white line-clamp-2 mb-2">{item.title}</h4>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
        <span>{item.date}</span>
        <span className="flex items-center gap-1"><Eye size={12} /> {item.views.toLocaleString()}</span>
      </div>
    </div>
  </button>
);

const PodcastHorizontalCard: React.FC<{
  item: PodcastItem;
  onClick: () => void;
  isPlaying: boolean;
  onPreview: (e: React.MouseEvent) => void;
}> = ({ item, onClick, isPlaying, onPreview }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-4 md:p-5 flex gap-4"
  >
    <div className="relative w-36 md:w-44 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <button
        onClick={onPreview}
        className={cn(
          'absolute right-2 bottom-2 w-8 h-8 rounded-full border grid place-items-center transition-colors',
          isPlaying
            ? 'bg-[#1ed661] text-black border-[#1ed661]'
            : 'bg-black/55 text-white border-white/25 hover:border-[#1ed661]/45'
        )}
        aria-label={isPlaying ? '暂停预览' : '播放预览'}
      >
        {isPlaying ? <Pause size={13} /> : <PlayCircle size={13} />}
      </button>
      <span className="absolute left-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-black/65 text-[10px] font-bold text-white">{item.duration}</span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/35" />
        {item.tags.slice(0, 1).map((tag) => (
          <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
        ))}
      </div>
      <h4 className="text-lg font-bold text-white line-clamp-2 mb-2">{item.title}</h4>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
        <span>{item.date}</span>
        <span className="flex items-center gap-1"><Headphones size={12} /> {item.plays.toLocaleString()}</span>
      </div>
    </div>
  </button>
);

const TermHorizontalCard: React.FC<{
  item: TermArticle;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-4 md:p-5 flex gap-4"
  >
    <div className="w-36 md:w-44 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge label="术语百科" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30" />
        {item.topicTags.slice(0, 1).map((tag) => (
          <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
        ))}
      </div>
      <h4 className="text-lg font-bold text-white line-clamp-2 mb-2">{item.title}</h4>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest">
        <span>{item.date}</span>
        <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
      </div>
    </div>
  </button>
);

const ToolDetail: React.FC<{ tool: Tool; relatedNews: NewsItem[] }> = ({ tool, relatedNews }) => (
  <div className="max-w-4xl mx-auto">
    <button
      onClick={() => {
        window.location.hash = '#/';
      }}
      className="flex items-center gap-2 text-[#8b949e] hover:text-white mb-12 transition-colors group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      返回首页
    </button>

    <div className="text-center mb-16">
      <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
        <img src={tool.logo} alt={tool.name} className="w-16 h-16" referrerPolicy="no-referrer" />
      </div>
      <h1 className="text-5xl font-black mb-4 text-[#f0f6fc] tracking-tighter">{tool.name}</h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto">{tool.tagline}</p>
    </div>

    <Card className="p-8 mb-12">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#1ed661] mb-4">工具简介</h3>
      <p className="text-lg text-gray-300 leading-relaxed">{tool.description}</p>
    </Card>

    <div className="mb-16">
      <h3 className="text-sm font-black uppercase tracking-widest text-[#1ed661] mb-8">核心功能</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tool.features.map((feature, i) => (
          <div key={i} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex items-start gap-4">
            <div className="w-8 h-8 bg-[#1ed661]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-[#1ed661]" fill="currentColor" />
            </div>
            <p className="text-gray-200 font-bold">{feature}</p>
          </div>
        ))}
      </div>
    </div>

    {relatedNews.length > 0 && (
      <div className="mb-24">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#1ed661] mb-8">相关动态</h3>
        <div className="space-y-4">
          {relatedNews.map((news) => (
            <button
              key={news.id}
              className="w-full text-left p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all group"
              onClick={() => {
                openNewsDetailInNewTab(news.slug, window.location.hash || '#/');
              }}
            >
              <div className="flex items-center gap-4">
                <Badge label={news.categoryTag} />
                <span className="font-bold text-gray-300 group-hover:text-[#1ed661] transition-colors">{news.title}</span>
              </div>
              <TrendingUp size={18} className="text-gray-600 group-hover:text-[#1ed661] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    )}

    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
      <a
        href={tool.officialUrl}
        target="_blank"
        rel="nofollow"
        className="flex items-center gap-3 px-10 py-4 bg-[#1ed661] text-black font-black rounded-full shadow-[0_10px_40px_rgba(30,214,97,0.4)] hover:scale-105 transition-transform active:scale-95"
      >
        访问官网 <ExternalLink size={20} />
      </a>
    </div>
  </div>
);

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [listTab, setListTab] = useState<ListTab>('flash');
  const [searchTab, setSearchTab] = useState<SearchTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('aistore_theme_mode') === 'light';
  });
  const [flashViewMode, setFlashViewMode] = useState<FlashViewMode>('detail');
  const [flashCategoryFilter, setFlashCategoryFilter] = useState('全部快讯');
  const [contentLayoutMode, setContentLayoutMode] = useState<ContentLayoutMode>('list');
  const [articleReadProgress, setArticleReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isNewsMenuOpen, setIsNewsMenuOpen] = useState(false);
  const [isModelHubMenuOpen, setIsModelHubMenuOpen] = useState(false);
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [glossaryOffset, setGlossaryOffset] = useState(0);
  const [recommendOffset, setRecommendOffset] = useState(0);
  const [portalArticleQuickTag, setPortalArticleQuickTag] = useState('全部');
  const [portalTutorialQuickTag, setPortalTutorialQuickTag] = useState('全部');
  const [contentTopicFilter, setContentTopicFilter] = useState('全部');
  const [contentSourceFilter, setContentSourceFilter] = useState<SourceFilter>('all');
  const [contentThemeFilter, setContentThemeFilter] = useState<ThemeFilter>('all');
  const [contentSort, setContentSort] = useState<ContentSort>('hot');
  const [contentDateRange, setContentDateRange] = useState<ContentDateRange>('all');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('aistore_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedNewsIds, setLikedNewsIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('aistore_liked_news');
    return saved ? JSON.parse(saved) : [];
  });
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [videoLikedIds, setVideoLikedIds] = useState<string[]>([]);
  const [podcastLikedIds, setPodcastLikedIds] = useState<string[]>([]);
  const [videoLikeCounts, setVideoLikeCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(VIDEO_DATA.map((item) => [item.id, item.likes]))
  );
  const [podcastLikeCounts, setPodcastLikeCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(PODCAST_DATA.map((item) => [item.id, item.likes]))
  );
  const [playingPodcastId, setPlayingPodcastId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [commentDraft, setCommentDraft] = useState('');
  const [extraComments, setExtraComments] = useState<Record<string, CommentItem[]>>({});
  const articleRef = useRef<HTMLElement | null>(null);
  const podcastPreviewRef = useRef<HTMLAudioElement | null>(null);
  const podcastDetailAudioRef = useRef<HTMLAudioElement | null>(null);
  const [podcastDurationSec, setPodcastDurationSec] = useState(0);
  const [podcastCurrentSec, setPodcastCurrentSec] = useState(0);
  const [isPodcastDetailPlaying, setIsPodcastDetailPlaying] = useState(false);

  const tutorialFeed = useMemo(() => buildTutorialFeed(NEWS_DATA), []);
  const termArticles = useMemo(() => buildTermArticles(GLOSSARY_DATA), []);

  const allNews = useMemo(() => {
    const seen = new Set<string>();
    const merged: NewsItem[] = [];
    [...NEWS_DATA, ...tutorialFeed].forEach((item) => {
      if (seen.has(item.slug)) return;
      seen.add(item.slug);
      merged.push(item);
    });
    return merged;
  }, [tutorialFeed]);
  const portalFeaturedArticles = useMemo(
    () => allNews.filter((item) => item.type === 'article').slice(0, 8),
    [allNews]
  );
  const portalFlashFeed = useMemo(() => buildPortalFlashFeed(allNews), [allNews]);
  const portalGlossaryItems = useMemo(() => {
    if (!GLOSSARY_DATA.length) return [];
    const start = glossaryOffset % GLOSSARY_DATA.length;
    return [...GLOSSARY_DATA.slice(start), ...GLOSSARY_DATA.slice(0, start)];
  }, [glossaryOffset]);

  const portalArticleQuickTags = useMemo(() => {
    const tags = new Set<string>();
    allNews
      .filter((item) => item.type === 'article')
      .forEach((item) => getNewsTopicTags(item).forEach((tag) => tags.add(tag)));
    return ['全部', ...Array.from(tags).slice(0, 7)];
  }, [allNews]);

  const portalTutorialQuickTags = useMemo(() => {
    const tags = new Set<string>();
    tutorialFeed.forEach((item) => getNewsTopicTags(item).forEach((tag) => tags.add(tag)));
    return ['全部', ...Array.from(tags).slice(0, 7)];
  }, [tutorialFeed]);

  const portalFilteredArticles = useMemo(() => {
    const source = allNews.filter((item) => item.type === 'article');
    const filtered =
      portalArticleQuickTag === '全部'
        ? source
        : source.filter((item) => getNewsTopicTags(item).includes(portalArticleQuickTag));
    return filtered.slice(0, 4);
  }, [allNews, portalArticleQuickTag]);

  const portalFilteredTutorials = useMemo(() => {
    const filtered =
      portalTutorialQuickTag === '全部'
        ? tutorialFeed
        : tutorialFeed.filter((item) => getNewsTopicTags(item).includes(portalTutorialQuickTag));
    return filtered.slice(0, 4);
  }, [tutorialFeed, portalTutorialQuickTag]);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      setIsNewsMenuOpen(false);
      setIsModelHubMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!hash.startsWith('#/list')) return;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const tab = params.get('tab');
    if (
      tab === 'flash' ||
      tab === 'article' ||
      tab === 'tutorial' ||
      tab === 'knowledge' ||
      tab === 'video' ||
      tab === 'podcast'
    ) {
      setListTab(tab);
      return;
    }
    setListTab('flash');
  }, [hash]);

  useEffect(() => {
    setContentTopicFilter('全部');
    setContentSourceFilter('all');
    setContentThemeFilter('all');
    setContentSort('hot');
    setContentDateRange('all');
    if (listTab === 'flash') {
      setFlashCategoryFilter('全部快讯');
    }
  }, [listTab]);

  useEffect(() => {
    if (!hash.startsWith('#/search')) return;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const tab = params.get('tab');
    if (
      tab === 'all' ||
      tab === 'flash' ||
      tab === 'article' ||
      tab === 'tutorial' ||
      tab === 'knowledge' ||
      tab === 'video' ||
      tab === 'podcast'
    ) {
      setSearchTab(tab);
      return;
    }
    setSearchTab('all');
  }, [hash]);

  useEffect(() => {
    if (!hash.startsWith('#/detail/')) return;
    setRecommendOffset(0);
  }, [hash]);

  useEffect(() => {
    if (!portalFeaturedArticles.length) {
      setFeaturedSlideIndex(0);
      return;
    }
    setFeaturedSlideIndex((prev) => (prev >= portalFeaturedArticles.length ? 0 : prev));
  }, [portalFeaturedArticles.length]);

  useEffect(() => {
    if (!portalArticleQuickTags.includes(portalArticleQuickTag)) {
      setPortalArticleQuickTag('全部');
    }
  }, [portalArticleQuickTags, portalArticleQuickTag]);

  useEffect(() => {
    if (!portalTutorialQuickTags.includes(portalTutorialQuickTag)) {
      setPortalTutorialQuickTag('全部');
    }
  }, [portalTutorialQuickTags, portalTutorialQuickTag]);

  useEffect(() => {
    localStorage.setItem('aistore_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('aistore_liked_news', JSON.stringify(likedNewsIds));
  }, [likedNewsIds]);

  useEffect(() => {
    localStorage.setItem('aistore_theme_mode', isLightMode ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  useEffect(() => {
    setLikeCounts((prev) => {
      const next = { ...prev };
      let changed = false;

      allNews.forEach((item) => {
        if (next[item.id] == null) {
          next[item.id] = Math.max(12, Math.round(item.readCount * 0.03));
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [allNews]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hash, listTab]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!shareFeedback) return;
    const timer = window.setTimeout(() => setShareFeedback(''), 1800);
    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  useEffect(() => {
    const player = new Audio();
    player.preload = 'none';
    const handleEnded = () => setPlayingPodcastId(null);
    player.addEventListener('ended', handleEnded);
    podcastPreviewRef.current = player;
    return () => {
      player.pause();
      player.removeEventListener('ended', handleEnded);
      podcastPreviewRef.current = null;
    };
  }, []);

  const view = useMemo<View>(() => {
    if (hash === '#/' || hash === '#/home') return 'home';
    if (hash.startsWith('#/ai-tools-2')) return 'ai_tools_2';
    if (hash.startsWith('#/ai-tools')) return 'ai_tools';
    if (hash.startsWith('#/guide')) return 'guide';
    if (hash.startsWith('#/channels')) return 'channels';
    if (hash.startsWith('#/infrastructure')) return 'infrastructure';
    if (hash.startsWith('#/model-hub')) return 'model_hub';
    if (hash === '#/portal') return 'portal';
    if (hash.startsWith('#/learning-path')) return 'learning_path';
    if (hash.startsWith('#/list')) return 'list';
    if (hash.startsWith('#/detail/')) return 'detail';
    if (hash.startsWith('#/video/')) return 'video';
    if (hash.startsWith('#/podcast/')) return 'podcast';
    if (hash.startsWith('#/term/')) return 'term';
    if (hash.startsWith('#/tool/')) return 'tool';
    if (hash.startsWith('#/section/')) return 'section';
    if (hash.startsWith('#/search')) return 'search';
    return 'home';
  }, [hash]);

  useEffect(() => {
    if (view === 'portal') return;
    podcastPreviewRef.current?.pause();
    setPlayingPodcastId(null);
  }, [view]);

  const detailParams = useMemo(() => {
    if (!hash.startsWith('#/detail/')) return new URLSearchParams();
    return new URLSearchParams(hash.split('?')[1] || '');
  }, [hash]);

  const termParams = useMemo(() => {
    if (!hash.startsWith('#/term/')) return new URLSearchParams();
    return new URLSearchParams(hash.split('?')[1] || '');
  }, [hash]);

  const currentSlug = hash.startsWith('#/detail/') ? hash.split('#/detail/')[1]?.split('?')[0] : null;
  const currentNews = useMemo(() => allNews.find((item) => item.slug === currentSlug), [allNews, currentSlug]);

  const currentTermId = hash.startsWith('#/term/') ? hash.split('#/term/')[1]?.split('?')[0] : null;
  const currentTerm = useMemo(
    () =>
      GLOSSARY_DATA.find(
        (item) => item.id === currentTermId || item.term.toLowerCase() === (currentTermId || '').toLowerCase()
      ),
    [currentTermId]
  );
  const currentTermArticle = useMemo(
    () => termArticles.find((item) => item.id === currentTerm?.id) || null,
    [termArticles, currentTerm]
  );
  const currentTermIndex = currentTerm ? GLOSSARY_DATA.findIndex((item) => item.id === currentTerm.id) : -1;
  const previousTerm = currentTermIndex > 0 ? GLOSSARY_DATA[currentTermIndex - 1] : null;
  const nextTerm =
    currentTermIndex >= 0 && currentTermIndex < GLOSSARY_DATA.length - 1
      ? GLOSSARY_DATA[currentTermIndex + 1]
      : null;

  const currentToolId = hash.startsWith('#/tool/') ? hash.slice(7).split('?')[0] : null;
  const currentTool = currentToolId ? TOOLS_DATA[currentToolId] : null;

  const currentVideoSlug = hash.startsWith('#/video/') ? hash.split('#/video/')[1]?.split('?')[0] : null;
  const currentVideo = useMemo(
    () => VIDEO_DATA.find((item) => item.slug === currentVideoSlug || item.id === currentVideoSlug) || null,
    [currentVideoSlug]
  );
  const currentVideoIndex = currentVideo ? VIDEO_DATA.findIndex((item) => item.id === currentVideo.id) : -1;
  const previousVideo = currentVideoIndex > 0 ? VIDEO_DATA[currentVideoIndex - 1] : null;
  const nextVideo = currentVideoIndex >= 0 && currentVideoIndex < VIDEO_DATA.length - 1 ? VIDEO_DATA[currentVideoIndex + 1] : null;
  const relatedVideos = useMemo(
    () => (currentVideo ? VIDEO_DATA.filter((item) => item.id !== currentVideo.id).slice(0, 3) : VIDEO_DATA.slice(0, 3)),
    [currentVideo]
  );

  const currentPodcastSlug = hash.startsWith('#/podcast/') ? hash.split('#/podcast/')[1]?.split('?')[0] : null;
  const currentPodcast = useMemo(
    () => PODCAST_DATA.find((item) => item.slug === currentPodcastSlug || item.id === currentPodcastSlug) || null,
    [currentPodcastSlug]
  );
  const currentPodcastIndex = currentPodcast ? PODCAST_DATA.findIndex((item) => item.id === currentPodcast.id) : -1;
  const previousPodcast = currentPodcastIndex > 0 ? PODCAST_DATA[currentPodcastIndex - 1] : null;
  const nextPodcast =
    currentPodcastIndex >= 0 && currentPodcastIndex < PODCAST_DATA.length - 1
      ? PODCAST_DATA[currentPodcastIndex + 1]
      : null;
  const relatedPodcasts = useMemo(
    () =>
      currentPodcast
        ? PODCAST_DATA.filter((item) => item.id !== currentPodcast.id).slice(0, 3)
        : PODCAST_DATA.slice(0, 3),
    [currentPodcast]
  );

  useEffect(() => {
    setPodcastCurrentSec(0);
    setPodcastDurationSec(currentPodcast ? parseDurationLabelToSeconds(currentPodcast.duration) : 0);
    setIsPodcastDetailPlaying(false);
    if (podcastDetailAudioRef.current) {
      podcastDetailAudioRef.current.pause();
      podcastDetailAudioRef.current.currentTime = 0;
    }
  }, [currentPodcast?.id]);

  const currentSectionKey = hash.startsWith('#/section/') ? hash.split('#/section/')[1]?.split('?')[0] : null;

  const currentNewsIndex = currentNews ? allNews.findIndex((item) => item.slug === currentNews.slug) : -1;
  const previousNews = currentNewsIndex > 0 ? allNews[currentNewsIndex - 1] : null;
  const nextNews =
    currentNewsIndex >= 0 && currentNewsIndex < allNews.length - 1 ? allNews[currentNewsIndex + 1] : null;

  const detailBlocks = useMemo(() => (currentNews ? buildWaterfallBlocks(currentNews) : []), [currentNews]);

  const recommendPool = useMemo(
    () => (currentNews ? allNews.filter((item) => item.slug !== currentNews.slug && item.type !== 'flash') : []),
    [allNews, currentNews]
  );

  const recommendedNews = useMemo(
    () => {
      if (!recommendPool.length) return [];
      const pool = [...recommendPool];
      const start = recommendOffset % pool.length;
      return [...pool.slice(start), ...pool.slice(0, start)].slice(0, 3);
    },
    [recommendPool, recommendOffset]
  );

  const virtualComments = useMemo(() => (currentNews ? buildVirtualComments(currentNews) : []), [currentNews]);

  const mergedComments = currentNews
    ? [...(extraComments[currentNews.slug] || []), ...virtualComments]
    : [];

  const currentLikeCount = currentNews ? likeCounts[currentNews.id] ?? 0 : 0;
  const isCurrentNewsLiked = currentNews ? likedNewsIds.includes(currentNews.id) : false;
  const currentNewsModule = currentNews ? getNewsModuleLabel(currentNews) : '';
  const currentNewsListTab: ListTab = currentNews
    ? currentNews.type === 'tutorial'
      ? 'tutorial'
      : currentNews.type === 'flash'
        ? 'flash'
        : 'article'
    : 'article';
  const detailFromHash = detailParams.get('from') || '';
  const detailBackHash = detailFromHash || '#/portal';
  const detailBackLabel = getBackLabelFromHash(detailBackHash);
  const termFromHash = termParams.get('from') || '';
  const termBackHash = termFromHash || '#/portal';
  const termBackLabel = getBackLabelFromHash(termBackHash);
  const currentVideoLikeCount = currentVideo ? videoLikeCounts[currentVideo.id] ?? currentVideo.likes : 0;
  const isCurrentVideoLiked = currentVideo ? videoLikedIds.includes(currentVideo.id) : false;
  const currentPodcastLikeCount = currentPodcast ? podcastLikeCounts[currentPodcast.id] ?? currentPodcast.likes : 0;
  const isCurrentPodcastLiked = currentPodcast ? podcastLikedIds.includes(currentPodcast.id) : false;

  useEffect(() => {
    if (view !== 'detail' || !currentNews) {
      setArticleReadProgress(0);
      return;
    }

    const updateProgress = () => {
      const article = articleRef.current;
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const start = articleTop - 140;
      const end = articleTop + articleHeight - viewportHeight * 0.45;
      const distance = Math.max(end - start, 1);
      const raw = ((window.scrollY - start) / distance) * 100;
      const normalized = Math.min(100, Math.max(0, raw));
      setArticleReadProgress(normalized);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [view, currentNews, detailBlocks.length]);

  const currentSearchQuery = useMemo(() => {
    if (!hash.startsWith('#/search')) return '';
    const params = new URLSearchParams(hash.split('?')[1] || '');
    return (params.get('q') || '').trim();
  }, [hash]);

  const searchNewsResults = useMemo(
    () =>
      currentSearchQuery
        ? allNews.filter(
            (item) =>
              item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.summary.toLowerCase().includes(currentSearchQuery.toLowerCase())
          )
        : [],
    [allNews, currentSearchQuery]
  );

  const searchTermResults = useMemo(
    () =>
      currentSearchQuery
        ? termArticles.filter(
            (item) =>
              item.term.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.summary.toLowerCase().includes(currentSearchQuery.toLowerCase())
          )
        : [],
    [termArticles, currentSearchQuery]
  );

  useEffect(() => {
    if (!hash.startsWith('#/search')) return;
    setSearchQuery(currentSearchQuery);
  }, [currentSearchQuery, hash]);

  const searchFlashResults = useMemo(
    () => searchNewsResults.filter((item) => item.type === 'flash'),
    [searchNewsResults]
  );
  const searchArticleResults = useMemo(
    () => searchNewsResults.filter((item) => item.type === 'article'),
    [searchNewsResults]
  );
  const searchTutorialResults = useMemo(
    () => searchNewsResults.filter((item) => item.type === 'tutorial'),
    [searchNewsResults]
  );
  const searchVideoResults = useMemo(
    () =>
      currentSearchQuery
        ? VIDEO_DATA.filter(
            (item) =>
              item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.summary.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.tags.join(' ').toLowerCase().includes(currentSearchQuery.toLowerCase())
          )
        : [],
    [currentSearchQuery]
  );
  const searchPodcastResults = useMemo(
    () =>
      currentSearchQuery
        ? PODCAST_DATA.filter(
            (item) =>
              item.title.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.summary.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
              item.tags.join(' ').toLowerCase().includes(currentSearchQuery.toLowerCase())
          )
        : [],
    [currentSearchQuery]
  );

  const isWithinDateRange = (date: string): boolean => {
    if (contentDateRange === 'all') return true;
    const dayMap: Record<Exclude<ContentDateRange, 'all'>, number> = {
      '3d': 3,
      '7d': 7,
      '30d': 30
    };
    const target = parseDateValue(date);
    const now = new Date().getTime();
    const diffDays = Math.floor((now - target) / (24 * 60 * 60 * 1000));
    return diffDays <= dayMap[contentDateRange];
  };

  const getSortedNews = (items: NewsItem[]): NewsItem[] => {
    const sorted = [...items];
    if (contentSort === 'latest') {
      sorted.sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
      return sorted;
    }
    if (contentSort === 'most_read') {
      sorted.sort((a, b) => b.readCount - a.readCount);
      return sorted;
    }
    sorted.sort((a, b) => b.importance * 1000 + b.readCount - (a.importance * 1000 + a.readCount));
    return sorted;
  };

  const getSortedTerms = (items: TermArticle[]): TermArticle[] => {
    const sorted = [...items];
    if (contentSort === 'latest') {
      sorted.sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
      return sorted;
    }
    sorted.sort((a, b) => b.readCount - a.readCount);
    return sorted;
  };

  const articleItems = useMemo(() => allNews.filter((item) => item.type === 'article'), [allNews]);
  const tutorialItems = useMemo(() => tutorialFeed, [tutorialFeed]);
  const knowledgeItems = useMemo(() => termArticles, [termArticles]);
  const videoItems = useMemo(() => VIDEO_DATA, []);
  const podcastItems = useMemo(() => PODCAST_DATA, []);

  const listTopicOptions = useMemo(() => {
    if (listTab === 'article') {
      const tags = new Set<string>();
      articleItems.forEach((item) => getNewsTopicTags(item).forEach((tag) => tags.add(tag)));
      return ['全部', ...Array.from(tags).slice(0, 10)];
    }
    if (listTab === 'tutorial') {
      const tags = new Set<string>();
      tutorialItems.forEach((item) => getNewsTopicTags(item).forEach((tag) => tags.add(tag)));
      return ['全部', ...Array.from(tags).slice(0, 10)];
    }
    if (listTab === 'knowledge') {
      const tags = new Set<string>();
      knowledgeItems.forEach((item) => getTermTopicTags(item).forEach((tag) => tags.add(tag)));
      return ['全部', ...Array.from(tags).slice(0, 10)];
    }
    if (listTab === 'video') {
      const tags = new Set<string>();
      videoItems.forEach((item) => getVideoTopicTags(item).forEach((tag) => tags.add(tag)));
      return ['全部', ...Array.from(tags).slice(0, 10)];
    }
    if (listTab === 'podcast') {
      const tags = new Set<string>();
      podcastItems.forEach((item) => getPodcastTopicTags(item).forEach((tag) => tags.add(tag)));
      return ['全部', ...Array.from(tags).slice(0, 10)];
    }
    return ['全部'];
  }, [articleItems, tutorialItems, knowledgeItems, videoItems, podcastItems, listTab]);

  const filteredArticleItems = useMemo(() => {
    const filtered = articleItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getNewsTopicTags(item).includes(contentTopicFilter);
      const bySource = contentSourceFilter === 'all' || getNewsSource(item) === contentSourceFilter;
      const byTheme = contentThemeFilter === 'all' || getNewsTheme(item) === contentThemeFilter;
      return byTopic && bySource && byTheme && isWithinDateRange(item.date);
    });
    return getSortedNews(filtered);
  }, [articleItems, contentTopicFilter, contentSourceFilter, contentThemeFilter, contentDateRange, contentSort]);

  const filteredTutorialItems = useMemo(() => {
    const filtered = tutorialItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getNewsTopicTags(item).includes(contentTopicFilter);
      const bySource = contentSourceFilter === 'all' || getNewsSource(item) === contentSourceFilter;
      const byTheme = contentThemeFilter === 'all' || getNewsTheme(item) === contentThemeFilter;
      return byTopic && bySource && byTheme && isWithinDateRange(item.date);
    });
    return getSortedNews(filtered);
  }, [tutorialItems, contentTopicFilter, contentSourceFilter, contentThemeFilter, contentDateRange, contentSort]);

  const filteredKnowledgeItems = useMemo(() => {
    const filtered = knowledgeItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getTermTopicTags(item).includes(contentTopicFilter);
      return byTopic && isWithinDateRange(item.date);
    });
    return getSortedTerms(filtered);
  }, [knowledgeItems, contentTopicFilter, contentDateRange, contentSort]);

  const filteredVideoItems = useMemo(() => {
    const filtered = videoItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getVideoTopicTags(item).includes(contentTopicFilter);
      const bySource = contentSourceFilter === 'all' || getVideoSource(item) === contentSourceFilter;
      const byTheme = contentThemeFilter === 'all' || getVideoTheme(item) === contentThemeFilter;
      return byTopic && bySource && byTheme && isWithinDateRange(item.date);
    });
    const sorted = [...filtered];
    if (contentSort === 'latest') {
      sorted.sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
    } else if (contentSort === 'most_read') {
      sorted.sort((a, b) => b.views - a.views);
    } else {
      sorted.sort((a, b) => b.views + b.likes * 10 - (a.views + a.likes * 10));
    }
    return sorted;
  }, [videoItems, contentTopicFilter, contentSourceFilter, contentThemeFilter, contentDateRange, contentSort]);

  const filteredPodcastItems = useMemo(() => {
    const filtered = podcastItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getPodcastTopicTags(item).includes(contentTopicFilter);
      const bySource = contentSourceFilter === 'all' || getPodcastSource(item) === contentSourceFilter;
      const byTheme = contentThemeFilter === 'all' || getPodcastTheme(item) === contentThemeFilter;
      return byTopic && bySource && byTheme && isWithinDateRange(item.date);
    });
    const sorted = [...filtered];
    if (contentSort === 'latest') {
      sorted.sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));
    } else if (contentSort === 'most_read') {
      sorted.sort((a, b) => b.plays - a.plays);
    } else {
      sorted.sort((a, b) => b.plays + b.likes * 12 - (a.plays + a.likes * 12));
    }
    return sorted;
  }, [podcastItems, contentTopicFilter, contentSourceFilter, contentThemeFilter, contentDateRange, contentSort]);

  const flashItems = useMemo(() => allNews.filter((item) => item.type === 'flash'), [allNews]);
  const flashCategoryOptions = useMemo(() => {
    const tags = Array.from(new Set(flashItems.map((item) => item.categoryTag)));
    return ['全部快讯', ...tags];
  }, [flashItems]);

  const contentAllTopicLabel = useMemo(() => {
    if (listTab === 'article') return '全部好文';
    if (listTab === 'tutorial') return '全部教程';
    if (listTab === 'knowledge') return '全部术语';
    if (listTab === 'video') return '全部视频';
    if (listTab === 'podcast') return '全部播客';
    return '全部分类';
  }, [listTab]);

  const filteredFlashItems = useMemo(() => {
    const filtered = flashItems.filter((item) => {
      const byCategory =
        flashCategoryFilter === '全部快讯' || item.categoryTag === flashCategoryFilter;
      const bySource = contentSourceFilter === 'all' || getNewsSource(item) === contentSourceFilter;
      const byTheme = contentThemeFilter === 'all' || getNewsTheme(item) === contentThemeFilter;
      return byCategory && bySource && byTheme && isWithinDateRange(item.date);
    });

    const sorted = [...filtered];
    if (contentSort === 'latest') {
      sorted.sort((a, b) => parseDateTimeValue(b.date, b.exactTime) - parseDateTimeValue(a.date, a.exactTime));
      return sorted;
    }
    if (contentSort === 'most_read') {
      sorted.sort((a, b) => b.readCount - a.readCount);
      return sorted;
    }
    sorted.sort((a, b) => {
      const scoreA = a.importance * 1000 + a.readCount;
      const scoreB = b.importance * 1000 + b.readCount;
      if (scoreA === scoreB) {
        return parseDateTimeValue(b.date, b.exactTime) - parseDateTimeValue(a.date, a.exactTime);
      }
      return scoreB - scoreA;
    });
    return sorted;
  }, [flashItems, flashCategoryFilter, contentSourceFilter, contentThemeFilter, contentDateRange, contentSort]);

  const hotSearchKeywords = useMemo(
    () => [
      { keyword: 'Claude 3.5 评测', trend: 'up' as const },
      { keyword: 'Nvidia 股价波动', trend: 'up' as const },
      { keyword: 'Gemini 1.5 Pro 接口', trend: 'down' as const },
      { keyword: 'GPT-5 内部测试', trend: 'up' as const },
      { keyword: 'Llama 3 微调', trend: 'down' as const },
      { keyword: 'AI 合规法案', trend: 'up' as const }
    ],
    []
  );

  const runSearch = (query: string, tab: SearchTab = 'all') => {
    const q = query.trim();
    if (!q) return;
    window.location.hash = `#/search?q=${encodeURIComponent(q)}&tab=${tab}`;
  };

  const goToListTab = (tab: ListTab) => {
    setListTab(tab);
    window.location.hash = `#/list?tab=${tab}`;
    setIsNewsMenuOpen(false);
  };

  const goToSearchTab = (tab: SearchTab) => {
    if (!currentSearchQuery) return;
    window.location.hash = `#/search?q=${encodeURIComponent(currentSearchQuery)}&tab=${tab}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    runSearch(searchQuery, 'all');
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleLike = (newsId: string) => {
    setLikedNewsIds((prev) => {
      const liked = prev.includes(newsId);
      setLikeCounts((counts) => ({
        ...counts,
        [newsId]: Math.max(0, (counts[newsId] ?? 0) + (liked ? -1 : 1))
      }));
      return liked ? prev.filter((id) => id !== newsId) : [...prev, newsId];
    });
  };

  const handleShareNews = async (news: NewsItem) => {
    const link = `${window.location.origin}${window.location.pathname}#/detail/${news.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('链接已复制');
    } catch {
      setShareFeedback('复制失败，请手动复制地址');
    }
  };

  const handleShareTerm = async (term: GlossaryItem) => {
    const link = `${window.location.origin}${window.location.pathname}#/term/${term.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('术语链接已复制');
    } catch {
      setShareFeedback('复制失败，请手动复制地址');
    }
  };

  const handleShareVideo = async (video: VideoItem) => {
    const link = `${window.location.origin}${window.location.pathname}#/video/${video.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('视频链接已复制');
    } catch {
      setShareFeedback('复制失败，请手动复制地址');
    }
  };

  const handleSharePodcast = async (podcast: PodcastItem) => {
    const link = `${window.location.origin}${window.location.pathname}#/podcast/${podcast.slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('博客链接已复制');
    } catch {
      setShareFeedback('复制失败，请手动复制地址');
    }
  };

  const handleOpenSource = (news: NewsItem) => {
    if (!news.sourceUrl || news.sourceUrl === '#') {
      setShareFeedback('来源链接待补充');
      return;
    }
    window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenExternalSource = (sourceUrl: string) => {
    if (!sourceUrl || sourceUrl === '#') {
      setShareFeedback('来源链接待补充');
      return;
    }
    window.open(sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleVideoLike = (videoId: string) => {
    setVideoLikedIds((prev) => {
      const liked = prev.includes(videoId);
      setVideoLikeCounts((counts) => ({
        ...counts,
        [videoId]: Math.max(0, (counts[videoId] ?? 0) + (liked ? -1 : 1))
      }));
      return liked ? prev.filter((id) => id !== videoId) : [...prev, videoId];
    });
  };

  const handleTogglePodcastLike = (podcastId: string) => {
    setPodcastLikedIds((prev) => {
      const liked = prev.includes(podcastId);
      setPodcastLikeCounts((counts) => ({
        ...counts,
        [podcastId]: Math.max(0, (counts[podcastId] ?? 0) + (liked ? -1 : 1))
      }));
      return liked ? prev.filter((id) => id !== podcastId) : [...prev, podcastId];
    });
  };

  const handleTogglePodcastPreview = async (podcast: PodcastItem) => {
    const player = podcastPreviewRef.current;
    if (!player) return;

    if (playingPodcastId === podcast.id && !player.paused) {
      player.pause();
      setPlayingPodcastId(null);
      return;
    }

    try {
      if (player.src !== podcast.audioUrl) {
        player.src = podcast.audioUrl;
      }
      await player.play();
      setPlayingPodcastId(podcast.id);
    } catch {
      setShareFeedback('音频暂不可播放，请稍后重试');
    }
  };

  const handleTogglePodcastDetailPlayback = async () => {
    const player = podcastDetailAudioRef.current;
    if (!player) return;

    if (player.paused) {
      try {
        await player.play();
        setIsPodcastDetailPlaying(true);
      } catch {
        setShareFeedback('音频暂不可播放，请稍后重试');
      }
      return;
    }

    player.pause();
    setIsPodcastDetailPlaying(false);
  };

  const handleSubmitComment = () => {
    if (!currentNews || !isLoggedIn || !commentDraft.trim()) return;

    const comment: CommentItem = {
      id: `${currentNews.slug}-self-${Date.now()}`,
      userName: '当前用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
      content: commentDraft.trim(),
      time: '刚刚',
      likes: 0
    };

    setExtraComments((prev) => ({
      ...prev,
      [currentNews.slug]: [comment, ...(prev[currentNews.slug] || [])]
    }));
    setCommentDraft('');
  };

  const renderHome = () => {
    const entries = [
      { title: 'Skill', desc: '精选技能与工作流模板。', href: '#/section/skill', icon: Code },
      { title: 'MCP', desc: '连接器与工具能力实践。', href: '#/section/mcp', icon: Zap },
      { title: '大模型', desc: '模型评测、选型与趋势。', href: '#/model-hub/ai-models/providers', icon: Cpu },
      { title: '资讯', desc: '进入资讯聚合页，查看更多内容。', href: '#/portal', icon: Newspaper },
      { title: '安全实验室', desc: 'AI 安全攻防与治理观察。', href: '#/section/security', icon: Shield }
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-16">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-10 md:p-14">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1ed661]/15 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <Badge label="AISTORE 首页" className="mb-5 bg-[#1ed661]/15 text-[#1ed661] border-[#1ed661]/30" />
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
              保持专业节奏hhhhh，
              <br />
              一站进入 <span className="text-[#1ed661]">AI 资讯体系</span>
            </h1>
            <p className="text-gray-400 max-w-3xl text-lg leading-relaxed mb-8">
              首页作为主入口，资讯承载聚合页面，聚合页中的“查看更多”进入分类列表与术语百科。
            </p>
            <a href="#/portal" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1ed661] text-black font-black rounded-full hover:scale-105 transition-transform">
              进入资讯聚合
              <TrendingUp size={18} />
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {entries.map((entry) => (
            <a
              key={entry.title}
              href={entry.href}
              className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#1ed661]/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <entry.icon size={20} className="text-[#1ed661]" />
              </div>
              <h3 className="text-lg font-black mb-2 group-hover:text-[#1ed661] transition-colors">{entry.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{entry.desc}</p>
            </a>
          ))}
        </section>
      </motion.div>
    );
  };

  const renderSection = (sectionKey: string | null) => {
    const sectionMeta: Record<string, { title: string; intro: string; accent: string }> = {
      skill: { title: 'Skill', intro: '聚焦技能模板、工作流与效率实践。', accent: 'from-cyan-500/20 to-cyan-400/5' },
      mcp: { title: 'MCP', intro: '连接器与工具调用方案、场景拆解与实战。', accent: 'from-indigo-500/20 to-indigo-400/5' },
      model: { title: '大模型', intro: '跟踪模型能力、成本、推理表现与选型建议。', accent: 'from-emerald-500/20 to-emerald-400/5' },
      security: { title: '安全实验室', intro: '聚焦模型安全、数据风险与合规治理。', accent: 'from-orange-500/20 to-orange-400/5' }
    };

    const meta = sectionKey ? sectionMeta[sectionKey] : null;
    const fallback = { title: '内容建设中', intro: '该频道正在完善中。', accent: 'from-white/10 to-white/5' };
    const usedMeta = meta || fallback;
    const picks = allNews.filter((item) => item.type === 'article').slice(0, 3);

    return (
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-10">
        <section className={cn('rounded-3xl border border-white/10 bg-gradient-to-br p-10', usedMeta.accent)}>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{usedMeta.title}</h1>
          <p className="text-lg text-gray-300 max-w-2xl">{usedMeta.intro}</p>
          <div className="mt-8">
            <a href="#/portal" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-black hover:bg-[#1ed661] transition-colors">
              去资讯聚合页
              <TrendingUp size={16} />
            </a>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black">推荐阅读</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {picks.map((item) => (
              <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/')} />
            ))}
          </div>
        </section>
      </motion.div>
    );
  };

  const renderPortal = () => {
    const featured = portalFeaturedArticles[featuredSlideIndex] || portalFeaturedArticles[0];
    const flashes = portalFlashFeed;
    const articles = portalFilteredArticles;
    const tutorials = portalFilteredTutorials;
    const videoPicks = VIDEO_DATA.slice(0, 4);
    const podcastPicks = PODCAST_DATA.slice(0, 3);
    const tools = Object.values(TOOLS_DATA).slice(0, 4);

    const goPrevFeatured = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!portalFeaturedArticles.length) return;
      setFeaturedSlideIndex((prev) => (prev - 1 + portalFeaturedArticles.length) % portalFeaturedArticles.length);
    };

    const goNextFeatured = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!portalFeaturedArticles.length) return;
      setFeaturedSlideIndex((prev) => (prev + 1) % portalFeaturedArticles.length);
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-14 md:gap-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {featured && (
            <div
              className="relative aspect-[16/10] lg:aspect-auto lg:h-[500px] rounded-3xl overflow-hidden cursor-pointer group border border-white/10"
              onClick={() => openNewsDetailInNewTab(featured.slug, window.location.hash || '#/portal')}
            >
              <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#1ed661] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(30,214,97,0.4)]">今日必读</span>
                  <span className="px-2 py-0.5 bg-[#1ed661]/20 text-[#1ed661] text-[10px] font-bold rounded uppercase tracking-wider">#{featured.categoryTag}</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-5 leading-tight tracking-tight text-white group-hover:text-[#1ed661] transition-colors line-clamp-3">{featured.title}</h2>
                <p className="text-base md:text-lg text-gray-300 max-w-2xl line-clamp-2 opacity-85">{featured.portal_summary || featured.summary}</p>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                <button
                  onClick={goPrevFeatured}
                  className="w-9 h-9 rounded-full border border-white/20 bg-[#0d1117]/70 text-white hover:border-[#1ed661]/50 hover:text-[#1ed661] transition-colors grid place-items-center"
                  aria-label="上一条推荐"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={goNextFeatured}
                  className="w-9 h-9 rounded-full border border-white/20 bg-[#0d1117]/70 text-white hover:border-[#1ed661]/50 hover:text-[#1ed661] transition-colors grid place-items-center"
                  aria-label="下一条推荐"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl p-7 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black flex items-center gap-3 text-gray-100">
                <Clock className="text-gray-100" size={24} />
                实时快讯
              </h3>
              <a href="#/list?tab=flash" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#1ed661] transition-colors">
                查看全部
                <ArrowRight size={12} />
              </a>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1ed661]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#1ed661]/70">
              {flashes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/portal')}
                  className="w-full text-left flex gap-3 rounded-xl border border-transparent p-3 hover:bg-[#1ed661]/10 hover:border-[#1ed661]/20 transition-colors group/item"
                >
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-[#1ed661] shadow-[0_0_10px_rgba(30,214,97,0.5)] group-hover/item:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-gray-500 mb-1 block">
                      {item.date} · {item.exactTime}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-300 group-hover/item:text-[#9ef1bd] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className="space-y-6 order-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <BookOpen className="text-gray-100" size={28} />
              术语百科
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGlossaryOffset((prev) => prev + 1)}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.02] text-gray-300 hover:text-[#1ed661] hover:border-[#1ed661]/40 transition-colors grid place-items-center"
                aria-label="刷新术语"
              >
                <RotateCw size={15} />
              </button>
              <a href="#/list?tab=knowledge" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
                查看全部术语
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
	          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
	            {portalGlossaryItems.map((item) => (
	              <button
	                key={item.id}
	                onClick={() => navigateToTermDetail(item.id, window.location.hash || '#/portal')}
	                className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-left hover:bg-[#1ed661]/10 hover:border-[#1ed661]/30 transition-all"
	              >
	                <p className="text-sm font-bold text-gray-100">{item.term}</p>
	                <p className="mt-2 text-xs text-gray-400 leading-5 line-clamp-3">{item.definition}</p>
	              </button>
	            ))}
	          </div>
        </section>

        <section className="space-y-7 order-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <Film className="text-gray-100" size={26} />
              优质视频
            </h3>
            <a href="#/list?tab=video" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
              查看更多
              <ArrowRight size={12} />
            </a>
          </div>
          {videoPicks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5">
              <button
                onClick={() => (window.location.hash = `#/video/${videoPicks[0].slug}`)}
                className="relative rounded-2xl overflow-hidden border border-white/10 group text-left"
              >
                <img
                  src={videoPicks[0].cover}
                  alt={videoPicks[0].title}
                  className="w-full h-[280px] md:h-[340px] object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/30 to-transparent" />
                <div className="absolute left-5 right-5 bottom-5">
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-300">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/45 border border-white/15">
                      <PlayCircle size={14} />
                      {videoPicks[0].duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-300/90">
                      <Eye size={13} />
                      {videoPicks[0].views.toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-white leading-tight line-clamp-2 group-hover:text-[#9ef1bd] transition-colors">
                    {videoPicks[0].title}
                  </h4>
                  <p className="text-sm text-gray-300/90 mt-2 line-clamp-2">{videoPicks[0].summary}</p>
                </div>
              </button>

              <div className="space-y-3">
                {videoPicks.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => (window.location.hash = `#/video/${item.slug}`)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-3 flex gap-3 group"
                  >
                    <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      <span className="absolute right-1.5 bottom-1.5 px-1.5 py-0.5 rounded bg-black/65 text-[10px] font-bold text-white">{item.duration}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-100 line-clamp-2 group-hover:text-[#9ef1bd] transition-colors">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.summary}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="inline-flex items-center gap-1"><UserRound size={11} /> {item.author}</span>
                        <span className="inline-flex items-center gap-1"><Eye size={11} /> {item.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-7 order-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <Headphones className="text-gray-100" size={26} />
              AI播客
            </h3>
            <a href="#/list?tab=podcast" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
              查看更多
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {podcastPicks.map((item) => (
              <article
                key={item.id}
                onClick={() => (window.location.hash = `#/podcast/${item.slug}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors p-4 flex gap-4 cursor-pointer"
              >
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePodcastPreview(item);
                    }}
                    className={cn(
                      'absolute right-2 bottom-2 w-9 h-9 rounded-full border grid place-items-center transition-colors',
                      playingPodcastId === item.id
                        ? 'bg-[#1ed661] text-black border-[#1ed661]'
                        : 'bg-black/55 text-white border-white/20 hover:border-[#1ed661]/45 hover:text-[#9ef1bd]'
                    )}
                    aria-label={playingPodcastId === item.id ? '暂停音频' : '播放音频'}
                  >
                    {playingPodcastId === item.id ? <Pause size={14} /> : <PlayCircle size={14} />}
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/30" />
                    <span className="text-[11px] text-gray-500">{item.duration}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-100 leading-snug line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2">{item.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1"><UserRound size={11} /> {item.host}</span>
                    <span className="inline-flex items-center gap-1"><Headphones size={11} /> {item.plays.toLocaleString()}</span>
                  </div>
                  {playingPodcastId === item.id && (
                    <p className="mt-2 text-[11px] font-semibold text-[#1ed661]">正在播放预览</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-8 order-1">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <TrendingUp className="text-gray-100" size={28} />
              深度好文
            </h3>
            <a href="#/list?tab=article" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
              查看全部
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 -mt-1">
            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mr-1">快捷标签</span>
            {portalArticleQuickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setPortalArticleQuickTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  portalArticleQuickTag === tag
                    ? 'bg-[#1ed661]/20 text-[#9ef1bd] border-[#1ed661]/45 shadow-[0_0_16px_rgba(30,214,97,0.18)]'
                    : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-[#9ef1bd] hover:border-[#1ed661]/30'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((item) => (
                <Card key={item.id} className="h-full" onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/portal')}>
                  <div className="aspect-video overflow-hidden">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <Badge label={item.categoryTag} />
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-white mb-3 group-hover:text-[#1ed661] transition-colors line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{item.summary}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-5 py-9 text-sm text-gray-500">
              当前标签暂无内容，试试其他标签。
            </div>
          )}
        </section>

        <section className="space-y-8 order-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <GraduationCap className="text-gray-100" size={28} />
              教程精选
            </h3>
            <a href="#/list?tab=tutorial" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
              查看全部
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 -mt-1">
            <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mr-1">快捷标签</span>
            {portalTutorialQuickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setPortalTutorialQuickTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  portalTutorialQuickTag === tag
                    ? 'bg-[#1ed661]/20 text-[#9ef1bd] border-[#1ed661]/45 shadow-[0_0_16px_rgba(30,214,97,0.18)]'
                    : 'bg-white/[0.02] text-gray-400 border-white/10 hover:text-[#9ef1bd] hover:border-[#1ed661]/30'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          {tutorials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tutorials.map((item) => (
                <Card key={item.id} className="h-full" onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/portal')}>
                  <div className="aspect-video overflow-hidden">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <Badge label="教程" className="bg-blue-500/20 text-blue-300 border-blue-400/30" />
                      {getTutorialLevel(item) && (
                        <Badge label={getTutorialLevel(item) as string} className={getTutorialLevelBadgeClass(getTutorialLevel(item) as string)} />
                      )}
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-white mb-3 group-hover:text-[#1ed661] transition-colors line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">{item.summary}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-5 py-9 text-sm text-gray-500">
              当前标签暂无教程，试试其他标签。
            </div>
          )}
        </section>

        <section className="space-y-8 order-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <Star className="text-gray-100" size={28} />
              推荐工具
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.05] hover:border-[#1ed661]/30 transition-all cursor-pointer group"
                onClick={() => (window.location.hash = `#/tool/${tool.id}`)}
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <img src={tool.logo} alt={tool.name} className="w-10 h-10" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-200 group-hover:text-[#1ed661] transition-colors">{tool.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{tool.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="order-7 rounded-3xl border border-white/10 bg-gradient-to-br from-[#101822] via-[#0d1117] to-[#12271b] px-6 py-10 md:px-10 md:py-12">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <h3 className="text-3xl md:text-4xl font-black leading-tight">
              每日5分钟，掌握 <span className="text-[#4aa3ff]">AI行业关键动态</span>
            </h3>
            <p className="text-gray-400 text-base md:text-lg">加入 28,000+ 专业人士的 AI 情报网络</p>
            <form className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row rounded-xl border border-white/10 overflow-hidden bg-white/[0.03]">
                <input
                  type="email"
                  placeholder="您的邮箱地址"
                  className="h-12 flex-1 bg-transparent px-4 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                />
                <button
                  type="button"
                  className="h-12 px-6 bg-[#1ed661] text-black font-black text-sm hover:brightness-110 transition-colors"
                >
                  免费订阅
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500 text-left">
                提交邮箱即表示您同意我们的服务条款与隐私政策。
              </p>
            </form>
          </div>
        </section>

        <section className="order-8 space-y-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <div className="text-center space-y-3">
            <h3 className="text-3xl md:text-4xl font-black">为什么选择AI STORE?</h3>
            <p className="text-gray-400">我们聚焦有价值的 AI 资讯与实战内容，帮助你高效建立认知和行动路径。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'AI热门资讯',
                desc: '精选全球动态与热点事件，第一时间掌握行业趋势。',
                icon: TrendingUp
              },
              {
                title: '每日快讯',
                desc: '结构化梳理核心变化，5 分钟完成高效信息摄入。',
                icon: Newspaper
              },
              {
                title: 'AI工具推荐',
                desc: '聚合实用工具与场景方案，提高工作效率与产出质量。',
                icon: Star
              }
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-[#111a25]/70 p-5">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.04] grid place-items-center mb-4 text-gray-100">
                  <item.icon size={22} />
                </div>
                <h4 className="text-xl font-black mb-2">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-7">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </motion.div>
    );
  };

  const renderLearningPath = () => {
    const tutorialSamples = allNews.filter((item) => item.type === 'tutorial').slice(0, 4);

    return (
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-6">
        <button
          onClick={() => {
            window.location.hash = '#/portal';
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors"
        >
          <ArrowLeft size={16} />
          返回AI百科
        </button>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1ed661]/30 bg-[#1ed661]/10 text-[#9ef1bd] text-[11px] font-black uppercase tracking-widest">
                <Zap size={13} />
                学习模块
              </div>
              <h1 className="text-3xl md:text-4xl font-black">7天学习路径</h1>
              <p className="text-base md:text-lg text-gray-300 leading-8">
                把术语认知、教程实操与深度阅读组合成 7 天闭环。每天给出目标、关键动作和交付结果，便于按节奏推进。
              </p>
            </div>
            <div className="h-48 md:h-56 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(30,214,97,0.28),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(74,163,255,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {LEARNING_PATH_7D.map((day, idx) => (
            <article
              key={day.id}
              className={cn(
                'relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#111923]/95 via-[#0f1620]/95 to-[#0d1117]/95 p-5 transition-all',
                idx === 0
                  ? 'border-[#1ed661]/45 shadow-[0_0_26px_rgba(30,214,97,0.18)]'
                  : 'hover:border-[#1ed661]/35 hover:shadow-[0_0_24px_rgba(30,214,97,0.08)]'
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] px-2 py-1 rounded-full border border-[#1ed661]/30 bg-[#1ed661]/10 text-[#9ef1bd] font-black tracking-widest">
                  {day.dayLabel}
                </span>
                <Badge label={day.trackTag} className="bg-white/[0.02] border-white/15 text-gray-300" />
              </div>
              <h4 className="text-base font-black text-white leading-snug mb-2 min-h-[44px]">{day.title}</h4>
              <p className="text-sm text-gray-400 leading-6 mb-3 line-clamp-3">{day.summary}</p>
              <ul className="space-y-1.5 mb-4">
                {day.highlights.map((point) => (
                  <li key={point} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1ed661] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>{day.learners.toLocaleString()} 人已学习</span>
                <span className="text-gray-500 line-clamp-1">交付成果：{day.deliverable}</span>
              </div>
              <a
                href={day.targetHash}
                className="inline-flex items-center gap-1 text-sm text-[#9ef1bd] hover:text-[#1ed661] transition-colors font-semibold"
              >
                查看学习详情
                <ArrowRight size={12} />
              </a>
            </article>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3 text-gray-100">
              <GraduationCap className="text-gray-100" size={26} />
              配套教程文章
            </h3>
            <a href="#/list?tab=tutorial" className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">
              查看更多
              <ArrowRight size={12} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tutorialSamples.map((item) => (
              <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/learning-path')} />
            ))}
          </div>
        </section>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        'app-shell min-h-screen bg-[#0d1117] text-gray-100 font-sans selection:bg-[#1ed661]/30 selection:text-white',
        isLightMode && 'light-mode'
      )}
    >
      <div aria-hidden className="ambient-layer ambient-layer-a" />
      <div aria-hidden className="ambient-layer ambient-layer-b" />
      <div aria-hidden className="ambient-noise" />
      <ScrollProgress />
      <MouseGlow />

      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0d1117]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => (window.location.hash = '#/') }>
            <div className="w-10 h-10 bg-[#1ed661] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(30,214,97,0.4)] group-hover:scale-110 transition-transform">
              <TrendingUp className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">AISTORE <span className="text-[#1ed661]">资讯</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#/" className={cn('text-sm font-medium transition-colors', view === 'home' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>首页</a>
            <a href="#/ai-tools" className={cn('text-sm font-medium transition-colors', view === 'ai_tools' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>AI工具</a>
            {/* <a href="#/ai-tools-2" className={cn('text-sm font-medium transition-colors', view === 'ai_tools_2' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>AI工具2</a> */}
            <a href="#/section/skill" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/skill') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>Skill</a>
            <a href="#/section/mcp" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/mcp') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>MCP</a>
            <a href="#/guide/basic" className={cn('text-sm font-medium transition-colors', view === 'guide' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>基础指南</a>
            <a href="#/infrastructure" className={cn('text-sm font-medium transition-colors', view === 'infrastructure' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>基础设施</a>
            <a href="#/channels" className={cn('text-sm font-medium transition-colors', view === 'channels' ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>消息渠道</a>
            <div
              className="relative"
              onMouseEnter={() => setIsModelHubMenuOpen(true)}
              onMouseLeave={() => setIsModelHubMenuOpen(false)}
            >
              <button
                onClick={() => {
                  window.location.hash = '#/model-hub/ai-models/providers';
                }}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors',
                  view === 'model_hub'
                    ? 'text-[#1ed661]'
                    : 'text-gray-400 hover:text-[#1ed661]'
                )}
              >
                模型广场
                <ChevronDown size={14} className={cn('transition-transform', isModelHubMenuOpen ? 'rotate-180' : 'rotate-0')} />
              </button>
              <div className="absolute left-0 right-0 top-full h-3" />
              <div
                className={cn(
                  'absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#161b22]/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-150',
                  isModelHubMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                <button onClick={() => (window.location.hash = '#/model-hub/ai-models/free-zone')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">免费专区</button>
                <button onClick={() => (window.location.hash = '#/model-hub/ai-models/discover')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">模型发现</button>
                <button onClick={() => (window.location.hash = '#/model-hub/ai-models/rankings')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">风云榜单</button>
                <button onClick={() => (window.location.hash = '#/model-hub/ai-models/compare')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">深度对比</button>
                <button onClick={() => (window.location.hash = '#/model-hub/ai-models/ecosystem')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">厂商生态</button>
              </div>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsNewsMenuOpen(true)}
              onMouseLeave={() => setIsNewsMenuOpen(false)}
            >
              <button
                onClick={() => {
                  window.location.hash = '#/portal';
                }}
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors',
                  view === 'portal' ||
                    view === 'learning_path' ||
                    view === 'list' ||
                    view === 'detail' ||
                    view === 'term' ||
                    view === 'video' ||
                    view === 'podcast'
                    ? 'text-[#1ed661]'
                    : 'text-gray-400 hover:text-[#1ed661]'
                )}
              >
                AI百科
                <ChevronDown size={14} className={cn('transition-transform', isNewsMenuOpen ? 'rotate-180' : 'rotate-0')} />
              </button>
              <div className="absolute left-0 right-0 top-full h-3" />
              <div
                className={cn(
                  'absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#161b22]/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-150',
                  isNewsMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                <button onClick={() => goToListTab('flash')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">AI快讯</button>
                <button onClick={() => goToListTab('article')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">深度好文</button>
                <button onClick={() => goToListTab('tutorial')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">精选教程</button>
                <button onClick={() => goToListTab('knowledge')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">术语百科</button>
                <button onClick={() => goToListTab('video')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">优质视频</button>
                <button onClick={() => goToListTab('podcast')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">AI播客</button>
              </div>
            </div>

            <a href="#/section/security" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/security') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>安全实验室</a>
          </nav>

          <div className="flex items-center">
            <button
              onClick={() => setIsLightMode((prev) => !prev)}
              className="w-10 h-10 rounded-full border border-white/20 bg-[#111923]/70 text-gray-200 hover:text-[#1ed661] hover:border-[#1ed661]/50 backdrop-blur-md transition-colors grid place-items-center"
              aria-label={isLightMode ? '切换深色模式' : '切换亮色模式'}
              title={isLightMode ? '切换深色模式' : '切换亮色模式'}
            >
              {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'relative z-10',
          view === 'model_hub' || view === 'guide' || view === 'channels' || view === 'infrastructure' || view === 'ai_tools' || view === 'ai_tools_2' ? 'py-0' : 'max-w-7xl mx-auto px-6 py-12'
        )}
      >
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            renderHome()
          ) : view === 'ai_tools' ? (
            <AIToolsPage hash={hash} />
          ) : view === 'ai_tools_2' ? (
            <AIToolsPage2 hash={hash} />
          ) : view === 'guide' ? (
            <BasicGuidePage />
          ) : view === 'channels' ? (
            <MessageChannelsPage />
          ) : view === 'infrastructure' ? (
            <InfrastructurePlatformsPage />
          ) : view === 'model_hub' ? (
            <ModelHubModule />
          ) : view === 'portal' ? (
            renderPortal()
          ) : view === 'learning_path' ? (
            renderLearningPath()
          ) : view === 'list' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="news-list-page">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
	                <motion.div
	                  key={`${listTab}-${flashViewMode}-${contentLayoutMode}-${contentTopicFilter}-${contentSourceFilter}-${contentThemeFilter}-${contentSort}-${contentDateRange}-${searchQuery}`}
	                  initial={{ opacity: 0, y: 8 }}
	                  animate={{ opacity: 1, y: 0 }}
	                  transition={{ duration: 0.22, ease: 'easeOut' }}
	                  className="min-w-0 space-y-6"
	                >
	                  <button
	                    onClick={() => (window.location.hash = '#/portal')}
	                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors"
	                  >
	                    <ArrowLeft size={16} />
	                    返回AI百科
	                  </button>

	                  <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                      {[
                        { id: 'flash', label: 'AI快讯' },
                        { id: 'article', label: '深度好文' },
                        { id: 'tutorial', label: '精选教程' },
                        { id: 'knowledge', label: '术语百科' },
                        { id: 'video', label: '优质视频' },
                        { id: 'podcast', label: 'AI播客' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => goToListTab(tab.id as ListTab)}
                          className={cn(
                            'text-sm md:text-base font-semibold tracking-tight transition-colors',
                            listTab === tab.id
                              ? 'text-[#1ed661]'
                              : 'text-gray-400 hover:text-gray-100'
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {listTab === 'flash' ? (
                        <>
                          <button
                            onClick={() => setFlashViewMode('compact')}
                            className={cn(
                              'w-9 h-9 rounded-lg border grid place-items-center transition-colors',
                              flashViewMode === 'compact'
                                ? 'border-[#1ed661]/45 bg-[#1ed661]/15 text-[#9ef1bd]'
                                : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-white/20'
                            )}
                            aria-label="极简快讯"
                          >
                            <AlignJustify size={15} />
                          </button>
                          <button
                            onClick={() => setFlashViewMode('detail')}
                            className={cn(
                              'w-9 h-9 rounded-lg border grid place-items-center transition-colors',
                              flashViewMode === 'detail'
                                ? 'border-[#1ed661]/45 bg-[#1ed661]/15 text-[#9ef1bd]'
                                : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-white/20'
                            )}
                            aria-label="详情快讯"
                          >
                            <List size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setContentLayoutMode('list')}
                            className={cn(
                              'w-9 h-9 rounded-lg border grid place-items-center transition-colors',
                              contentLayoutMode === 'list'
                                ? 'border-[#1ed661]/45 bg-[#1ed661]/15 text-[#9ef1bd]'
                                : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-white/20'
                            )}
                            aria-label="列表视图"
                          >
                            <AlignJustify size={15} />
                          </button>
                          <button
                            onClick={() => setContentLayoutMode('card')}
                            className={cn(
                              'w-9 h-9 rounded-lg border grid place-items-center transition-colors',
                              contentLayoutMode === 'card'
                                ? 'border-[#1ed661]/45 bg-[#1ed661]/15 text-[#9ef1bd]'
                                : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:border-white/20'
                            )}
                            aria-label="卡片视图"
                          >
                            <LayoutGrid size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {listTab === 'flash' && (
                    filteredFlashItems.length > 0 ? (
                      flashViewMode === 'detail' ? (
                        <div className="max-w-4xl space-y-0">
                          {filteredFlashItems.map((item, idx, arr) => {
                            const prev = idx > 0 ? arr[idx - 1] : null;
                            const showDate = !prev || prev.date !== item.date;
                            return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=flash')} />;
                          })}
                        </div>
                      ) : (
                        <div className="max-w-4xl space-y-3">
                          {filteredFlashItems.map((item, idx, arr) => {
                            const prev = idx > 0 ? arr[idx - 1] : null;
                            const showDate = !prev || prev.date !== item.date;
                            return (
                              <div key={item.id} className="space-y-2">
                                {showDate && (
                                  <div className="text-[11px] text-gray-500 font-bold tracking-widest uppercase pt-2">
                                    {item.date}
                                  </div>
                                )}
                                <button
                                  onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=flash')}
                                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors px-4 py-3 flex items-center gap-4 text-left"
                                >
                                  <span className="text-[#1ed661] text-base font-black w-14 flex-shrink-0">{item.exactTime}</span>
                                  <span className="text-sm md:text-base text-gray-200 truncate">{item.title}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无快讯内容。</p>
                    )
                  )}

                  {listTab === 'article' && (
                    filteredArticleItems.length > 0 ? (
                      contentLayoutMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredArticleItems.map((item) => (
                            <NewsHorizontalCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=article')} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredArticleItems.map((item) => (
                            <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=article')} />
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无深度文章。</p>
                    )
                  )}

                  {listTab === 'tutorial' && (
                    filteredTutorialItems.length > 0 ? (
                      contentLayoutMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredTutorialItems.map((item) => (
                            <NewsHorizontalCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=tutorial')} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredTutorialItems.map((item) => (
                            <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/list?tab=tutorial')} />
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无教程内容。</p>
                    )
                  )}

                  {listTab === 'knowledge' && (
                    filteredKnowledgeItems.length > 0 ? (
                      contentLayoutMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredKnowledgeItems.map((item) => (
                            <TermHorizontalCard key={item.id} item={item} onClick={() => navigateToTermDetail(item.id, window.location.hash || '#/list?tab=knowledge')} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredKnowledgeItems.map((item) => (
                            <Card key={item.id} className="h-full p-6" onClick={() => navigateToTermDetail(item.id, window.location.hash || '#/list?tab=knowledge')}>
                              <div className="mb-3 flex items-center gap-2 flex-wrap">
                                <Badge label="术语百科" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30" />
                                {item.topicTags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                                ))}
                              </div>
                              <h4 className="text-base md:text-lg font-bold text-white mb-3 group-hover:text-[#1ed661] transition-colors line-clamp-2">{item.title}</h4>
                              <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">{item.summary}</p>
                              <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <span>{item.date}</span>
                                <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无术语内容。</p>
                    )
                  )}

                  {listTab === 'video' && (
                    filteredVideoItems.length > 0 ? (
                      contentLayoutMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredVideoItems.map((item) => (
                            <VideoHorizontalCard key={item.id} item={item} onClick={() => (window.location.hash = `#/video/${item.slug}`)} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredVideoItems.map((item) => (
                            <Card key={item.id} className="h-full overflow-hidden" onClick={() => (window.location.hash = `#/video/${item.slug}`)}>
                              <div className="aspect-video overflow-hidden relative">
                                <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                                <span className="absolute right-2 bottom-2 px-2 py-1 rounded bg-black/65 text-[11px] font-bold text-white">{item.duration}</span>
                              </div>
                              <div className="p-5 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge label="优质视频" className="bg-pink-500/15 text-pink-300 border-pink-400/35" />
                                  {item.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                                  ))}
                                </div>
                                <h4 className="text-base md:text-lg font-bold text-white line-clamp-2">{item.title}</h4>
                                <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                  <span>{item.date}</span>
                                  <span className="flex items-center gap-1"><Eye size={12} /> {item.views.toLocaleString()}</span>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无优质视频。</p>
                    )
                  )}

                  {listTab === 'podcast' && (
                    filteredPodcastItems.length > 0 ? (
                      contentLayoutMode === 'list' ? (
                        <div className="space-y-4">
                          {filteredPodcastItems.map((item) => (
                            <PodcastHorizontalCard
                              key={item.id}
                              item={item}
                              isPlaying={playingPodcastId === item.id}
                              onPreview={(e) => {
                                e.stopPropagation();
                                void handleTogglePodcastPreview(item);
                              }}
                              onClick={() => (window.location.hash = `#/podcast/${item.slug}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredPodcastItems.map((item) => (
                            <Card key={item.id} className="h-full p-5" onClick={() => (window.location.hash = `#/podcast/${item.slug}`)}>
                              <div className="flex gap-4">
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleTogglePodcastPreview(item);
                                    }}
                                    className={cn(
                                      'absolute right-2 bottom-2 w-8 h-8 rounded-full border grid place-items-center transition-colors',
                                      playingPodcastId === item.id
                                        ? 'bg-[#1ed661] text-black border-[#1ed661]'
                                        : 'bg-black/55 text-white border-white/25 hover:border-[#1ed661]/45'
                                    )}
                                  >
                                    {playingPodcastId === item.id ? <Pause size={13} /> : <PlayCircle size={13} />}
                                  </button>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                                    <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/35" />
                                    {item.tags.slice(0, 1).map((tag) => (
                                      <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                                    ))}
                                  </div>
                                  <h4 className="text-base md:text-lg font-bold text-white line-clamp-2">{item.title}</h4>
                                  <p className="text-sm text-gray-400 line-clamp-2 mt-2">{item.summary}</p>
                                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                    <span>{item.date}</span>
                                    <span className="flex items-center gap-1"><Headphones size={12} /> {item.plays.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-gray-500 py-12">当前筛选条件下暂无 AI播客。</p>
                    )
                  )}
                </motion.div>

                <aside className="xl:sticky xl:top-24 space-y-4">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder={
                        listTab === 'flash'
                          ? '搜索快讯...'
                          : listTab === 'video'
                            ? '搜索视频...'
                            : listTab === 'podcast'
                              ? '搜索播客...'
                              : '搜索文章...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 text-sm text-gray-100 focus:outline-none focus:border-[#1ed661]/40 transition-colors"
                    />
                    <Search size={15} strokeWidth={1.4} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#1ed661] text-black grid place-items-center hover:brightness-110"
                      aria-label="搜索"
                    >
                      <Search size={14} />
                    </button>
                  </form>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlignJustify size={14} className="text-gray-500 flex-shrink-0" />
                        <div className="relative flex-1">
                          <select
                            value={listTab === 'flash' ? flashCategoryFilter : contentTopicFilter}
                            onChange={(e) => {
                              if (listTab === 'flash') {
                                setFlashCategoryFilter(e.target.value);
                                return;
                              }
                              setContentTopicFilter(e.target.value);
                            }}
                            className="h-9 w-full rounded-lg bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 pr-10 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors appearance-none"
                          >
                            {(listTab === 'flash' ? flashCategoryOptions : listTopicOptions).map((topic) => (
                              <option key={topic} value={topic}>
                                {topic === '全部' ? contentAllTopicLabel : topic}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-500 flex-shrink-0" />
                        <div className="relative flex-1">
                          <select
                            value={contentDateRange}
                            onChange={(e) => setContentDateRange(e.target.value as ContentDateRange)}
                            className="h-9 w-full rounded-lg bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 pr-10 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors appearance-none"
                          >
                            <option value="all">全部时间</option>
                            <option value="3d">近3天</option>
                            <option value="7d">近7天</option>
                            <option value="30d">近30天</option>
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {listTab !== 'knowledge' && (
                        <div className="flex items-center gap-2">
                          <ExternalLink size={14} className="text-gray-500 flex-shrink-0" />
                          <div className="relative flex-1">
                            <select
                              value={contentSourceFilter}
                              onChange={(e) => setContentSourceFilter(e.target.value as SourceFilter)}
                              className="h-9 w-full rounded-lg bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 pr-10 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors appearance-none"
                            >
                              {SOURCE_FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-gray-500 flex-shrink-0" />
                        <div className="relative flex-1">
                          <select
                            value={contentThemeFilter}
                            onChange={(e) => setContentThemeFilter(e.target.value as ThemeFilter)}
                            className="h-9 w-full rounded-lg bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 pr-10 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors appearance-none"
                          >
                            {THEME_FILTER_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <List size={14} className="text-gray-500 flex-shrink-0" />
                        <div className="relative flex-1">
                          <select
                            value={contentSort}
                            onChange={(e) => setContentSort(e.target.value as ContentSort)}
                            className="h-9 w-full rounded-lg bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 pr-10 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors appearance-none"
                          >
                            <option value="hot">热度优先</option>
                            <option value="latest">最新发布</option>
                            <option value="most_read">阅读最多</option>
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <h3 className="text-2xl font-black flex items-center gap-2">
                      <Flame size={20} className="text-orange-400" />
                      24小时热搜
                    </h3>
                    <ol className="mt-4 space-y-2">
                      {hotSearchKeywords.map((item, idx) => (
                        <li key={item.keyword}>
                          <button
                            onClick={() => {
                              setSearchQuery(item.keyword);
                              runSearch(item.keyword, 'all');
                            }}
                            className="w-full text-left rounded-lg px-2 py-1.5 hover:bg-white/[0.05] transition-colors flex items-center gap-2 justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn('text-sm w-5', idx < 3 ? 'text-[#1ed661] font-black' : 'text-gray-500 font-medium')}>
                                {idx + 1}.
                              </span>
                              <span className="text-sm text-gray-200 truncate">{item.keyword}</span>
                            </div>
                            <span className={cn('flex items-center', item.trend === 'up' ? 'text-[#1ed661]' : 'text-gray-500')}>
                              {item.trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {listTab === 'tutorial' && (
                    <button
                      onClick={() => (window.location.hash = '#/learning-path')}
                      className="w-full text-left rounded-2xl border border-[#1ed661]/30 bg-gradient-to-br from-[#1ed661]/16 via-[#1ed661]/8 to-transparent px-5 py-6 hover:border-[#1ed661]/45 hover:shadow-[0_0_24px_rgba(30,214,97,0.16)] transition-all"
                    >
                      <div className="text-[11px] font-black uppercase tracking-widest text-[#9ef1bd] mb-2">学习模块</div>
                      <h4 className="text-lg font-black text-white mb-2">OpenClaw7天学习路径</h4>
                      <p className="text-sm text-gray-300 leading-7 mb-3">7 天系统学习 + 实操任务闭环，已有 26,341 人完成学习打卡。</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#9ef1bd]">
                        立即查看
                        <ArrowRight size={13} />
                      </span>
                    </button>
                  )}
                </aside>
              </div>
            </motion.div>
          ) : view === 'section' ? (
            renderSection(currentSectionKey)
          ) : view === 'detail' && currentNews ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto pt-2 pb-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => (window.location.hash = detailBackHash)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
                    <ArrowLeft size={16} />
                    {detailBackLabel}
                  </button>
                  <div className="flex items-center gap-3">
                    <Badge label={currentNews.categoryTag} />
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {currentNews.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                  <Home size={14} className="text-gray-500 flex-shrink-0" />
                  <button
                    onClick={() => (window.location.hash = '#/portal')}
                    className="hover:text-gray-200 transition-colors"
                  >
                    AI百科
                  </button>
                  <span className="text-gray-600">›</span>
                  <button
                    onClick={() => (window.location.hash = `#/list?tab=${currentNewsListTab}`)}
                    className="hover:text-gray-200 transition-colors"
                  >
                    {currentNewsModule}
                  </button>
                  <span className="text-gray-600">›</span>
                  <span className="text-gray-400">{currentNews.title}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#16263d]/85 via-[#122238]/78 to-[#103223]/72 p-8 md:p-10">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-6 leading-[1.3] tracking-tight break-words">
                  {currentNews.title}
                </h1>
                <div className="flex items-center justify-end pt-5 border-t border-white/5 gap-6 flex-wrap">
                  <div className="flex items-center gap-6 text-xs text-gray-600 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {currentNews.readCount.toLocaleString()}</span>
                    <span>预计阅读时间8分钟</span>
                  </div>
                </div>
              </div>

              <article ref={articleRef} className="max-w-4xl mx-auto space-y-8">
                <div className="relative p-8 bg-white/[0.02] border-l-4 border-[#1ed661] rounded-r-3xl overflow-hidden">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#1ed661] mb-3">AI总结</div>
                  <p className="relative z-10 text-xl font-medium text-gray-200 italic leading-relaxed">{currentNews.summary}</p>
                </div>

                <div className="space-y-9">
                  {detailBlocks.map((block) => (
                    <section key={block.id} className="space-y-4">
                      {block.type === 'text' && (
                        <p className="text-[16px] md:text-[18px] text-gray-200 leading-9">
                          {block.text}
                        </p>
                      )}

                      {block.type === 'quote' && (
                        <blockquote className="px-6 py-5 rounded-r-2xl border-l-4 border-[#1ed661] bg-white/[0.02]">
                          <p className="text-[17px] italic text-gray-100 leading-9">{block.text}</p>
                        </blockquote>
                      )}

                      {block.type === 'image' && (
                        <figure className="space-y-3">
                          {block.imageUrl ? (
                            <img
                              src={block.imageUrl}
                              alt="抓取配图"
                              className="w-full rounded-2xl border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full aspect-video rounded-2xl border border-dashed border-white/20 bg-white/[0.02] grid place-content-center text-gray-500">
                              待补充图片素材
                            </div>
                          )}
                          {block.caption && <figcaption className="text-sm text-gray-500">{block.caption}</figcaption>}
                        </figure>
                      )}

                      {block.type === 'video' && (
                        <div className="space-y-3">
                          {block.videoUrl ? (
                            <video
                              controls
                              poster={block.poster}
                              className="w-full rounded-2xl border border-white/10 bg-black/50"
                            >
                              <source src={block.videoUrl} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="w-full aspect-video rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex items-center justify-center gap-2 text-gray-500">
                              <PlayCircle size={20} />
                              待补充视频地址
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  ))}
                </div>

              </article>

              <section className="max-w-4xl mx-auto">
                <p className="text-xs text-gray-600/90 leading-6">
                  免责声明：本文仅供信息参考，不构成任何投资、法律或商业建议；如有侵权，请联系删除。
                </p>
              </section>

              <section className="py-2 border-y border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <button onClick={() => handleOpenSource(currentNews)} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1ed661] transition-colors">
                    来源: <span className="font-bold">{currentNews.sourceName}</span>
                    <ExternalLink size={14} />
                  </button>
                  <div className="flex items-center flex-wrap gap-3">
                    <button
                      onClick={() => toggleBookmark(currentNews.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        bookmarks.includes(currentNews.id)
                          ? 'bg-[#1ed661] text-black border-[#1ed661]'
                          : 'border-white/10 text-gray-300 hover:border-[#1ed661]/40 hover:text-white'
                      )}
                    >
                      <Star size={15} fill={bookmarks.includes(currentNews.id) ? 'currentColor' : 'none'} />
                      {bookmarks.includes(currentNews.id) ? '已收藏' : '收藏'}
                    </button>

                    <button
                      onClick={() => handleShareNews(currentNews)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-gray-300 hover:border-[#1ed661]/40 hover:text-white transition-colors"
                    >
                      <Share2 size={15} />
                      分享
                    </button>

                    <button
                      onClick={() => handleToggleLike(currentNews.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        isCurrentNewsLiked
                          ? 'bg-pink-500/15 border-pink-400/50 text-pink-300'
                          : 'border-white/10 text-gray-300 hover:border-pink-400/40 hover:text-pink-200'
                      )}
                    >
                      <Heart size={15} fill={isCurrentNewsLiked ? 'currentColor' : 'none'} />
                      点赞 {currentLikeCount}
                    </button>
                  </div>
                </div>
                {shareFeedback && <p className="mt-3 text-xs text-[#1ed661]">{shareFeedback}</p>}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  disabled={!previousNews}
                  onClick={() => previousNews && openNewsDetailInNewTab(previousNews.slug, detailBackHash)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <ArrowLeft size={13} />
                    上一篇
                  </div>
                  <div className="font-bold text-gray-200 line-clamp-2">{previousNews?.title || '已经是第一篇'}</div>
                </button>

                <button
                  disabled={!nextNews}
                  onClick={() => nextNews && openNewsDetailInNewTab(nextNews.slug, detailBackHash)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center justify-end gap-1">
                    下一篇
                    <ArrowRight size={13} />
                  </div>
                  <div className="font-bold text-gray-200 line-clamp-2 text-right">{nextNews?.title || '已经是最后一篇'}</div>
                </button>
              </section>

              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black">推荐阅读</h3>
                  <button
                    onClick={() => setRecommendOffset((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-gray-300 hover:border-[#1ed661]/40 hover:text-[#1ed661] transition-colors"
                  >
                    <RotateCw size={15} />
                    刷新推荐
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedNews.map((item) => (
                    <ArticleCard
                      key={item.id}
                      item={item}
                      compact
                      className="h-full"
                      onClick={() => openNewsDetailInNewTab(item.slug, detailBackHash)}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    <MessageCircle size={22} className="text-[#1ed661]" />
                    评论区 ({mergedComments.length})
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={cn('px-3 py-1 rounded-full border', isLoggedIn ? 'text-[#1ed661] border-[#1ed661]/40 bg-[#1ed661]/10' : 'text-gray-400 border-white/10')}>
                      {isLoggedIn ? '已登录' : '未登录'}
                    </span>
                    <button onClick={() => setIsLoggedIn((prev) => !prev)} className="px-3 py-1 rounded-full border border-white/10 text-gray-300 hover:border-[#1ed661]/40 hover:text-white transition-colors">
                      切换状态
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                  <textarea
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder={isLoggedIn ? '输入你的观点...' : '请先切换为已登录状态后发表评论'}
                    disabled={!isLoggedIn}
                    className="w-full min-h-28 rounded-xl bg-[#0d1117] border border-white/10 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-[#1ed661]/50 disabled:opacity-50"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!isLoggedIn || !commentDraft.trim()}
                      className="px-5 py-2 rounded-full bg-[#1ed661] text-black text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                    >
                      发布评论
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {mergedComments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img src={comment.avatar} alt={comment.userName} className="w-10 h-10 rounded-full border border-white/10" />
                          <div>
                            <div className="text-sm font-bold text-gray-100">{comment.userName}</div>
                            <p className="text-sm text-gray-300 leading-7 mt-1">{comment.content}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 space-y-2">
                          <div>{comment.time}</div>
                          <div className="inline-flex items-center gap-1">
                            <ThumbsUp size={12} />
                            {comment.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : view === 'video' && currentVideo ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => goToListTab('video')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
                  <ArrowLeft size={16} />
                  返回优质视频
                </button>
                <Badge label="优质视频" className="bg-pink-500/15 text-pink-300 border-pink-400/35" />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                <Home size={14} className="text-gray-500 flex-shrink-0" />
                <span>AI百科</span>
                <span className="text-gray-600">›</span>
                <span>优质视频</span>
                <span className="text-gray-600">›</span>
                <span className="text-gray-400">{currentVideo.title}</span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-8 md:p-10">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-5 leading-[1.3] tracking-tight">{currentVideo.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {currentVideo.tags.map((tag) => (
                    <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                  ))}
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-5">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {currentVideo.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Eye size={13} /> {currentVideo.views.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1.5"><PlayCircle size={13} /> {currentVideo.duration}</span>
                </div>
              </div>

              <section className="rounded-3xl border border-white/10 bg-black/30 p-3 md:p-4">
                <video
                  controls
                  autoPlay
                  poster={currentVideo.cover}
                  className="w-full rounded-2xl border border-white/10 bg-black"
                >
                  <source src={currentVideo.videoUrl} type="video/mp4" />
                </video>
                <p className="text-sm text-gray-400 mt-4 leading-7">{currentVideo.summary}</p>
              </section>

              <section className="py-2 border-y border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <button onClick={() => handleOpenExternalSource(currentVideo.sourceUrl)} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1ed661] transition-colors">
                    来源: <span className="font-bold">{currentVideo.sourceName}</span>
                    <ExternalLink size={14} />
                  </button>
                  <div className="flex items-center flex-wrap gap-3">
                    <button
                      onClick={() => toggleBookmark(currentVideo.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        bookmarks.includes(currentVideo.id)
                          ? 'bg-[#1ed661] text-black border-[#1ed661]'
                          : 'border-white/10 text-gray-300 hover:border-[#1ed661]/40 hover:text-white'
                      )}
                    >
                      <Star size={15} fill={bookmarks.includes(currentVideo.id) ? 'currentColor' : 'none'} />
                      {bookmarks.includes(currentVideo.id) ? '已收藏' : '收藏'}
                    </button>
                    <button
                      onClick={() => handleShareVideo(currentVideo)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-gray-300 hover:border-[#1ed661]/40 hover:text-white transition-colors"
                    >
                      <Share2 size={15} />
                      分享
                    </button>
                    <button
                      onClick={() => handleToggleVideoLike(currentVideo.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        isCurrentVideoLiked
                          ? 'bg-pink-500/15 border-pink-400/50 text-pink-300'
                          : 'border-white/10 text-gray-300 hover:border-pink-400/40 hover:text-pink-200'
                      )}
                    >
                      <Heart size={15} fill={isCurrentVideoLiked ? 'currentColor' : 'none'} />
                      点赞 {currentVideoLikeCount}
                    </button>
                  </div>
                </div>
                {shareFeedback && <p className="mt-3 text-xs text-[#1ed661]">{shareFeedback}</p>}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  disabled={!previousVideo}
                  onClick={() => previousVideo && (window.location.hash = `#/video/${previousVideo.slug}`)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <ArrowLeft size={13} />
                    上一条
                  </div>
                  <div className="font-bold text-gray-200 line-clamp-2">{previousVideo?.title || '已经是第一条'}</div>
                </button>
                <button
                  disabled={!nextVideo}
                  onClick={() => nextVideo && (window.location.hash = `#/video/${nextVideo.slug}`)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center justify-end gap-1">
                    下一条
                    <ArrowRight size={13} />
                  </div>
                  <div className="font-bold text-gray-200 text-right line-clamp-2">{nextVideo?.title || '已经是最后一条'}</div>
                </button>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-black">相关推荐</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedVideos.map((item) => (
                    <button key={item.id} onClick={() => (window.location.hash = `#/video/${item.slug}`)} className="text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-100 line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : view === 'podcast' && currentPodcast ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => goToListTab('podcast')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
                  <ArrowLeft size={16} />
                  返回AI播客
                </button>
                <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/35" />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                <Home size={14} className="text-gray-500 flex-shrink-0" />
                <span>AI百科</span>
                <span className="text-gray-600">›</span>
                <span>AI播客</span>
                <span className="text-gray-600">›</span>
                <span className="text-gray-400">{currentPodcast.title}</span>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-8 md:p-10">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-5 leading-[1.3] tracking-tight">{currentPodcast.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {currentPodcast.tags.map((tag) => (
                    <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                  ))}
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-5">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {currentPodcast.date}</span>
                  <span className="inline-flex items-center gap-1.5"><Headphones size={13} /> {currentPodcast.plays.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {currentPodcast.duration}</span>
                </div>
              </div>

	              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-5">
	                <audio
	                  ref={podcastDetailAudioRef}
	                  className="hidden"
	                  src={currentPodcast.audioUrl}
	                  onLoadedMetadata={(e) => {
	                    const media = e.currentTarget;
	                    setPodcastDurationSec(Number.isFinite(media.duration) ? media.duration : 0);
	                  }}
	                  onTimeUpdate={(e) => setPodcastCurrentSec(e.currentTarget.currentTime)}
	                  onPlay={() => setIsPodcastDetailPlaying(true)}
	                  onPause={() => setIsPodcastDetailPlaying(false)}
	                  onEnded={() => setIsPodcastDetailPlaying(false)}
	                />
	                <div className="space-y-2">
	                  <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
	                    <button
	                      onClick={() => void handleTogglePodcastDetailPlayback()}
	                      className="inline-flex items-center gap-2 text-gray-300 hover:text-[#1ed661] transition-colors"
	                    >
	                      {isPodcastDetailPlaying ? <Pause size={14} /> : <PlayCircle size={14} />}
	                      播放进度
	                    </button>
	                    <span>{formatAudioTime(podcastCurrentSec)} / {formatAudioTime(podcastDurationSec)}</span>
	                  </div>
	                  <input
                    type="range"
                    min={0}
                    max={Math.max(podcastDurationSec, 0)}
                    value={Math.min(podcastCurrentSec, Math.max(podcastDurationSec, 0))}
                    step={1}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setPodcastCurrentSec(value);
                      if (podcastDetailAudioRef.current) {
                        podcastDetailAudioRef.current.currentTime = value;
                      }
                    }}
                    className="w-full accent-[#1ed661]"
                  />
                </div>
                <div className="space-y-5 pt-2">
                  {currentPodcast.transcript.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] md:text-base text-gray-300 leading-8">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              <section className="max-w-4xl">
                <p className="text-xs text-gray-600/90 leading-6">
                  免责声明：本文仅供信息参考，不构成任何投资、法律或商业建议；如有侵权，请联系删除。
                </p>
              </section>

              <section className="py-2 border-y border-white/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <button onClick={() => handleOpenExternalSource(currentPodcast.sourceUrl)} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1ed661] transition-colors">
                    来源: <span className="font-bold">{currentPodcast.sourceName}</span>
                    <ExternalLink size={14} />
                  </button>
                  <div className="flex items-center flex-wrap gap-3">
                    <button
                      onClick={() => toggleBookmark(currentPodcast.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        bookmarks.includes(currentPodcast.id)
                          ? 'bg-[#1ed661] text-black border-[#1ed661]'
                          : 'border-white/10 text-gray-300 hover:border-[#1ed661]/40 hover:text-white'
                      )}
                    >
                      <Star size={15} fill={bookmarks.includes(currentPodcast.id) ? 'currentColor' : 'none'} />
                      {bookmarks.includes(currentPodcast.id) ? '已收藏' : '收藏'}
                    </button>
                    <button
                      onClick={() => handleSharePodcast(currentPodcast)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-gray-300 hover:border-[#1ed661]/40 hover:text-white transition-colors"
                    >
                      <Share2 size={15} />
                      分享
                    </button>
                    <button
                      onClick={() => handleTogglePodcastLike(currentPodcast.id)}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all',
                        isCurrentPodcastLiked
                          ? 'bg-pink-500/15 border-pink-400/50 text-pink-300'
                          : 'border-white/10 text-gray-300 hover:border-pink-400/40 hover:text-pink-200'
                      )}
                    >
                      <Heart size={15} fill={isCurrentPodcastLiked ? 'currentColor' : 'none'} />
                      点赞 {currentPodcastLikeCount}
                    </button>
                  </div>
                </div>
                {shareFeedback && <p className="mt-3 text-xs text-[#1ed661]">{shareFeedback}</p>}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  disabled={!previousPodcast}
                  onClick={() => previousPodcast && (window.location.hash = `#/podcast/${previousPodcast.slug}`)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <ArrowLeft size={13} />
                    上一期
                  </div>
                  <div className="font-bold text-gray-200 line-clamp-2">{previousPodcast?.title || '已经是第一期'}</div>
                </button>
                <button
                  disabled={!nextPodcast}
                  onClick={() => nextPodcast && (window.location.hash = `#/podcast/${nextPodcast.slug}`)}
                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center justify-end gap-1">
                    下一期
                    <ArrowRight size={13} />
                  </div>
                  <div className="font-bold text-gray-200 text-right line-clamp-2">{nextPodcast?.title || '已经是最后一期'}</div>
                </button>
              </section>

              <section className="space-y-4">
                <h3 className="text-2xl font-black">相关播客</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPodcasts.map((item) => (
                    <button key={item.id} onClick={() => (window.location.hash = `#/podcast/${item.slug}`)} className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                      <h4 className="font-bold text-gray-100 line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-2">{item.date} · {item.duration}</p>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
	          ) : view === 'term' && currentTerm ? (
	            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-8 space-y-8">
	              <div className="flex items-center justify-between">
	                <button onClick={() => (window.location.hash = termBackHash)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
	                  <ArrowLeft size={16} />
	                  {termBackLabel}
	                </button>
	                <Badge label="术语百科" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30" />
	              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-8 md:p-10">
                <h1 className="text-4xl md:text-5xl font-black mb-4">{currentTerm.term}</h1>
                <p className="text-lg text-gray-300 leading-8">{currentTerm.definition}</p>
              </div>

              <section className="rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {(currentTermArticle ? getTermTopicTags(currentTermArticle) : ['术语百科'])
                      .slice(0, 3)
                      .map((tag) => (
                        <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                      ))}
                  </div>
                  {buildTermParagraphs(currentTerm.term, currentTerm.definition).map((paragraph) => (
                    <p key={paragraph} className="text-gray-300 leading-8 text-[15px]">{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="py-2 border-y border-white/10 flex items-center justify-between">
                <button onClick={() => setShareFeedback('术语来源为百科词条库')} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1ed661] transition-colors">
                  来源: 术语百科词条库
                  <ExternalLink size={14} />
                </button>
                <button onClick={() => handleShareTerm(currentTerm)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-bold text-gray-300 hover:border-[#1ed661]/40 hover:text-white transition-colors">
                  <Share2 size={15} />
                  分享词条
                </button>
              </section>

	              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                <button
	                  disabled={!previousTerm}
	                  onClick={() => previousTerm && navigateToTermDetail(previousTerm.id, termBackHash)}
	                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
	                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <ArrowLeft size={13} />
                    上一条
                  </div>
                  <div className="font-bold text-gray-200 line-clamp-1">{previousTerm?.term || '已经是第一条'}</div>
                </button>

	                <button
	                  disabled={!nextTerm}
	                  onClick={() => nextTerm && navigateToTermDetail(nextTerm.id, termBackHash)}
	                  className="text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
	                >
                  <div className="text-xs text-gray-500 mb-2 flex items-center justify-end gap-1">
                    下一条
                    <ArrowRight size={13} />
                  </div>
                  <div className="font-bold text-gray-200 text-right line-clamp-1">{nextTerm?.term || '已经是最后一条'}</div>
                </button>
              </section>

              <section className="space-y-5">
                <h3 className="text-2xl font-black">相关术语</h3>
	                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
	                  {GLOSSARY_DATA.filter((item) => item.id !== currentTerm.id).slice(0, 4).map((item) => (
	                    <button key={item.id} onClick={() => navigateToTermDetail(item.id, termBackHash)} className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
	                      <div className="text-sm font-black text-[#1ed661] mb-1">{item.term}</div>
	                      <p className="text-xs text-gray-400 line-clamp-3 leading-6">{item.definition}</p>
	                    </button>
                  ))}
                </div>
              </section>
              {shareFeedback && <p className="text-xs text-[#1ed661]">{shareFeedback}</p>}
            </motion.div>
          ) : view === 'tool' && currentTool ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ToolDetail tool={currentTool} relatedNews={allNews.filter((item) => item.relatedToolIds.includes(currentTool.id))} />
            </motion.div>
          ) : view === 'search' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-black">搜索结果</h1>
                <p className="text-gray-400 mt-2">关键词: {currentSearchQuery || '未输入'}</p>
                <form onSubmit={handleSearch} className="max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="继续搜索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-11 pr-32 text-sm text-gray-100 focus:outline-none focus:border-[#1ed661]/50 transition-colors"
                    />
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-[#1ed661] text-black text-sm font-black hover:brightness-110 transition-all"
                    >
                      搜索
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { id: 'all', label: '全部', count: searchNewsResults.length + searchTermResults.length + searchVideoResults.length + searchPodcastResults.length },
                  { id: 'flash', label: 'AI快讯', count: searchFlashResults.length },
                  { id: 'article', label: '深度好文', count: searchArticleResults.length },
                  { id: 'tutorial', label: '精选教程', count: searchTutorialResults.length },
                  { id: 'knowledge', label: '术语百科', count: searchTermResults.length },
                  { id: 'video', label: '优质视频', count: searchVideoResults.length },
                  { id: 'podcast', label: 'AI播客', count: searchPodcastResults.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => goToSearchTab(tab.id as SearchTab)}
                    className={cn(
                      'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all',
                      searchTab === tab.id
                        ? 'bg-[#1ed661] text-black border-[#1ed661] shadow-[0_0_24px_rgba(30,214,97,0.35)]'
                        : 'text-gray-300 border-white/10 bg-white/[0.03] hover:border-[#1ed661]/40'
                    )}
                  >
                    {tab.label}
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', searchTab === tab.id ? 'bg-black/15' : 'bg-white/10')}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {searchTab === 'all' && (
                <div className="space-y-10">
                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">快讯 ({searchFlashResults.length})</h2>
                    {searchFlashResults.length > 0 ? (
                      <div className="max-w-3xl">
                        {searchFlashResults.map((item, idx, arr) => {
                          const prev = idx > 0 ? arr[idx - 1] : null;
                          const showDate = !prev || prev.date !== item.date;
                          return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的快讯内容。</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">深度文章 ({searchArticleResults.length})</h2>
                    {searchArticleResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchArticleResults.map((item) => (
                          <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的深度文章。</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">教程 ({searchTutorialResults.length})</h2>
                    {searchTutorialResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchTutorialResults.map((item) => (
                          <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的教程。</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">术语百科 ({searchTermResults.length})</h2>
                    {searchTermResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchTermResults.map((item) => (
                          <Card key={item.id} className="h-full p-6" onClick={() => navigateToTermDetail(item.id, window.location.hash || '#/search')}>
                            <div className="mb-3 flex items-center gap-2 flex-wrap">
                              <Badge label="术语百科" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30" />
                              {item.topicTags.slice(0, 2).map((tag) => (
                                <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                              ))}
                            </div>
                            <h3 className="text-base md:text-lg font-bold mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-3">{item.summary}</p>
                            <div className="mt-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
                              <span>{item.date}</span>
                              <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的术语词条。</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">优质视频 ({searchVideoResults.length})</h2>
                    {searchVideoResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchVideoResults.map((item) => (
                          <Card key={item.id} className="h-full overflow-hidden" onClick={() => (window.location.hash = `#/video/${item.slug}`)}>
                            <div className="aspect-video overflow-hidden">
                              <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                            </div>
                            <div className="p-5 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge label="优质视频" className="bg-pink-500/15 text-pink-300 border-pink-400/35" />
                              </div>
                              <h3 className="text-base md:text-lg font-bold line-clamp-2">{item.title}</h3>
                              <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的优质视频。</p>
                    )}
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-black">AI播客 ({searchPodcastResults.length})</h2>
                    {searchPodcastResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchPodcastResults.map((item) => (
                          <Card key={item.id} className="h-full p-5" onClick={() => (window.location.hash = `#/podcast/${item.slug}`)}>
                            <div className="mb-3 flex items-center gap-2">
                              <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/35" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold line-clamp-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-3 mt-2">{item.summary}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">暂无匹配的 AI播客。</p>
                    )}
                  </section>
                </div>
              )}

              {searchTab === 'flash' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">快讯 ({searchFlashResults.length})</h2>
                  {searchFlashResults.length > 0 ? (
                    <div className="max-w-3xl">
                      {searchFlashResults.map((item, idx, arr) => {
                        const prev = idx > 0 ? arr[idx - 1] : null;
                        const showDate = !prev || prev.date !== item.date;
                        return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的快讯内容。</p>
                  )}
                </section>
              )}

              {searchTab === 'article' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">深度文章 ({searchArticleResults.length})</h2>
                  {searchArticleResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchArticleResults.map((item) => (
                        <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的深度文章。</p>
                  )}
                </section>
              )}

              {searchTab === 'tutorial' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">教程 ({searchTutorialResults.length})</h2>
                  {searchTutorialResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchTutorialResults.map((item) => (
                        <ArticleCard key={item.id} item={item} onClick={() => openNewsDetailInNewTab(item.slug, window.location.hash || '#/search')} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的教程。</p>
                  )}
                </section>
              )}

              {searchTab === 'knowledge' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">术语百科 ({searchTermResults.length})</h2>
                  {searchTermResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchTermResults.map((item) => (
                        <Card key={item.id} className="h-full p-6" onClick={() => navigateToTermDetail(item.id, window.location.hash || '#/search')}>
                          <div className="mb-3 flex items-center gap-2 flex-wrap">
                            <Badge label="术语百科" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30" />
                            {item.topicTags.slice(0, 2).map((tag) => (
                              <Badge key={tag} label={tag} className="bg-white/[0.02] text-gray-300 border-white/10" />
                            ))}
                          </div>
                          <h3 className="text-base md:text-lg font-bold mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-3">{item.summary}</p>
                          <div className="mt-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest flex items-center justify-between">
                            <span>{item.date}</span>
                            <span className="flex items-center gap-1"><Eye size={12} /> {item.readCount.toLocaleString()}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的术语词条。</p>
                  )}
                </section>
              )}

              {searchTab === 'video' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">优质视频 ({searchVideoResults.length})</h2>
                  {searchVideoResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchVideoResults.map((item) => (
                        <Card key={item.id} className="h-full overflow-hidden" onClick={() => (window.location.hash = `#/video/${item.slug}`)}>
                          <div className="aspect-video overflow-hidden">
                            <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          </div>
                          <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge label="优质视频" className="bg-pink-500/15 text-pink-300 border-pink-400/35" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold line-clamp-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的优质视频。</p>
                  )}
                </section>
              )}

              {searchTab === 'podcast' && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-black">AI播客 ({searchPodcastResults.length})</h2>
                  {searchPodcastResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchPodcastResults.map((item) => (
                        <Card key={item.id} className="h-full p-5" onClick={() => (window.location.hash = `#/podcast/${item.slug}`)}>
                          <div className="mb-3 flex items-center gap-2">
                            <Badge label="AI播客" className="bg-cyan-500/15 text-cyan-300 border-cyan-400/35" />
                          </div>
                          <h3 className="text-base md:text-lg font-bold line-clamp-2">{item.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-3 mt-2">{item.summary}</p>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无匹配的 AI播客。</p>
                  )}
                </section>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-24">
              <h2 className="text-2xl font-bold mb-4">内容未找到</h2>
              <button onClick={() => (window.location.hash = '#/')} className="text-[#1ed661] font-bold">返回首页</button>
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-4 bg-[#1ed661] text-black rounded-full shadow-[0_0_30px_rgba(30,214,97,0.4)] z-50 hover:scale-110 active:scale-95 transition-transform"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="mt-24 border-t border-white/5 py-12 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <TrendingUp className="text-[#1ed661] w-6 h-6" />
            <span className="text-xl font-black tracking-tighter">AISTORE</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">服务条款</a>
            <a href="#" className="hover:text-white transition-colors">联系我们</a>
          </div>
          <div className="text-xs text-gray-600">© 2026 Aistore 传媒集团。保留所有权利。</div>
        </div>
      </footer>
    </div>
  );
}
