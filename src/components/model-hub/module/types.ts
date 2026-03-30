export interface Provider {
  id: string;
  name: string;
  logo: string;
  description: string;
  positioningSummary?: string; // One-line summary
  region: string;
  compliance: string;
  funding: string;
  website: string;
  modelCount: number;
  matrix?: string[]; // IDs of key models
  timeline: { date: string; event: string; type: 'release' | 'price_change' | 'update'; details?: string }[];
  capabilityTags: string[];
}

export interface Model {
  id: string;
  name: string;
  logo: string;
  provider: string; // providerId
  modelType: string; // e.g., 'LLM', 'Image', 'Audio'
  modality: string;
  isOpenSource: boolean;
  contextWindow: number;
  maxOutput: number;
  positioningSummary?: string; // One-line summary
  overview: string;
  popularityReason?: string;
  riskWarning?: string; // Short risk warning
  pricing: {
    input: number; // ¥ per million tokens
    output: number;
    priceUnit: string; // e.g., 'M Tokens'
    freeTier: string | null;
  };
  performance: {
    mmlu: number;
    humaneval: number;
    gsm8k: number;
    avgStability: string;
  };
  speed: {
    ttft: number;
    tps: number;
  };
  latency?: number; // ms
  throughput?: number; // tokens/s
  stability?: number; // %
  releaseDate: string;
  concurrencyRating: number;
  openaiCompatible: boolean;
  dataSource: {
    name: string;
    url?: string;
    updatedAt: string;
    note?: string;
  };
  tags: string[];
  scenarios: string[];
  suitableFor: string[];
  unsuitableFor: string[];
  recommendationReason: string;
  eloScore: number;
  purchaseLinks: { purchase: string; official: string };
  officialLinks: string;
  benchmarks: { name: string; score: number; source: string }[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  matchScore: number;
  modelIds: string[];
}

export interface Prompt {
  id: string;
  title: string;
  scene: string;
  promptContent: string;
  description: string;
  applicableModels: string[]; // model IDs
}

export interface TrendEvent {
  id: string;
  title: string;
  reason: string;
  description: string;
  date: string;
  modelId: string;
  relatedModels?: string[];
  actionUrl?: string;
  type: 'price_drop' | 'new_release' | 'alternative' | 'hot_scenario' | 'long_context' | 'low_cost';
  ctaLabel: string;
}

export interface FreeModelEntry {
  id: string;
  name: string;
  provider: string;
  logo: string;
  subtitle: string;
  description: string;
  tags: string[];
  category: '对话' | '推理' | '办公' | '视频' | '设计' | '长文本';
  freeType: string;
  website: string;
}
