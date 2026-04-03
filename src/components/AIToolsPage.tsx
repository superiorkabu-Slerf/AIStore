import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Menu,
  MessageSquare,
  PenTool,
  Search,
  Star,
  TrendingUp,
  Video
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Card, Badge } from './Common';
import { cn } from '../lib/utils';

type AIToolCategoryId =
  | 'chat'
  | 'image'
  | 'video'
  | 'writing'
  | 'coding'
  | 'design'
  | 'office'
  | 'audio'
  | 'search'
  | 'assistant';

type AIToolItem = {
  id: string;
  name: string;
  logo: string;
  screenshot: string;
  tagline: string;
  categoryId: AIToolCategoryId;
  category: string;
  price: string;
  chinese: boolean;
  traffic: string;
  rating: number;
  suitable: string[];
  tags: string[];
  platform: string;
  difficulty: string;
  pros: string[];
  cons: string[];
  description: string;
  features?: string[];
  target?: string;
  featured?: boolean;
  recommendation?: string;
  officialUrl?: string;
};

type FilterMode = 'category' | 'role';

const AI_TOOL_CATEGORIES = [
  { id: 'chat' as const, name: '对话', icon: MessageSquare },
  { id: 'image' as const, name: '绘画', icon: ImageIcon },
  { id: 'video' as const, name: '视频', icon: Video },
  { id: 'writing' as const, name: '写作', icon: PenTool },
  { id: 'coding' as const, name: '编程', icon: Code2 },
  { id: 'design' as const, name: '设计', icon: Briefcase },
  { id: 'office' as const, name: '办公', icon: Briefcase },
  { id: 'audio' as const, name: '音频', icon: Globe },
  { id: 'search' as const, name: '搜索', icon: Search },
  { id: 'assistant' as const, name: '助手', icon: Briefcase }
];

const ROLE_TOOL_MAP: Record<string, Record<string, string[]>> = {
  电商运营: {
    视觉与商品图: ['AI商品图', 'AI试衣', '背景去除', '包装设计'],
    营销与转化: ['营销物料设计', '带货文案生成', 'SEO爆款标题'],
    数据与客服: ['AI数据分析', '智能客服问答', '售后话术生成']
  },
  开发者: {
    代码辅助: ['AI编程', '代码审查', '自动化Bug修复'],
    架构与建站: ['AI网站构建', '数据库SQL辅助', 'API对接工具'],
    效能提升: ['无代码开发', '自动化流程', 'AI模型评测']
  },
  '产品与职场人': {
    文档与汇报: ['PPT制作', '职场公文', 'AI文档处理', '会议纪要提取'],
    规划与分析: ['AI思维导图', '竞品分析辅助', '业务流程自动化'],
    知识管理: ['知识库管理', '企业大脑', '效率助手']
  },
  出海与跨境: {
    本地化翻译: ['AI在线翻译', '多语种网站润色', '本土化口语表达'],
    海外社媒营销: ['社媒文案生成', '海外剧本创作', 'AI数字分身'],
    市场调研: ['海外舆情监控', '竞品情报抓取', '跨境合规审查']
  },
  内容创作者: {
    视频与短视频: ['AI视频生成', 'AI剪辑智能字幕', 'AI漫剧', 'AI短剧'],
    图文自媒体: ['小红书文案', '创意写作', 'AI图文生成'],
    音频与播客: ['视频配音', 'AI音乐创作', '声音克隆']
  },
  设计师: {
    UI平面设计: ['UIUX辅助', '平面设计', 'LOGO设计', 'AI配色'],
    图像精修: ['AI图像增强', '图像无损放大', '水印去除', '局部重绘'],
    空间与3D: ['3D建模辅助', '室内设计', '建筑渲染', '智能样机']
  },
  学生与科研: {
    学术科研: ['AI学术论文', '文献阅读总结', '查重与AI检测'],
    学习成长: ['外语学习助手', '解题答疑', '笔记整理']
  }
};

const CATEGORY_MAP: Record<string, string[]> = {
  AI绘画工具: ['AI绘画创作', 'AI换脸', 'AI人像写真', 'AI商品图', 'AI模型训练', 'AI动漫生成', 'AI试衣', 'AI图文生成'],
  AI图形处理: ['图像编辑', 'AI抠图', '背景去除', 'AI图像增强', 'AI图像放大', 'AI配色', '水印去除'],
  AI视频工具: ['AI视频生成', 'AI视频编辑', 'AI视频剪辑', 'AI数字分身', 'AI漫剧', 'AI智能字幕', '视频配音'],
  AI设计工具: ['UI/UX设计', '平面设计', '3D设计', 'LOGO设计', '营销物料设计', 'AI动画生成', '包装设计'],
  AI对话聊天: ['虚拟伴侣', '对话助手', '多模态问答'],
  AI智能助手: ['AI搜索', 'AI智能体', 'AI提示词库', 'AI求职助理', 'AI数据分析', 'AI在线翻译'],
  AI写作工具: ['AI写作', 'AI学术论文', '创意写作', '职场公文', 'AI文案生成'],
  AI办公工具: ['PPT制作', '效率助手', 'AI文档处理', 'AI思维导图', '知识库管理'],
  AI工具箱: ['AI工具导航', 'AI模型评测', 'AI开源社区', 'AI排行榜', '开发平台'],
  AI音频工具: ['AI音乐创作', '音频编辑', 'AI智能配音', 'AI语音识别'],
  AI编程工具: ['AI编程', 'AI网站构建', '自动化流程', '无代码开发', '代码审查']
};

const AI_TOOLS: AIToolItem[] = [
  {
    id: 'comic-master',
    name: '漫剧大师',
    logo: 'https://picsum.photos/seed/comic/120/120',
    screenshot: 'https://picsum.photos/seed/comic-shot/960/560',
    tagline: '一键将小说转为精美漫剧',
    categoryId: 'video',
    category: '视频',
    price: '免费+付费',
    chinese: true,
    traffic: '1.2M',
    rating: 9.4,
    suitable: ['网文作家', '短视频博主'],
    tags: ['AI漫剧', '分镜生成', '角色一致性'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['角色一致性极佳', '自动分镜'],
    cons: ['渲染耗时较长'],
    description: '专注将文字小说转化为动态漫剧，适合把剧情快速拆成镜头、旁白和镜头运动脚本。',
    features: ['小说一键拆镜', '人物设定复用', '剧情节奏自动排布'],
    target: '适合小说作者、短视频团队和需要高频输出剧情素材的内容工作室。',
    featured: true,
    recommendation: '如果你在做剧情号或 IP 二创，这类工具的产能提升非常明显。',
    officialUrl: 'https://example.com/comic-master'
  },
  {
    id: 'lobster-helper',
    name: '龙虾养殖助手',
    logo: 'https://picsum.photos/seed/lobster/120/120',
    screenshot: 'https://picsum.photos/seed/lobster-shot/960/560',
    tagline: '智能监测，让养龙虾更简单',
    categoryId: 'assistant',
    category: '助手',
    price: '免费+付费',
    chinese: true,
    traffic: '200K',
    rating: 8.9,
    suitable: ['养殖户', '农业科技'],
    tags: ['智慧农业', '水质监测', '病害识别'],
    platform: 'App',
    difficulty: '简单',
    pros: ['实时预警', '专家系统'],
    cons: ['需要配合硬件传感器'],
    description: '用视觉识别和传感器数据做养殖决策支持，属于压缩包里很有记忆点的行业型 AI 工具专题。',
    features: ['环境数据预警', '病害识别建议', '喂养与巡检提醒'],
    target: '适合垂直行业数字化、涉农科技项目和经营管理人员。',
    officialUrl: 'https://example.com/lobster-helper'
  },
  {
    id: 'creati-ai',
    name: 'Creati AI',
    logo: 'https://picsum.photos/seed/creati/120/120',
    screenshot: 'https://picsum.photos/seed/creati-shot/960/560',
    tagline: 'AI模特0成本拍片，产品展示超简单',
    categoryId: 'video',
    category: '视频',
    price: '免费+付费',
    chinese: true,
    traffic: '1.63M',
    rating: 8.9,
    suitable: ['电商', '自媒体'],
    tags: ['AI特效', 'AI视频', '虚拟模特', '电商营销'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['虚拟模特效果自然', '支持批量内容生成'],
    cons: ['复杂视频消耗点数较多'],
    description: '适合电商卖家用 AI 模特和场景合成做商品展示视频，大幅降低拍摄成本。',
    features: ['AI虚拟模特', '场景自动合成', '多尺寸视频批量产出'],
    target: '适合电商、品牌内容团队和需要快节奏投放物料的运营角色。',
    featured: true,
    recommendation: '电商卖家高频上新时很有价值，能明显缩短素材生产周期。',
    officialUrl: 'https://example.com/creati-ai'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    logo: 'https://picsum.photos/seed/chatgpt/120/120',
    screenshot: 'https://picsum.photos/seed/chatgpt-shot/960/560',
    tagline: '全球领先的 AI 对话助手',
    categoryId: 'chat',
    category: '对话',
    price: '免费+付费',
    chinese: true,
    traffic: '1.8B',
    rating: 9.8,
    suitable: ['全行业', '学生'],
    tags: ['大模型', '对话', '多模态'],
    platform: 'Web/App',
    difficulty: '简单',
    pros: ['综合能力强', '生态丰富', '支持多模态'],
    cons: ['部分功能需订阅'],
    description: '通用型 AI 助手，适合写作、总结、编程、分析和多模态任务。',
    features: ['自然语言问答', '文档处理', '代码与创作支持'],
    target: '适合几乎所有人把 AI 作为通用生产力入口。',
    featured: true,
    recommendation: '综合能力最均衡，适合当作默认起步工具。',
    officialUrl: 'https://chat.openai.com'
  },
  {
    id: 'claude',
    name: 'Claude',
    logo: 'https://picsum.photos/seed/claude/120/120',
    screenshot: 'https://picsum.photos/seed/claude-shot/960/560',
    tagline: '长文本处理和写作体验很强的 AI 助手',
    categoryId: 'chat',
    category: '对话',
    price: '免费+付费',
    chinese: true,
    traffic: '80M',
    rating: 9.5,
    suitable: ['写作', '编程'],
    tags: ['长文本', '代码', '分析'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['长上下文表现好', '文字风格自然'],
    cons: ['免费额度偏少'],
    description: '偏向深度写作、长文理解和结构化思考场景。',
    features: ['长文总结', '方案分析', '代码辅助'],
    target: '适合咨询、研究、产品和需要处理大量文档的人群。',
    featured: true,
    recommendation: '做长文和复杂总结时很稳。',
    officialUrl: 'https://claude.ai'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    logo: 'https://picsum.photos/seed/mj/120/120',
    screenshot: 'https://picsum.photos/seed/mj-shot/960/560',
    tagline: '目前画质非常强的 AI 绘画工具',
    categoryId: 'image',
    category: '绘画',
    price: '付费',
    chinese: false,
    traffic: '30M',
    rating: 9.7,
    suitable: ['设计师', '艺术家'],
    tags: ['艺术风格', '高画质', '创意探索'],
    platform: 'Discord',
    difficulty: '中等',
    pros: ['画质顶尖', '风格表现力强'],
    cons: ['上手门槛稍高'],
    description: '在创意概念图、风格海报和视觉探索上依然很强。',
    features: ['高美感图像生成', '风格化控制', '社区提示词生态'],
    target: '适合设计、创意提案和视觉参考生产。',
    featured: true,
    recommendation: '做海报、概念图和情绪版时依旧值得看。',
    officialUrl: 'https://midjourney.com'
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    logo: 'https://picsum.photos/seed/runway/120/120',
    screenshot: 'https://picsum.photos/seed/runway-shot/960/560',
    tagline: '电影感很强的 AI 视频生成工具',
    categoryId: 'video',
    category: '视频',
    price: '付费',
    chinese: false,
    traffic: '5M',
    rating: 9.4,
    suitable: ['视频博主', '导演'],
    tags: ['视频生成', '镜头感', '特效'],
    platform: 'Web',
    difficulty: '中等',
    pros: ['画面质感好', '视频工作流成熟'],
    cons: ['价格偏高'],
    description: '偏专业向的视频生成平台，适合广告、分镜和实验性创意制作。',
    features: ['文本转视频', '图像转视频', '生成式编辑'],
    target: '适合视频工作室、广告创意团队和独立导演。',
    officialUrl: 'https://example.com/runway'
  },
  {
    id: 'sora',
    name: 'Sora',
    logo: 'https://picsum.photos/seed/sora/120/120',
    screenshot: 'https://picsum.photos/seed/sora-shot/960/560',
    tagline: '备受关注的视频模型能力方向',
    categoryId: 'video',
    category: '视频',
    price: '未开放',
    chinese: true,
    traffic: 'N/A',
    rating: 9.9,
    suitable: ['全行业'],
    tags: ['视频大模型', 'OpenAI', '世界模拟'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['叙事能力强', '物理感表现好'],
    cons: ['可用性受限'],
    description: '更像是视频模型能力的风向标，常被当作视频生成效果的参照对象。',
    features: ['复杂场景生成', '长镜头叙事', '高一致性画面'],
    target: '适合关注前沿能力、视频工作流和内容创新团队。',
    officialUrl: 'https://example.com/sora'
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    logo: 'https://picsum.photos/seed/heygen/120/120',
    screenshot: 'https://picsum.photos/seed/heygen-shot/960/560',
    tagline: 'AI 数字人视频生成领跑者',
    categoryId: 'video',
    category: '视频',
    price: '付费',
    chinese: true,
    traffic: '10M',
    rating: 9.2,
    suitable: ['企业培训', '营销'],
    tags: ['数字人', '口型同步', '多语言'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['口型自然', '模板成熟'],
    cons: ['订阅价格较高'],
    description: '数字人口播类场景非常成熟，适合培训、宣讲、介绍视频。',
    features: ['数字人模板', '口播视频生成', '多语言版本输出'],
    target: '适合培训、企业内容和国际化营销团队。',
    officialUrl: 'https://example.com/heygen'
  },
  {
    id: 'kling',
    name: '可灵',
    logo: 'https://picsum.photos/seed/kling/120/120',
    screenshot: 'https://picsum.photos/seed/kling-shot/960/560',
    tagline: '国产热门视频生成工具',
    categoryId: 'video',
    category: '视频',
    price: '免费+付费',
    chinese: true,
    traffic: '8M',
    rating: 9.3,
    suitable: ['全行业'],
    tags: ['国产AI', '视频生成', '长视频'],
    platform: 'App/Web',
    difficulty: '简单',
    pros: ['中文体验好', '视频时长表现不错'],
    cons: ['高峰期排队'],
    description: '国产视频生成代表之一，适合中文创作者快速尝试视频内容生成。',
    features: ['文本转视频', '图像转视频', '中文场景友好'],
    target: '适合国内内容创作者和短视频团队。',
    officialUrl: 'https://example.com/kling'
  },
  {
    id: 'canva-ai',
    name: 'Canva AI',
    logo: 'https://picsum.photos/seed/canva/120/120',
    screenshot: 'https://picsum.photos/seed/canva-shot/960/560',
    tagline: '设计小白也能快速完成视觉产出',
    categoryId: 'design',
    category: '设计',
    price: '免费+付费',
    chinese: true,
    traffic: '500M',
    rating: 9.2,
    suitable: ['设计师', '市场运营'],
    tags: ['设计', '排版', '海量模板'],
    platform: 'Web/App',
    difficulty: '简单',
    pros: ['模板丰富', '协作方便'],
    cons: ['高度定制空间有限'],
    description: '偏模板与协作流的 AI 设计工具，适合快速交付海报、社媒图和演示材料。',
    features: ['智能排版', '一键改尺寸', '团队协作'],
    target: '适合市场、运营、行政和中小团队。',
    officialUrl: 'https://example.com/canva-ai'
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    logo: 'https://picsum.photos/seed/notion/120/120',
    screenshot: 'https://picsum.photos/seed/notion-shot/960/560',
    tagline: '你的全能 AI 办公助手',
    categoryId: 'office',
    category: '办公',
    price: '免费+付费',
    chinese: true,
    traffic: '150M',
    rating: 9.4,
    suitable: ['学生', '职场人士'],
    tags: ['笔记', '知识库', 'AI写作'],
    platform: 'Web/App',
    difficulty: '简单',
    pros: ['深度集成文档工作流', '适合知识管理'],
    cons: ['AI 功能需额外付费'],
    description: '把笔记、文档、数据库和 AI 写作结合在一起，适合团队知识管理。',
    features: ['文档润色', '知识整理', '会议纪要'],
    target: '适合个人知识管理和中小团队协作。',
    officialUrl: 'https://example.com/notion-ai'
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    logo: 'https://picsum.photos/seed/copilot/120/120',
    screenshot: 'https://picsum.photos/seed/copilot-shot/960/560',
    tagline: '你的 AI 结对编程伙伴',
    categoryId: 'coding',
    category: '编程',
    price: '付费',
    chinese: true,
    traffic: '20M',
    rating: 9.6,
    suitable: ['开发者'],
    tags: ['编程', '代码生成', 'IDE'],
    platform: 'IDE Plugin',
    difficulty: '中等',
    pros: ['补全流畅', '开发链路嵌入深'],
    cons: ['偶尔会一本正经写错'],
    description: '高频编码时非常实用，尤其适合样板代码、接口对接和重构辅助。',
    features: ['代码补全', '注释转代码', '聊天式问答'],
    target: '适合前后端开发者和工程团队。',
    featured: true,
    recommendation: '对日常编码效率提升很直接。',
    officialUrl: 'https://example.com/github-copilot'
  },
  {
    id: 'suno',
    name: 'Suno AI',
    logo: 'https://picsum.photos/seed/suno/120/120',
    screenshot: 'https://picsum.photos/seed/suno-shot/960/560',
    tagline: '一键生成高品质音乐',
    categoryId: 'audio',
    category: '音频',
    price: '免费+付费',
    chinese: true,
    traffic: '15M',
    rating: 9.5,
    suitable: ['音乐爱好者', '创作者'],
    tags: ['音乐生成', 'AI作曲', '音频'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['风格丰富', '出歌速度快'],
    cons: ['歌词控制还不够细'],
    description: '适合做音乐 demo、配乐灵感和社媒内容背景音。',
    features: ['文字生成歌曲', '多风格编曲', '快速试听'],
    target: '适合短视频作者、音乐爱好者和内容团队。',
    officialUrl: 'https://example.com/suno'
  },
  {
    id: 'jasper',
    name: 'Jasper',
    logo: 'https://picsum.photos/seed/jasper/120/120',
    screenshot: 'https://picsum.photos/seed/jasper-shot/960/560',
    tagline: '专为营销设计的 AI 写作工具',
    categoryId: 'writing',
    category: '写作',
    price: '付费',
    chinese: true,
    traffic: '8M',
    rating: 8.9,
    suitable: ['营销人员', '博主'],
    tags: ['营销写作', 'SEO', '文案'],
    platform: 'Web',
    difficulty: '简单',
    pros: ['模板丰富', '营销导向明确'],
    cons: ['价格偏高'],
    description: '适合品牌营销、投放文案和内容团队做模板化写作。',
    features: ['营销文案', 'SEO 辅助', '品牌语气统一'],
    target: '适合市场部、增长团队和商业内容岗位。',
    officialUrl: 'https://example.com/jasper'
  },
  {
    id: 'leonardo-ai',
    name: 'Leonardo.ai',
    logo: 'https://picsum.photos/seed/leonardo/120/120',
    screenshot: 'https://picsum.photos/seed/leonardo-shot/960/560',
    tagline: '全能型 AI 绘画与创作平台',
    categoryId: 'image',
    category: '绘画',
    price: '免费+付费',
    chinese: false,
    traffic: '12M',
    rating: 9.3,
    suitable: ['设计师', '游戏开发'],
    tags: ['绘画', '模型训练', '3D纹理'],
    platform: 'Web',
    difficulty: '中等',
    pros: ['功能丰富', '支持风格控制'],
    cons: ['界面较复杂'],
    description: '适合游戏、视觉开发和需要较多控制参数的创意生产。',
    features: ['图像生成', '素材风格训练', '资产迭代'],
    target: '适合视觉设计师、游戏美术和进阶创作者。',
    officialUrl: 'https://example.com/leonardo-ai'
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    logo: 'https://picsum.photos/seed/firefly/120/120',
    screenshot: 'https://picsum.photos/seed/firefly-shot/960/560',
    tagline: '商用安全感更强的 AI 创意工具',
    categoryId: 'image',
    category: '绘画',
    price: '付费',
    chinese: true,
    traffic: '15M',
    rating: 9.0,
    suitable: ['专业设计师', '企业'],
    tags: ['商用安全', 'Adobe', '图像生成'],
    platform: 'Web/Photoshop',
    difficulty: '简单',
    pros: ['与 Adobe 工作流结合好', '企业接受度高'],
    cons: ['需要 Adobe 账号体系'],
    description: '更适合企业设计和商用流程中的图像生成、局部编辑与素材延展。',
    features: ['生成填充', '图像扩图', '与 Adobe 套件协同'],
    target: '适合设计团队、品牌团队和企业创意流程。',
    officialUrl: 'https://example.com/adobe-firefly'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    logo: 'https://picsum.photos/seed/perplexity/120/120',
    screenshot: 'https://picsum.photos/seed/perplexity-shot/960/560',
    tagline: 'AI 驱动的新一代搜索工具',
    categoryId: 'search',
    category: '搜索',
    price: '免费+付费',
    chinese: true,
    traffic: '40M',
    rating: 9.6,
    suitable: ['全行业', '学生'],
    tags: ['搜索', '实时信息', '引用来源'],
    platform: 'Web/App',
    difficulty: '简单',
    pros: ['检索快', '引用展示清晰'],
    cons: ['深度推理场景不如通用助手'],
    description: '在资料检索、快速了解主题和整理来源时体验很好。',
    features: ['联网搜索', '结果引用', '主题追问'],
    target: '适合研究、学习和需要快速做事实检索的用户。',
    featured: true,
    recommendation: '做信息搜集与来源对照很方便。',
    officialUrl: 'https://example.com/perplexity'
  }
];

const TOP_TOOLS = [...AI_TOOLS].sort((a, b) => b.rating - a.rating).slice(0, 10);
const FEATURED_TOOLS = AI_TOOLS.filter((tool) => tool.featured);

const AI_NEWS = [
  '阿里发布全新图像统一模型，主打高拟真人像与长文渲染',
  'OpenClaw 集成 QQ 机器人，频道内测全链路 AI 社区协作',
  'Sora 宣布即将开启新一轮能力开放，视频创作关注度飙升',
  'Midjourney 新版本测试画面流出，光影表现继续突破'
];

function normalizePriceType(price: string) {
  if (price === '付费') return '付费';
  if (price === '未开放') return '未开放';
  if (price.includes('免费+付费')) return 'Freemium';
  if (price.includes('免费')) return '免费';
  return '付费';
}

function inferUpdatedBucket(index: number) {
  if (index <= 3) return '7天内';
  if (index <= 8) return '30天内';
  return '90天内';
}

type ToolDecisionMeta = {
  positioning: string;
  updatedAt: string;
  addedAt: string;
  verifiedAt: string;
  suitableFor: string[];
  notSuitableFor: string[];
  useCases: string[];
  screenshotItems: string[];
  alternativeToolIds: {
    similar: string[];
    cheaper: string[];
    chineseFriendly: string[];
    popular: string[];
  };
};

function inferUpdatedDate(index: number) {
  if (index <= 3) return '2026-04-02';
  if (index <= 8) return '2026-03-24';
  return '2026-02-18';
}

function inferAddedDate(index: number) {
  if (index <= 3) return '2026-03-01';
  if (index <= 8) return '2026-02-10';
  return '2026-01-08';
}

function inferVerificationDate(index: number) {
  if (index <= 3) return '2026-04-03';
  if (index <= 8) return '2026-03-29';
  return '2026-03-12';
}

function inferRequiresLogin(tool: AIToolItem) {
  return !tool.platform.toLowerCase().includes('self-hosted');
}

function inferHasFreeTrial(tool: AIToolItem) {
  return tool.price.includes('免费');
}

function inferNeedsVpn(tool: AIToolItem) {
  const platform = tool.platform.toLowerCase();
  if (platform.includes('discord')) return '大概率需要';
  if (!tool.chinese) return '可能需要';
  return '通常不需要';
}

function inferCoreFeaturePaywall(tool: AIToolItem) {
  const normalizedPrice = normalizePriceType(tool.price);
  if (normalizedPrice === '免费') return '否';
  if (normalizedPrice === '未开放') return '当前暂未开放';
  if (normalizedPrice === 'Freemium') return '部分核心功能需付费';
  return '是';
}

function inferSuitableFor(tool: AIToolItem) {
  if (tool.categoryId === 'video') return ['适合内容创作者', '适合需要快速出片的团队', '适合想低门槛做视频的人'];
  if (tool.categoryId === 'coding') return ['适合前后端开发者', '适合想缩短编码时间的团队', '适合日常高频写代码的人'];
  if (tool.categoryId === 'writing') return ['适合内容运营', '适合营销与文案团队', '适合高频写作的人'];

  return Array.from(
    new Set([
      `适合${tool.suitable.join('、')}等人群`,
      `适合想用 ${tool.category} 工具快速完成结果产出的人`,
      tool.difficulty === '简单' ? '适合希望低门槛上手的新手用户' : '适合愿意花一点时间打磨效果的用户'
    ])
  ).slice(0, 3);
}

function inferNotSuitableFor(tool: AIToolItem) {
  if (tool.categoryId === 'video') return ['不适合需要重度专业剪辑的用户', '不适合追求复杂后期控制的团队', '不适合无法接受生成等待时间的人'];

  return Array.from(
    new Set([
      `不太适合对 ${tool.category} 专业控制要求特别重的用户`,
      tool.difficulty === '简单' ? '不太适合追求复杂高级参数调校的用户' : '不太适合完全不愿投入学习成本的新手',
      tool.cons[0] ? `不太适合无法接受“${tool.cons[0]}”这类限制的人` : '不太适合需要完全零限制工作流的团队'
    ])
  ).slice(0, 3);
}

function inferUseCases(tool: AIToolItem) {
  const byCategory: Record<AIToolCategoryId, string[]> = {
    video: ['短视频创作', '营销物料生成', '产品展示视频', '数字人口播', '广告素材快速生成'],
    chat: ['日常问答', '方案整理', '内容起草', '学习辅助', '多任务协作'],
    image: ['海报与封面生成', '商品图制作', '视觉提案', '风格探索', '设计草稿产出'],
    writing: ['营销文案', '文章初稿', '脚本生成', '内容改写', '总结整理'],
    coding: ['代码生成', '调试修复', '接口开发', '重构辅助', '开发协作提效'],
    design: ['海报制作', '品牌视觉', '社媒物料', '演示设计', '团队协作交付'],
    office: ['会议纪要', '文档整理', '知识库管理', 'PPT制作', '团队协作'],
    audio: ['配乐灵感', '短视频背景音', '音乐 demo', '内容配音', '音频创作'],
    search: ['资料搜集', '事实检索', '来源对照', '轻量分析', '快速了解新主题'],
    assistant: ['通用问答', '任务辅助', '数据分析', '知识查询', '效率提升']
  };

  return byCategory[tool.categoryId] || ['常见任务处理', '效率提升', '内容生产'];
}

function buildToolDecisionMeta(tool: AIToolItem, index: number): ToolDecisionMeta {
  const fallbackAlternatives = AI_TOOLS.filter((item) => item.id !== tool.id);
  const similar = fallbackAlternatives.filter((item) => item.categoryId === tool.categoryId).slice(0, 3).map((item) => item.id);
  const cheaper = fallbackAlternatives
    .filter((item) => item.categoryId === tool.categoryId && normalizePriceType(item.price) !== '付费')
    .slice(0, 3)
    .map((item) => item.id);
  const chineseFriendly = fallbackAlternatives
    .filter((item) => item.categoryId === tool.categoryId && item.chinese)
    .slice(0, 3)
    .map((item) => item.id);
  const popular = [...TOP_TOOLS].filter((item) => item.id !== tool.id).slice(0, 4).map((item) => item.id);

  return {
    positioning: tool.tagline,
    updatedAt: inferUpdatedDate(index),
    addedAt: inferAddedDate(index),
    verifiedAt: inferVerificationDate(index),
    suitableFor: inferSuitableFor(tool),
    notSuitableFor: inferNotSuitableFor(tool),
    useCases: inferUseCases(tool),
    screenshotItems: ['产品界面截图', '示例输出图', '典型结果展示', '使用流程示意'],
    alternativeToolIds: { similar, cheaper, chineseFriendly, popular }
  };
}

function iconForCategoryName(name: string) {
  if (name.includes('绘画')) return ImageIcon;
  if (name.includes('视频')) return Video;
  if (name.includes('设计')) return PenTool;
  if (name.includes('对话')) return MessageSquare;
  if (name.includes('写作')) return PenTool;
  if (name.includes('办公')) return Briefcase;
  if (name.includes('音频')) return Globe;
  if (name.includes('编程')) return Code2;
  return Star;
}

function iconForRoleName(name: string) {
  if (name.includes('开发者')) return Code2;
  if (name.includes('创作者')) return Video;
  if (name.includes('设计')) return PenTool;
  if (name.includes('学生')) return GraduationCap;
  if (name.includes('出海')) return Globe;
  return Briefcase;
}

function buildHash(path: string, params?: Record<string, string>) {
  const search = params ? new URLSearchParams(params).toString() : '';
  return `#/ai-tools${path}${search ? `?${search}` : ''}`;
}

function setHash(path: string, params?: Record<string, string>) {
  window.location.hash = buildHash(path, params);
}

function openToolDetailInNewTab(toolId: string) {
  window.open(buildHash(`/tool/${toolId}`), '_blank', 'noopener,noreferrer');
}

function parseAIToolsHash(hash: string) {
  const cleaned = hash.replace(/^#\/ai-tools/, '') || '/';
  const [pathname = '/', search = ''] = cleaned.split('?');
  const params = new URLSearchParams(search);
  return { pathname: pathname || '/', params };
}

function matchesCategory(tool: AIToolItem, filter: string) {
  if (filter === '全部') return true;
  const normalized = filter
    .replace(/^AI/, '')
    .replace(/工具$/, '')
    .replace('聊天', '对话')
    .replace('智能助手', '助手')
    .replace('图形处理', '绘画')
    .replace('工具箱', '');

  return (
    tool.category.includes(normalized) ||
    tool.tags.some((tag) => tag.includes(filter) || tag.includes(normalized)) ||
    tool.tagline.includes(filter) ||
    tool.description.includes(filter)
  );
}

function matchesRole(tool: AIToolItem, role: string) {
  if (role === '全部') return true;
  return tool.suitable.some((item) => role.includes(item) || item.includes(role));
}

const ToolGridCard: React.FC<{ tool: AIToolItem }> = ({ tool }) => {
  return (
    <Card
      className="h-full cursor-pointer border-white/8 bg-[#0f1722]/75 hover:border-[#22c55e]/30"
      onClick={() => openToolDetailInNewTab(tool.id)}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={tool.screenshot} alt={tool.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/28 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-[1.1rem] border border-white/12 bg-[#101720]/92 p-1 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
              <img src={tool.logo} alt={tool.name} className="h-10 w-10 rounded-[0.85rem] object-cover" referrerPolicy="no-referrer" />
            </div>
            <h3 className="truncate text-lg font-black text-white">{tool.name}</h3>
            {tool.featured ? <Badge label="精选" className="text-[9px]" /> : null}
            <span className="inline-flex h-6 items-center rounded-full border border-[#1ed661]/18 bg-[#1ed661]/12 px-2.5 text-[11px] font-semibold leading-none text-[#7af3a6]">
              {tool.category}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-white/55">{tool.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tool.chinese ? (
            <span className="inline-flex h-6 items-center rounded-full border border-white/8 bg-white/[0.03] px-2.5 text-[11px] leading-none text-white/68">
              支持中文
            </span>
          ) : null}
          <span className="inline-flex h-6 items-center rounded-full border border-white/8 bg-white/[0.03] px-2.5 text-[11px] leading-none text-white/68">
            {tool.platform}
          </span>
          <span className="inline-flex h-6 items-center rounded-full border border-white/8 bg-white/[0.03] px-2.5 text-[11px] leading-none text-white/68">
            {tool.difficulty}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-white/62">{tool.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-white/8 pt-4 text-xs text-white/46">
          <span>月流量 {tool.traffic}</span>
          <span className="font-bold text-[#7af3a6]">评分 {tool.rating}</span>
        </div>
      </div>
    </Card>
  );
};

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    let page = index + 1;
    if (totalPages > 5 && currentPage > 3) {
      page = currentPage - 2 + index;
      if (page + (4 - index) > totalPages) {
        page = totalPages - 4 + index;
      }
    }
    return page;
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={cn(
            'h-10 min-w-10 rounded-full border px-3 text-sm font-bold transition-colors',
            currentPage === page
              ? 'border-[#1ed661]/60 bg-[#1ed661] text-black'
              : 'border-white/10 bg-white/[0.03] text-white/65 hover:text-white'
          )}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function TopicCard({ title, subtitle, badge, tools }: { title: string; subtitle: string; badge?: string; tools: AIToolItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Card className={cn('min-h-[240px] p-6', open ? 'rounded-b-none border-b-transparent' : '')}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {badge ? <Badge label={badge} /> : null}
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/52">{subtitle}</p>
          </div>
          <ChevronDown className={cn('mt-1 text-white/28 transition-transform', open ? 'rotate-180 text-[#1ed661]' : '')} />
        </div>
        <div className="mt-8 flex items-center gap-3">
          {tools.slice(0, 4).map((tool) => (
            <div key={tool.id} className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-[#111923]">
              <img src={tool.logo} alt={tool.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-30 rounded-b-3xl border border-white/10 border-t-transparent bg-[#121a24]/96 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="space-y-3">
              {tools.map((tool) => (
                <button key={tool.id} type="button" onClick={() => setHash(`/tool/${tool.id}`)} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.04]">
                  <img src={tool.logo} alt={tool.name} className="h-11 w-11 rounded-xl border border-white/10 object-cover" referrerPolicy="no-referrer" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{tool.name}</p>
                    <p className="truncate text-xs text-white/48">{tool.tagline}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/28" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NewsSpotlightCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Card className={cn('min-h-[240px] p-6', open ? 'rounded-b-none border-b-transparent' : '')}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white">最新AI情报</h3>
            <p className="mt-2 text-xs text-white/36">2026年04月02日</p>
          </div>
          <ChevronDown className={cn('mt-1 text-white/28 transition-transform', open ? 'rotate-180 text-[#1ed661]' : '')} />
        </div>
        <div className="mt-5 space-y-3">
          {AI_NEWS.slice(0, 2).map((news, index) => (
            <div key={news} className="flex items-start gap-3">
              <span className="text-lg font-black text-[#1ed661]">{`0${index + 1}`}</span>
              <p className="line-clamp-2 text-sm leading-6 text-white/72">{news}</p>
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full z-30 rounded-b-3xl border border-white/10 border-t-transparent bg-[#121a24]/96 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="space-y-4">
              {AI_NEWS.slice(2).map((news, index) => (
                <div key={news} className="flex items-start gap-3">
                  <span className="text-lg font-black text-[#1ed661]">{`0${index + 3}`}</span>
                  <p className="text-sm leading-6 text-white/66">{news}</p>
                </div>
              ))}
              <button type="button" onClick={() => (window.location.hash = '#/portal')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#7af3a6] transition-colors hover:text-[#a5f3c4]">
                查看更多资讯
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AIToolsHome() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
  const totalPages = Math.ceil(AI_TOOLS.length / pageSize);
  const paginatedTools = AI_TOOLS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="px-6 py-10 md:px-8 md:py-12">
      <section className="mx-auto max-w-7xl pt-4 md:pt-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Badge label="AI TOOLS" />
          </div>
          <h1 className="mt-5 mx-auto max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white md:text-6xl">
            发现真正适合你的 AI 工具
          </h1>
          <p className="mt-6 mx-auto max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9">
            从热门工具、专题推荐到单工具详情，快速找到适合你当前任务的那一类产品
          </p>
        </div>

        <div className="mt-10">
          <div className="flex max-w-3xl mx-auto flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-[#111923]/75 p-3 shadow-2xl md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/32" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setHash('/search', { q: query.trim() });
                }}
                placeholder="搜索工具、场景或功能，例如：AI视频 / 电商 / 编程助手"
                className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white/[0.03] pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[#1ed661]/40"
              />
            </div>
            <button type="button" onClick={() => setHash('/search', { q: query.trim() })} className="h-14 rounded-[1.25rem] bg-[#1ed661] px-7 text-sm font-black text-black transition-transform hover:scale-[1.01]">
              搜索工具
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['ChatGPT', 'Midjourney', 'Sora', 'Claude', 'GitHub Copilot'].map((tag) => (
              <button key={tag} type="button" onClick={() => setHash('/search', { q: tag })} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/62 transition-colors hover:border-[#1ed661]/35 hover:text-[#a5f3c4]">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <TopicCard title="一起养龙虾" subtitle="这个模块是行业专题入口，用一组相关工具帮助你快速理解某个垂直场景能用哪些 AI 产品。" tools={[AI_TOOLS[1], AI_TOOLS[15], AI_TOOLS[16], AI_TOOLS[4]].filter(Boolean)} />
          <TopicCard title="编辑精选" subtitle="这个模块是人工挑选入口，适合先看一组更值得优先点击和试用的代表性工具。" tools={[AI_TOOLS[1], AI_TOOLS[15], AI_TOOLS[16], AI_TOOLS[4]].filter(Boolean)} />
          <NewsSpotlightCard />
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
            <Star size={22} className="text-white" />
            本周热门
          </h2>
          <button type="button" onClick={() => setHash('/category/all')} className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/80">
            查看全部
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
          {FEATURED_TOOLS.map((tool) => (
            <Card key={tool.id} className="min-h-[252px] min-w-[300px] max-w-[300px] cursor-pointer p-5" onClick={() => setHash(`/tool/${tool.id}`)}>
              <div className="flex items-center gap-4">
                <img src={tool.logo} alt={tool.name} className="h-12 w-12 rounded-2xl border border-white/10 object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-base font-black text-white">{tool.name}</p>
                  <Badge label="本周热门" />
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-white/76">{tool.tagline}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/52">{tool.recommendation || tool.description}</p>
              <div className="mt-auto flex items-center justify-between pt-5 text-sm">
                <span className="font-bold text-[#7af3a6]">评分 {tool.rating}</span>
                <ChevronRight size={16} className="text-white/30" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl pb-6">
        <div>
          <div className="mb-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setHash('/category/all')} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:border-[#1ed661]/30 hover:text-white">
              全部
            </button>
            {Object.keys(CATEGORY_MAP).map((name) => {
              const Icon = iconForCategoryName(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setHash('/category/all', { mode: 'category', value: name })}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:border-[#1ed661]/30 hover:text-white"
                >
                  <Icon size={14} className="text-white/42" />
                  {name}
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedTools.map((tool) => (
              <ToolGridCard key={tool.id} tool={tool} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>
    </div>
  );
}

function AIToolsCategoryPage({ params }: { params: URLSearchParams }) {
  const [mode, setMode] = useState<FilterMode>((params.get('mode') as FilterMode) || 'category');
  const [activeFilter, setActiveFilter] = useState(params.get('value') || '全部');
  const [activeSubFilter, setActiveSubFilter] = useState('全部');
  const [sortMode, setSortMode] = useState<'recommended' | 'hot' | 'latest' | 'updated' | 'free_first'>('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    setMode(((params.get('mode') as FilterMode) || 'category') === 'role' ? 'role' : 'category');
    setActiveFilter(params.get('value') || '全部');
    setActiveSubFilter('全部');
    setSortMode('recommended');
    setCurrentPage(1);
  }, [params]);

  const subFilters = useMemo(() => {
    if (mode === 'category') return CATEGORY_MAP[activeFilter] || [];
    if (!ROLE_TOOL_MAP[activeFilter]) return [];
    return Object.values(ROLE_TOOL_MAP[activeFilter]).flat();
  }, [activeFilter, mode]);

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((tool) => {
      const primaryMatched = mode === 'category' ? matchesCategory(tool, activeFilter) : matchesRole(tool, activeFilter);
      if (!primaryMatched) return false;
      if (activeSubFilter === '全部') return true;
      return (
        tool.tags.some((tag) => tag.includes(activeSubFilter)) ||
        tool.tagline.includes(activeSubFilter) ||
        tool.description.includes(activeSubFilter)
      );
    });
  }, [activeFilter, activeSubFilter, mode]);

  const sortedTools = useMemo(() => {
    const toolsWithIndex = filteredTools.map((tool, index) => ({ tool, index }));

    toolsWithIndex.sort((a, b) => {
      if (sortMode === 'recommended') {
        const featuredDelta = Number(b.tool.featured) - Number(a.tool.featured);
        if (featuredDelta !== 0) return featuredDelta;
        return b.tool.rating - a.tool.rating;
      }

      if (sortMode === 'hot') {
        const trafficA = Number.parseFloat(String(a.tool.traffic)) || 0;
        const trafficB = Number.parseFloat(String(b.tool.traffic)) || 0;
        return trafficB - trafficA;
      }

      if (sortMode === 'latest') {
        return a.index - b.index;
      }

      if (sortMode === 'updated') {
        const order = { '7天内': 0, '30天内': 1, '90天内': 2 } as const;
        return order[inferUpdatedBucket(a.index)] - order[inferUpdatedBucket(b.index)];
      }

      const freeRank = { 免费: 0, Freemium: 1, 付费: 2, 未开放: 3 } as const;
      return freeRank[normalizePriceType(a.tool.price)] - freeRank[normalizePriceType(b.tool.price)];
    });

    return toolsWithIndex.map((item) => item.tool);
  }, [filteredTools, sortMode]);

  const totalPages = Math.ceil(sortedTools.length / pageSize);
  const paginatedTools = sortedTools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const primaryFilters =
    mode === 'category'
      ? ['全部', ...Object.keys(CATEGORY_MAP)]
      : ['全部', ...Object.keys(ROLE_TOOL_MAP)];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-12">
      <button type="button" onClick={() => setHash('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition-colors hover:text-white">
        <ArrowLeft size={16} />
        返回 AI 工具
      </button>

      <section>
        <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white">{activeFilter}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/54">
          按工具类型快速浏览这一类产品，并继续使用二级标签缩小范围，快速找到更贴近当前任务的工具集合。
        </p>
      </section>

      <section className="mt-8 space-y-6">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setMode('category');
              setActiveFilter('全部');
              setActiveSubFilter('全部');
              setCurrentPage(1);
            }}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-black transition-colors',
              mode === 'category' ? 'bg-[#1ed661] text-black' : 'bg-white/[0.04] text-white/60 hover:text-white'
            )}
          >
            按分类查找
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('role');
              setActiveFilter('设计师');
              setActiveSubFilter('全部');
              setCurrentPage(1);
            }}
            className={cn(
              'rounded-full px-5 py-2.5 text-sm font-black transition-colors',
              mode === 'role' ? 'bg-[#1ed661] text-black' : 'bg-white/[0.04] text-white/60 hover:text-white'
            )}
          >
            按角色查找
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {primaryFilters.map((filter) => {
            const Icon = mode === 'category' ? iconForCategoryName(filter) : iconForRoleName(filter);
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setActiveSubFilter('全部');
                  setCurrentPage(1);
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  activeFilter === filter
                    ? 'border-[#1ed661]/35 bg-[#1ed661]/12 text-[#a5f3c4]'
                    : 'border-white/10 bg-white/[0.03] text-white/62 hover:text-white'
                )}
              >
                {filter === '全部' ? <Star size={14} className="text-white/38" /> : <Icon size={14} className="text-white/38" />}
                {filter}
              </button>
            );
          })}
        </div>

        {activeFilter !== '全部' && subFilters.length ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveSubFilter('全部')}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  activeSubFilter === '全部' ? 'bg-[#1ed661] text-black' : 'bg-white/[0.04] text-white/56 hover:text-white'
                )}
              >
                全部
              </button>
              {subFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setActiveSubFilter(item);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    activeSubFilter === item ? 'bg-[#1ed661] text-black' : 'bg-white/[0.04] text-white/56 hover:text-white'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </section>

      <section className="mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-5 flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-white/52">
                共 <span className="font-bold text-white">{sortedTools.length}</span> 个
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '推荐排序', value: 'recommended' },
                  { label: '热门排序', value: 'hot' },
                  { label: '最新收录', value: 'latest' },
                  { label: '最近更新', value: 'updated' },
                  { label: '免费优先', value: 'free_first' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortMode(option.value as typeof sortMode)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      sortMode === option.value ? 'bg-[#1ed661] text-black' : 'bg-white/[0.04] text-white/56 hover:text-white'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedTools.length ? paginatedTools.map((tool) => <ToolGridCard key={tool.id} tool={tool} />) : <Card className="col-span-full p-10 text-center text-white/45">未找到相关工具</Card>}
            </div>
            <div className="mt-8">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>

          <aside>
            <Card className="sticky top-28 p-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-white">
                <TrendingUp size={18} className="text-[#1ed661]" />
                本周热门 Top 10
              </h3>
              <div className="mt-6 space-y-5">
                {TOP_TOOLS.map((tool, index) => (
                  <button key={tool.id} type="button" onClick={() => setHash(`/tool/${tool.id}`)} className="flex w-full items-center gap-4 text-left">
                    <span className={cn('w-6 text-center text-sm font-black', index < 3 ? 'text-[#1ed661]' : 'text-white/34')}>{index + 1}</span>
                    <img src={tool.logo} alt={tool.name} className="h-10 w-10 rounded-xl border border-white/10 object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{tool.name}</p>
                      <p className="truncate text-[11px] text-white/40">热度 {Math.round(tool.rating * 1000)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}

function AIToolsSearchPage({ params }: { params: URLSearchParams }) {
  const initialQuery = params.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setQuery(initialQuery);
    setCurrentPage(1);
  }, [initialQuery]);

  const filteredTools = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return AI_TOOLS;
    return AI_TOOLS.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(keyword) ||
        tool.tagline.toLowerCase().includes(keyword) ||
        tool.category.toLowerCase().includes(keyword) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
        tool.description.toLowerCase().includes(keyword)
      );
    });
  }, [query]);

  const totalPages = Math.ceil(filteredTools.length / pageSize);
  const paginatedTools = filteredTools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-12">
      <button type="button" onClick={() => setHash('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition-colors hover:text-white">
        <ArrowLeft size={16} />
        返回 AI 工具
      </button>

      <section className="pt-6 text-center">
        <h1 className="text-4xl font-black tracking-[-0.04em] text-white">搜索 AI 工具</h1>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-[1.75rem] border border-white/10 bg-[#111923]/75 p-3 shadow-2xl md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/32" size={18} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setHash('/search', { q: query.trim() });
              }}
              placeholder="输入关键词搜索工具、场景或功能"
              className="h-14 w-full rounded-[1.25rem] border border-transparent bg-white/[0.03] pl-12 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[#1ed661]/40"
            />
          </div>
          <button type="button" onClick={() => setHash('/search', { q: query.trim() })} className="h-14 rounded-[1.25rem] bg-[#1ed661] px-7 text-sm font-black text-black">
            搜索
          </button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {['ChatGPT', 'AI视频', '免费AI工具', 'Midjourney', '编程助手'].map((tag) => (
            <button key={tag} type="button" onClick={() => setHash('/search', { q: tag })} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/62 transition-colors hover:border-[#1ed661]/35 hover:text-[#a5f3c4]">
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-6 text-lg font-bold text-white">
          {query ? (
            <>
              搜索结果：<span className="text-[#7af3a6]">"{query}"</span>
            </>
          ) : (
            '全部工具'
          )}
          <span className="ml-3 text-sm font-normal text-white/42">找到 {filteredTools.length} 个结果</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedTools.length ? paginatedTools.map((tool) => <ToolGridCard key={tool.id} tool={tool} />) : <Card className="col-span-full p-12 text-center text-white/45">未找到相关工具，试试换个关键词。</Card>}
        </div>
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </section>
    </div>
  );
}

function AIToolDetailPage({ toolId }: { toolId: string | null }) {
  const tool = AI_TOOLS.find((item) => item.id === toolId) || AI_TOOLS[0];
  const toolIndex = Math.max(0, AI_TOOLS.findIndex((item) => item.id === tool.id));
  const decisionMeta = buildToolDecisionMeta(tool, toolIndex);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const alternativeGroups = {
    similar: decisionMeta.alternativeToolIds.similar.map((id) => AI_TOOLS.find((item) => item.id === id)).filter(Boolean) as AIToolItem[],
    cheaper: decisionMeta.alternativeToolIds.cheaper.map((id) => AI_TOOLS.find((item) => item.id === id)).filter(Boolean) as AIToolItem[],
    chineseFriendly: decisionMeta.alternativeToolIds.chineseFriendly.map((id) => AI_TOOLS.find((item) => item.id === id)).filter(Boolean) as AIToolItem[],
    popular: decisionMeta.alternativeToolIds.popular.map((id) => AI_TOOLS.find((item) => item.id === id)).filter(Boolean) as AIToolItem[]
  };
  const usageChecklist = [
    { label: '是否需要注册', value: inferRequiresLogin(tool) ? '需要' : '通常不需要' },
    { label: '是否有免费试用', value: inferHasFreeTrial(tool) ? '有' : '没有' },
    { label: '是否需要付费后使用核心功能', value: inferCoreFeaturePaywall(tool) },
    { label: '是否支持中文', value: tool.chinese ? '支持' : '英文为主' },
    { label: '是否适合新手', value: tool.difficulty === '简单' ? '适合' : '更适合进阶用户' },
    { label: '是否需科学上网', value: inferNeedsVpn(tool) }
  ];
  const heroInfo = [
    { label: '价格状态', value: tool.price },
    { label: '所属分类', value: tool.category },
    { label: '平台支持', value: tool.platform },
    { label: '中文支持', value: tool.chinese ? '支持中文' : '英文为主' },
    { label: '最近更新时间', value: decisionMeta.updatedAt },
    { label: '适合人群', value: tool.suitable.join(' / ') }
  ];
  const faqItems = [
    [`${tool.name} 免费吗？`, `${tool.name} 当前价格状态为 ${tool.price}。${inferHasFreeTrial(tool) ? '可以先用免费额度或试用再决定是否付费。' : '主要需要付费后持续使用。'}`],
    ['支持中文吗？', tool.chinese ? '支持中文输入或中文使用流程，对中文用户更友好。' : '当前以英文体验为主，中文用户上手成本会更高一些。'],
    ['适合新手吗？', tool.difficulty === '简单' ? '整体比较适合新手，先用模板或默认流程就能快速试起来。' : '更适合愿意花一点时间学习参数和工作流的用户。'],
    ['需要安装吗？', `主要通过 ${tool.platform} 使用，一般不需要复杂本地部署。`],
    ['有官网吗？', tool.officialUrl ? '有，可以直接通过页面顶部的官网按钮进入。' : '当前页面未提供独立官网链接。'],
    ['和同类工具有什么区别？', `${tool.name} 更突出的点在于${tool.pros.join('、')}，但也要注意${tool.cons.join('、')}。`]
  ];
  const editorScore = Math.min(5, Math.max(3.8, Number((tool.rating / 2.2).toFixed(1))));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-12">
      <button type="button" onClick={() => setHash('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition-colors hover:text-white">
        <ArrowLeft size={16} />
        返回 AI 工具
      </button>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="flex flex-col gap-5 md:flex-row">
            <img src={tool.logo} alt={tool.name} className="h-24 w-24 rounded-[1.75rem] border border-white/10 object-cover" referrerPolicy="no-referrer" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-[-0.04em] text-white">{tool.name}</h1>
                <span className="rounded-full border border-[#1ed661]/20 bg-[#1ed661]/10 px-3 py-1 text-xs font-bold text-[#7af3a6]">推荐关注</span>
                {tool.featured ? <Badge label="编辑精选" /> : null}
              </div>
              <p className="mt-3 text-lg text-white/56">{decisionMeta.positioning}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/62">{tag}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-[#7af3a6]">
                <Star size={18} className="fill-current" />
                <span className="text-xl font-black">{tool.rating}</span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/54">这是一个更偏“决策页”的详情结构，你可以在这里快速判断它是做什么的、适不适合你、值不值得试，以及有哪些替代方案。</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#101720]/80 p-5">
            <div className="flex flex-wrap gap-3">
              <a href={tool.officialUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1ed661] px-6 text-sm font-black text-black">
                官网
                <ExternalLink size={16} />
              </a>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              {heroInfo.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-6 border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
                  <span className="text-white/42">{item.label}</span>
                  <span className="text-right font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-black text-white">适合谁 / 不适合谁</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#1ed661]/15 bg-[#1ed661]/[0.06] p-5">
                <h3 className="text-lg font-black text-white">适合谁</h3>
                <div className="mt-4 space-y-3">
                  {decisionMeta.suitableFor.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 text-[#1ed661]" />
                      <p className="text-sm leading-7 text-white/68">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-lg font-black text-white">不适合谁</h3>
                <div className="mt-4 space-y-3">
                  {decisionMeta.notSuitableFor.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-300" />
                      <p className="text-sm leading-7 text-white/68">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-black text-white">核心功能</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(tool.features || tool.tags).map((feature) => (
                <div key={feature} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-bold text-white">{feature}</p>
                  <p className="mt-2 text-sm leading-6 text-white/54">{tool.name} 在这个能力点上更适合快速试用和判断是否能进入你的工作流。</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <img src={tool.screenshot} alt={tool.name} className="h-[360px] w-full object-cover" referrerPolicy="no-referrer" />
            <div className="border-t border-white/8 p-6">
              <h3 className="text-xl font-black text-white">截图 / 示例输出</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {decisionMeta.screenshotItems.map((item) => (
                  <div key={item} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/62">{item}</div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-black text-white">典型使用场景</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {decisionMeta.useCases.map((scene) => (
                <div key={scene} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/68">{scene}</div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-black text-white">使用门槛</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {usageChecklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm">
                  <span className="text-white/48">{item.label}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-black text-white">编辑点评</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/38">一句话评价</p>
                <p className="mt-3 text-base leading-8 text-white/66">{tool.description}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/38">推荐指数</p>
                <p className="mt-3 text-3xl font-black text-[#7af3a6]">{editorScore} / 5</p>
                <p className="mt-3 text-sm leading-7 text-white/58">{tool.recommendation || `${tool.name} 更适合大多数轻量到中度使用场景，先试一轮很容易判断是否值得继续投入。`}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#1ed661]/15 bg-[#1ed661]/[0.06] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/38">核心优势</p>
                <div className="mt-4 space-y-3">{tool.pros.map((item) => <p key={item} className="text-sm leading-7 text-white/70">{item}</p>)}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/38">主要短板</p>
                <div className="mt-4 space-y-3">{tool.cons.map((item) => <p key={item} className="text-sm leading-7 text-white/70">{item}</p>)}</div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-white/8 px-6 py-4">
              <h3 className="text-xl font-black text-white">常见问题 FAQ</h3>
            </div>
            {faqItems.map(([question, answer], index) => (
              <div key={question} className="border-b border-white/8 last:border-b-0">
                <button type="button" onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-white">
                  {question}
                  <ChevronDown size={16} className={cn('transition-transform', activeFaq === index ? 'rotate-180' : '')} />
                </button>
                <AnimatePresence>
                  {activeFaq === index ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-4 text-sm leading-7 text-white/56">{answer}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ))}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-black text-white">替代工具推荐</h3>
            <div className="mt-5 space-y-5">
              {[
                { title: '相似工具', items: alternativeGroups.similar },
                { title: '更便宜的替代', items: alternativeGroups.cheaper },
                { title: '更适合中文用户', items: alternativeGroups.chineseFriendly },
                { title: '同类热门', items: alternativeGroups.popular }
              ].map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/38">{group.title}</p>
                  <div className="mt-3 space-y-3">
                    {group.items.slice(0, 3).map((item) => (
                      <button key={`${group.title}-${item.id}`} type="button" onClick={() => setHash(`/tool/${item.id}`)} className="flex w-full items-center gap-3 text-left">
                        <img src={item.logo} alt={item.name} className="h-11 w-11 rounded-xl border border-white/10 object-cover" referrerPolicy="no-referrer" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{item.name}</p>
                          <p className="truncate text-xs text-white/42">{item.tagline}</p>
                        </div>
                        <span className="text-xs font-bold text-[#7af3a6]">{item.rating}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-black text-white">可信度模块</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-white/42">收录时间</span><span className="font-bold text-white">{decisionMeta.addedAt}</span></div>
              <div className="flex items-center justify-between"><span className="text-white/42">最近验证时间</span><span className="font-bold text-white">{decisionMeta.verifiedAt}</span></div>
              <div className="flex items-center justify-between"><span className="text-white/42">官网状态</span><span className="font-bold text-white">{tool.officialUrl ? '可访问官网入口' : '暂无官网链接'}</span></div>
              <div className="flex items-center justify-between"><span className="text-white/42">数据更新时间</span><span className="font-bold text-white">{decisionMeta.updatedAt}</span></div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-black text-white">相关入口</h3>
            <div className="mt-5 space-y-3 text-sm">
              <button type="button" onClick={() => setHash('/category/all', { mode: 'category', value: `AI${tool.category}工具` })} className="block text-left text-white/62 transition-colors hover:text-white">查看同类工具</button>
              <button type="button" onClick={() => setHash('/search', { q: tool.name })} className="block text-left text-white/62 transition-colors hover:text-white">搜索相关结果</button>
              <button type="button" onClick={() => setHash('/')} className="block text-left text-white/62 transition-colors hover:text-white">返回工具首页</button>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

export default function AIToolsPage({ hash }: { hash: string }) {
  const { pathname, params } = useMemo(() => parseAIToolsHash(hash), [hash]);
  const toolId = pathname.startsWith('/tool/') ? pathname.replace('/tool/', '') : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [hash]);

  if (pathname.startsWith('/tool/')) {
    return <AIToolDetailPage toolId={toolId} />;
  }

  if (pathname.startsWith('/search')) {
    return <AIToolsSearchPage params={params} />;
  }

  if (pathname.startsWith('/category/')) {
    return <AIToolsCategoryPage params={params} />;
  }

  return <AIToolsHome />;
}
