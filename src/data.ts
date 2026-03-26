import { NewsItem, Tool, GlossaryItem, SpecialTopic } from './types';

export const GLOSSARY_DATA: GlossaryItem[] = [
  { id: "1", term: "RAG", definition: "检索增强生成，通过外部知识库提升大模型回答准确度。" },
  { id: "2", term: "Agent", definition: "智能代理，具备规划、记忆和工具使用能力的 AI 系统。" },
  { id: "3", term: "Token", definition: "模型处理文本的最小单位。" },
  { id: "4", term: "LLM", definition: "大语言模型，基于海量数据训练的深度学习模型。" },
  { id: "5", term: "Fine-tuning", definition: "微调，在特定任务数据上进一步训练预训练模型。" },
  { id: "6", term: "Prompt", definition: "提示词，引导 AI 生成特定内容的输入文本。" },
  { id: "7", term: "Multimodal", definition: "多模态，指模型能同时处理文字、图像、音频等多种信息。" },
  { id: "8", term: "Diffusion", definition: "扩散模型，目前主流的 AI 图像生成技术架构。" }
];

export const SPECIALS_DATA: SpecialTopic[] = [
  {
    id: "s1",
    title: "从零构建你的 Agent 架构",
    description: "深度解析自主代理的感知、决策与执行闭环，探索未来生产力的新范式。",
    cover: "https://picsum.photos/seed/agent-special/800/600?blur=2",
    tag: "架构专题"
  },
  {
    id: "s2",
    title: "Web3 与 AI：去中心化算力的未来",
    description: "探讨区块链如何解决 AI 算力垄断与数据确权问题，构建开放的智能网络。",
    cover: "https://picsum.photos/seed/web3-special/800/600?blur=2",
    tag: "前沿交叉"
  }
];

export const SERIES_DATA: Record<string, string[]> = {
  "llama-3-mastery": ["llama-3-fine-tuning", "llama-3-deployment", "llama-3-rag-integration"],
  "stable-diffusion-pro": ["sdxl-turbo-guide", "comfyui-workflow-basics"]
};

export const TOOLS_DATA: Record<string, Tool> = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "https://api.dicebear.com/7.x/icons/svg?seed=openai",
    tagline: "全球领先的对话式人工智能",
    description: "由 OpenAI 开发的先进语言模型，支持对话、创作、编程及多模态交互。它是目前最流行且功能最强大的 AI 助手之一。",
    officialUrl: "https://chat.openai.com",
    features: ["多模态交互 (语音/图像)", "高级推理能力", "自定义 GPTs", "实时联网搜索"]
  },
  claude: {
    id: "claude",
    name: "Claude",
    logo: "https://api.dicebear.com/7.x/icons/svg?seed=anthropic",
    tagline: "更安全、更诚实的 AI 助手",
    description: "Anthropic 开发的 Claude 系列模型以其长文本处理能力和极高的诚实度著称，是处理复杂文档和编程任务的理想选择。",
    officialUrl: "https://claude.ai",
    features: ["200k 超长上下文", "极低幻觉率", "卓越的代码生成", "视觉理解能力"]
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    logo: "https://api.dicebear.com/7.x/icons/svg?seed=cursor",
    tagline: "AI 驱动的下一代代码编辑器",
    description: "基于 VS Code 构建，深度集成 AI 能力，能够理解整个代码库并辅助开发者进行高效编程。",
    officialUrl: "https://cursor.sh",
    features: ["全库索引理解", "智能代码补全", "自然语言编辑代码", "终端 AI 辅助"]
  },
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    logo: "https://api.dicebear.com/7.x/icons/svg?seed=mj",
    tagline: "顶级的 AI 艺术创作工具",
    description: "Midjourney 是一款运行在 Discord 上的 AI 图像生成工具，以其卓越的艺术审美和细节表现力闻名。",
    officialUrl: "https://midjourney.com",
    features: ["电影级画质", "极高的艺术审美", "强大的参数控制", "社区驱动创作"]
  }
};

export const NEWS_DATA: NewsItem[] = [
  {
    id: "m1",
    slug: "gpt-5-rumors",
    type: "article",
    title: "GPT-5 内部测试细节流出：多模态推理能力实现跨代飞跃",
    date: "2026-03-25",
    importance: 99,
    categoryTag: "模型动态",
    summary: "OpenAI 正在秘密测试代号为 'Gobi' 的新一代模型，其在逻辑链条的完整性上远超 GPT-4。",
    cover: "https://picsum.photos/seed/gpt5-hero/1200/800",
    readCount: 45200,
    isFeatured: true,
    sourceName: "Inside AI",
    sourceUrl: "#",
    relatedToolIds: ["chatgpt"]
  },
  {
    id: "f1",
    slug: "claude-3-5-launch",
    type: "flash",
    title: "Anthropic 正式发布 Claude 3.5 Sonnet：编程能力创下新纪录",
    exactTime: "10:30",
    date: "2026-03-25",
    importance: 95,
    categoryTag: "模型动态",
    summary: "新模型在 HumanEval 基准测试中达到 92% 的准确率，成为开发者的新宠。",
    sourceName: "Anthropic Blog",
    sourceUrl: "#",
    relatedToolIds: ["claude"],
    readCount: 12000
  },
  {
    id: "f2",
    slug: "nvidia-blackwell-ship",
    type: "flash",
    title: "英伟达 Blackwell 架构芯片正式出货：算力成本降低 25 倍",
    exactTime: "09:15",
    date: "2026-03-25",
    importance: 97,
    categoryTag: "硬件突破",
    summary: "首批 GPU 已交付给微软和 Meta，万亿级参数模型训练将进入平价时代。",
    sourceName: "NVIDIA News",
    sourceUrl: "#",
    relatedToolIds: [],
    readCount: 18500
  },
  {
    id: "f3",
    slug: "google-gemini-update",
    type: "flash",
    title: "Google Gemini 1.5 Pro 升级：支持 200 万 token 超长上下文",
    exactTime: "08:00",
    date: "2026-03-25",
    importance: 90,
    categoryTag: "模型动态",
    summary: "开发者现在可以一次性分析数小时的视频或整个代码库。",
    sourceName: "Google AI",
    sourceUrl: "#",
    relatedToolIds: [],
    readCount: 8900
  },
  {
    id: "p1",
    slug: "llama-3-fine-tuning",
    type: "article",
    title: "Llama 3 微调指南：如何在 8GB 显存上运行私有模型",
    date: "2026-03-24",
    importance: 92,
    categoryTag: "实战教程",
    summary: "手把手教你利用 QLoRA 技术，在消费级显卡上实现高质量的指令微调。",
    cover: "https://picsum.photos/seed/llama3/600/400",
    readCount: 23000,
    sourceName: "Aistore Tutorial",
    sourceUrl: "#",
    relatedToolIds: []
  },
  {
    id: "p2",
    slug: "sora-video-tips",
    type: "article",
    title: "Sora 视频创作技巧：掌握提示词工程，生成好莱坞级画面",
    date: "2026-03-24",
    importance: 88,
    categoryTag: "多模态",
    summary: "解析 10 个核心参数与构图指令，让你的 AI 视频告别“塑料感”。",
    cover: "https://picsum.photos/seed/sora/600/400",
    readCount: 15600,
    sourceName: "Creator Hub",
    sourceUrl: "#",
    relatedToolIds: []
  },
  {
    id: "p3",
    slug: "ai-law-update",
    type: "article",
    title: "AI 法律监管动态：全球首部 AI 法案生效，开发者需注意哪些红线？",
    date: "2026-03-23",
    importance: 85,
    categoryTag: "行业观察",
    summary: "深度解读合规性要求，涵盖数据隐私、算法透明度与版权保护。",
    cover: "https://picsum.photos/seed/law/600/400",
    readCount: 9800,
    sourceName: "Legal Daily",
    sourceUrl: "#",
    relatedToolIds: []
  },
  {
    id: "p4",
    slug: "sv-vc-weekly",
    type: "article",
    title: "硅谷 AI 创投周报：本周 5 家 Agent 初创公司获千万级融资",
    date: "2026-03-23",
    importance: 82,
    categoryTag: "投融资",
    summary: "资本市场正在从底层模型转向应用层，Agentic Workflow 成为新风口。",
    cover: "https://picsum.photos/seed/vc/600/400",
    readCount: 7400,
    sourceName: "TechCrunch",
    sourceUrl: "#",
    relatedToolIds: []
  }
];
