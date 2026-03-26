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
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NEWS_DATA, TOOLS_DATA, GLOSSARY_DATA, SPECIALS_DATA } from './data';
import { NewsItem, Tool, GlossaryItem } from './types';
import { cn } from './lib/utils';
import { Card, Badge } from './components/Common';
import { ScrollProgress, MouseGlow } from './components/Effects';
import { TimelineItem, ArticleCard } from './components/NewsCards';

type ListTab = 'flash' | 'article' | 'tutorial' | 'knowledge';
type SearchTab = 'all' | ListTab;
type View = 'home' | 'portal' | 'list' | 'detail' | 'term' | 'tool' | 'section' | 'search';
type ContentSort = 'hot' | 'latest' | 'most_read';
type ContentDateRange = 'all' | '3d' | '7d' | '30d';
type FlashViewMode = 'compact' | 'detail';
type ContentLayoutMode = 'list' | 'card';

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

const buildTutorialFeed = (items: NewsItem[]): NewsItem[] => {
  const existing = items.filter((item) => item.type === 'tutorial');
  if (existing.length > 0) return existing;

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
      readCount: Math.max(6800, Math.round(item.readCount * 0.72))
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
                window.location.hash = `#/detail/${news.slug}`;
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
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState(0);
  const [glossaryOffset, setGlossaryOffset] = useState(0);
  const [recommendOffset, setRecommendOffset] = useState(0);
  const [contentTopicFilter, setContentTopicFilter] = useState('全部');
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
  const [shareFeedback, setShareFeedback] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [commentDraft, setCommentDraft] = useState('');
  const [extraComments, setExtraComments] = useState<Record<string, CommentItem[]>>({});
  const articleRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
      setIsNewsMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!hash.startsWith('#/list')) return;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const tab = params.get('tab');
    if (tab === 'flash' || tab === 'article' || tab === 'tutorial' || tab === 'knowledge') {
      setListTab(tab);
      return;
    }
    setListTab('flash');
  }, [hash]);

  useEffect(() => {
    setContentTopicFilter('全部');
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
    if (tab === 'all' || tab === 'flash' || tab === 'article' || tab === 'tutorial' || tab === 'knowledge') {
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

  const view = useMemo<View>(() => {
    if (hash === '#/' || hash === '#/home') return 'home';
    if (hash === '#/portal') return 'portal';
    if (hash.startsWith('#/list')) return 'list';
    if (hash.startsWith('#/detail/')) return 'detail';
    if (hash.startsWith('#/term/')) return 'term';
    if (hash.startsWith('#/tool/')) return 'tool';
    if (hash.startsWith('#/section/')) return 'section';
    if (hash.startsWith('#/search')) return 'search';
    return 'home';
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
    return ['全部'];
  }, [articleItems, tutorialItems, knowledgeItems, listTab]);

  const filteredArticleItems = useMemo(() => {
    const filtered = articleItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getNewsTopicTags(item).includes(contentTopicFilter);
      return byTopic && isWithinDateRange(item.date);
    });
    return getSortedNews(filtered);
  }, [articleItems, contentTopicFilter, contentDateRange, contentSort]);

  const filteredTutorialItems = useMemo(() => {
    const filtered = tutorialItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getNewsTopicTags(item).includes(contentTopicFilter);
      return byTopic && isWithinDateRange(item.date);
    });
    return getSortedNews(filtered);
  }, [tutorialItems, contentTopicFilter, contentDateRange, contentSort]);

  const filteredKnowledgeItems = useMemo(() => {
    const filtered = knowledgeItems.filter((item) => {
      const byTopic =
        contentTopicFilter === '全部' || getTermTopicTags(item).includes(contentTopicFilter);
      return byTopic && isWithinDateRange(item.date);
    });
    return getSortedTerms(filtered);
  }, [knowledgeItems, contentTopicFilter, contentDateRange, contentSort]);

  const flashItems = useMemo(() => allNews.filter((item) => item.type === 'flash'), [allNews]);
  const flashCategoryOptions = useMemo(() => {
    const tags = Array.from(new Set(flashItems.map((item) => item.categoryTag)));
    return ['全部快讯', ...tags];
  }, [flashItems]);

  const filteredFlashItems = useMemo(() => {
    const filtered = flashItems.filter((item) => {
      const byCategory =
        flashCategoryFilter === '全部快讯' || item.categoryTag === flashCategoryFilter;
      return byCategory && isWithinDateRange(item.date);
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
  }, [flashItems, flashCategoryFilter, contentDateRange, contentSort]);

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

  const handleOpenSource = (news: NewsItem) => {
    if (!news.sourceUrl || news.sourceUrl === '#') {
      setShareFeedback('来源链接待补充');
      return;
    }
    window.open(news.sourceUrl, '_blank', 'noopener,noreferrer');
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
      { title: '大模型', desc: '模型评测、选型与趋势。', href: '#/section/model', icon: Cpu },
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
              保持专业节奏kkkk，
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
              <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
            ))}
          </div>
        </section>
      </motion.div>
    );
  };

  const renderPortal = () => {
    const featured = portalFeaturedArticles[featuredSlideIndex] || portalFeaturedArticles[0];
    const flashes = portalFlashFeed;
    const articles = allNews.filter((item) => item.type === 'article').slice(0, 4);
    const tutorials = tutorialFeed.slice(0, 4);
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-14 md:space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {featured && (
            <div
              className="relative aspect-[16/10] lg:aspect-auto lg:h-[500px] rounded-3xl overflow-hidden cursor-pointer group border border-white/10"
              onClick={() => (window.location.hash = `#/detail/${featured.slug}`)}
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
              <h3 className="text-xl font-black flex items-center gap-3">
                <Clock className="text-[#1ed661]" size={24} />
                实时快讯
              </h3>
              <a href="#/list?tab=flash" className="text-xs font-bold text-gray-500 hover:text-[#1ed661] transition-colors">
                查看全部
              </a>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1ed661]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#1ed661]/70">
              {flashes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => (window.location.hash = `#/detail/${item.slug}`)}
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

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <BookOpen className="text-[#1ed661]" size={28} />
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
              <a href="#/list?tab=knowledge" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">查看全部术语</a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {portalGlossaryItems.map((item) => (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    window.location.hash = `#/term/${item.id}`;
                  }}
                  className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-xl text-center hover:bg-[#1ed661]/10 hover:border-[#1ed661]/30 transition-all"
                >
                  <span className="text-sm font-bold text-gray-300 group-hover:text-[#1ed661]">{item.term}</span>
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111923]/95 p-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:opacity-100">
                  <p className="text-xs font-bold text-[#1ed661] mb-1">术语预览</p>
                  <p className="text-xs text-gray-300 leading-6">{item.definition}</p>
                  <p className="text-[11px] text-gray-500 mt-2">点击进入词条详情</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <TrendingUp className="text-orange-500" size={28} />
              深度文章
            </h3>
            <a href="#/list?tab=article" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">查看全部</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((item) => (
              <Card key={item.id} className="h-full" onClick={() => (window.location.hash = `#/detail/${item.slug}`)}>
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
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <GraduationCap className="text-blue-500" size={28} />
              教程精选
            </h3>
            <a href="#/list?tab=tutorial" className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#1ed661] transition-colors">查看全部</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((item) => (
              <Card key={item.id} className="h-full" onClick={() => (window.location.hash = `#/detail/${item.slug}`)}>
                <div className="aspect-video overflow-hidden">
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3">
                    <Badge label="教程" className="bg-blue-500/20 text-blue-300 border-blue-400/30" />
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
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Star className="text-yellow-500" size={28} />
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
            <a href="#/section/skill" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/skill') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>Skill</a>
            <a href="#/section/mcp" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/mcp') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>MCP</a>
            <a href="#/section/model" className={cn('text-sm font-medium transition-colors', hash.startsWith('#/section/model') ? 'text-[#1ed661]' : 'text-gray-400 hover:text-[#1ed661]')}>大模型</a>

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
                  view === 'portal' || view === 'list' || view === 'detail' || view === 'term'
                    ? 'text-[#1ed661]'
                    : 'text-gray-400 hover:text-[#1ed661]'
                )}
              >
                资讯
                <ChevronDown size={14} className={cn('transition-transform', isNewsMenuOpen ? 'rotate-180' : 'rotate-0')} />
              </button>
              <div className="absolute left-0 right-0 top-full h-3" />
              <div
                className={cn(
                  'absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#161b22]/95 p-2 shadow-2xl backdrop-blur-md transition-all duration-150',
                  isNewsMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
                )}
              >
                <button onClick={() => goToListTab('flash')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">快讯</button>
                <button onClick={() => goToListTab('article')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">深度文章</button>
                <button onClick={() => goToListTab('tutorial')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">教程</button>
                <button onClick={() => goToListTab('knowledge')} className="w-full text-left block rounded-xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#1ed661] transition-colors">术语百科</button>
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

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            renderHome()
          ) : view === 'portal' ? (
            renderPortal()
          ) : view === 'list' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">资讯列表</h1>
                <p className="text-base text-gray-400 max-w-4xl mx-auto">从资讯聚合页进入，按分类浏览并搜索快讯、深度文章、教程和术语百科。</p>
              </div>

              <div className="sticky top-24 z-40 mb-8 border-b border-white/10 pb-4 backdrop-blur-md bg-[#0d1117]/85">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'flash', label: '快讯' },
                      { id: 'article', label: '深度文章' },
                      { id: 'tutorial', label: '教程' },
                      { id: 'knowledge', label: '百科' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => goToListTab(tab.id as ListTab)}
                        className={cn(
                          'pb-2 border-b-2 text-xl md:text-2xl leading-none font-bold transition-colors whitespace-nowrap',
                          listTab === tab.id
                            ? 'border-[#1ed661] text-[#22c55e]'
                            : 'border-transparent text-[#8e96a7] hover:text-[#d0d6e2]'
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-semibold">分类</span>
                        <select
                          value={listTab === 'flash' ? flashCategoryFilter : contentTopicFilter}
                          onChange={(e) => {
                            if (listTab === 'flash') {
                              setFlashCategoryFilter(e.target.value);
                              return;
                            }
                            setContentTopicFilter(e.target.value);
                          }}
                          className="h-10 rounded-xl bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors"
                        >
                          {(listTab === 'flash' ? flashCategoryOptions : listTopicOptions).map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-semibold">时间</span>
                        <select
                          value={contentDateRange}
                          onChange={(e) => setContentDateRange(e.target.value as ContentDateRange)}
                          className="h-10 rounded-xl bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors"
                        >
                          <option value="all">全部时间</option>
                          <option value="3d">近3天</option>
                          <option value="7d">近7天</option>
                          <option value="30d">近30天</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-semibold">排序</span>
                        <select
                          value={contentSort}
                          onChange={(e) => setContentSort(e.target.value as ContentSort)}
                          className="h-10 rounded-xl bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 px-3 text-sm text-gray-200 focus:outline-none focus:border-[#1ed661]/45 transition-colors"
                        >
                          <option value="hot">热度优先</option>
                          <option value="latest">最新发布</option>
                          <option value="most_read">阅读最多</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1 pl-1">
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
                              title="极简快讯"
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
                              title="详情快讯"
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
                              title="列表视图"
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
                              title="卡片视图"
                            >
                              <LayoutGrid size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {listTab === 'flash' && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">最后更新：刚刚</span>
                      )}
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          placeholder={listTab === 'flash' ? '搜索关键词...' : '搜索文章...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-11 w-[300px] bg-[#f9f9f9]/5 border border-transparent hover:border-white/20 rounded-xl pl-10 pr-10 text-sm text-gray-100 focus:outline-none focus:border-[#1ed661]/50 transition-colors"
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
                    </div>
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
                <div>
                  {listTab === 'flash' && (
                    filteredFlashItems.length > 0 ? (
                      flashViewMode === 'detail' ? (
                        <div className="max-w-4xl space-y-0">
                          {filteredFlashItems.map((item, idx, arr) => {
                            const prev = idx > 0 ? arr[idx - 1] : null;
                            const showDate = !prev || prev.date !== item.date;
                            return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />;
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
                                  onClick={() => (window.location.hash = `#/detail/${item.slug}`)}
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
                            <NewsHorizontalCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredArticleItems.map((item) => (
                            <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                            <NewsHorizontalCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredTutorialItems.map((item) => (
                            <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                            <TermHorizontalCard key={item.id} item={item} onClick={() => (window.location.hash = `#/term/${item.id}`)} />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {filteredKnowledgeItems.map((item) => (
                            <Card key={item.id} className="h-full p-6" onClick={() => (window.location.hash = `#/term/${item.id}`)}>
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
                </div>

                <aside className="xl:sticky xl:top-32">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
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
                </aside>
              </div>
            </motion.div>
          ) : view === 'section' ? (
            renderSection(currentSectionKey)
          ) : view === 'detail' && currentNews ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 space-y-10">
              <div className="sticky top-20 z-30">
                <div className="h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#1ed661] shadow-[0_0_12px_#1ed661] transition-[width] duration-200"
                    style={{ width: `${articleReadProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => (window.location.hash = '#/portal')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
                    <ArrowLeft size={16} />
                    返回资讯
                  </button>
                  <div className="flex items-center gap-3">
                    <Badge label={currentNews.categoryTag} />
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {currentNews.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
                  <Home size={14} className="text-gray-500 flex-shrink-0" />
                  <span>资讯</span>
                  <span className="text-gray-600">›</span>
                  <span>{currentNewsModule}</span>
                  <span className="text-gray-600">›</span>
                  <span className="text-gray-400">{currentNews.title}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111923] via-[#0d1117] to-[#0b1510] p-8 md:p-10">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-6 leading-[1.3] tracking-tight break-words">
                  {currentNews.title}
                </h1>
                <div className="flex items-center justify-end pt-5 border-t border-white/5 gap-6 flex-wrap">
                  <div className="flex items-center gap-6 text-xs text-gray-600 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {currentNews.readCount.toLocaleString()}</span>
                    <span>{currentNews.estimatedTime || '8 MIN'}</span>
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
                  onClick={() => previousNews && (window.location.hash = `#/detail/${previousNews.slug}`)}
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
                  onClick={() => nextNews && (window.location.hash = `#/detail/${nextNews.slug}`)}
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
                      onClick={() => (window.location.hash = `#/detail/${item.slug}`)}
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
          ) : view === 'term' && currentTerm ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-8 space-y-8">
              <div className="flex items-center justify-between">
                <button onClick={() => goToListTab('knowledge')} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300 hover:text-white hover:border-[#1ed661]/40 transition-colors">
                  <ArrowLeft size={16} />
                  返回术语百科
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
                  onClick={() => previousTerm && (window.location.hash = `#/term/${previousTerm.id}`)}
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
                  onClick={() => nextTerm && (window.location.hash = `#/term/${nextTerm.id}`)}
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
                    <button key={item.id} onClick={() => (window.location.hash = `#/term/${item.id}`)} className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
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
                  { id: 'all', label: '全部', count: searchNewsResults.length + searchTermResults.length },
                  { id: 'flash', label: '快讯', count: searchFlashResults.length },
                  { id: 'article', label: '深度文章', count: searchArticleResults.length },
                  { id: 'tutorial', label: '教程', count: searchTutorialResults.length },
                  { id: 'knowledge', label: '术语百科', count: searchTermResults.length }
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
                          return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />;
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
                          <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                          <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                          <Card key={item.id} className="h-full p-6" onClick={() => (window.location.hash = `#/term/${item.id}`)}>
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
                        return <TimelineItem key={item.id} item={item} showDate={showDate} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />;
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
                        <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                        <ArticleCard key={item.id} item={item} onClick={() => (window.location.hash = `#/detail/${item.slug}`)} />
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
                        <Card key={item.id} className="h-full p-6" onClick={() => (window.location.hash = `#/term/${item.id}`)}>
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
