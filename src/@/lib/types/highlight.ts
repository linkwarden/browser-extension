// Highlight type definitions for browser extension

export interface Highlight {
  id: number;
  color: 'yellow' | 'red' | 'blue' | 'green';
  comment?: string | null;
  linkId: number;
  userId: number;
  startOffset: number;
  endOffset: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightCreateData {
  color: string;
  comment?: string | null;
  startOffset: number;
  endOffset: number;
  text: string;
  linkId: number;
}

export interface LinkWithHighlights {
  id: number;
  name: string;
  url: string;
  description: string;
  collectionId: number;
  highlight?: Highlight[];
}

export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green';

export const HIGHLIGHT_COLORS: HighlightColor[] = ['yellow', 'red', 'blue', 'green'];

export const HIGHLIGHT_COLOR_CLASSES: Record<HighlightColor, { bg: string; border: string }> = {
  yellow: { bg: 'lw-highlight-yellow', border: 'lw-border-yellow' },
  red: { bg: 'lw-highlight-red', border: 'lw-border-red' },
  blue: { bg: 'lw-highlight-blue', border: 'lw-border-blue' },
  green: { bg: 'lw-highlight-green', border: 'lw-border-green' },
};
