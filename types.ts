export enum ModelTier {
  FAST = 'fast',
  BALANCED = 'balanced',
  COMPLEX = 'complex',
  CREATIVE = 'creative'
}

export enum AppMode {
  RESEARCH = 'research',
  MEDIA = 'media',
  CHAT = 'chat',
  LIVE = 'live'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface ResearchResult {
  markdown: string;
  groundingChunks: GroundingChunk[];
  themeColor?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SearchOptions {
  dateRange?: { start?: string; end?: string };
  pubType?: string;
  excludeKeywords?: string;
  sortBy?: 'relevance' | 'date';
}

export type ThemePreset = 'default' | 'minimalist' | 'futuristic' | 'classic' | 'custom';

export interface SavedSearch {
  id: string;
  query: string;
  options: SearchOptions;
  timestamp: number;
}

export interface CustomTheme {
  primaryColor: string;
  fontFamily: string;
  backgroundColor: string;
  accentColor: string;
  linkColor: string;
  borderRadius: string; // '0px', '8px', '24px'
}
