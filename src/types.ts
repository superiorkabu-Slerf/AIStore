export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
}

export interface SpecialTopic {
  id: string;
  title: string;
  description: string;
  cover: string;
  tag: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  type: 'flash' | 'article' | 'tutorial';
  title: string;
  exactTime?: string;
  date: string;
  importance: number;
  categoryTag: string;
  highlightQuote?: string;
  summary: string;
  fullContent?: string;
  content?: string; // Used in detail view
  sourceName: string;
  sourceUrl: string;
  relatedToolIds: string[];
  readCount: number;
  isFeatured?: boolean;
  portal_summary?: string;
  cover?: string;
  difficulty?: string;
  estimatedTime?: string;
  learnCount?: number;
  wordCount?: number;
  isEditorsChoice?: boolean;
  author?: Author;
  seriesId?: string;
}

export interface Tool {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  officialUrl: string;
  features: string[];
}
