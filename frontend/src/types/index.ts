export interface Page {
  index: number;
  title: string;
  code: string;
}

export interface Workbook {
  pages: Page[];
  brandKit: BrandKit;
}

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  logoUrl?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  pageIndex?: number;
}