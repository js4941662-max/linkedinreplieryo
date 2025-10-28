
export interface ErrorResponse {
  message: string;
  userMessage: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  canRetry: boolean;
  retryDelay?: number;
}
export interface GroundingChunk {
  web?: {
    // FIX: Made `uri` and `title` optional to match the type from @google/genai
    // and resolve the TypeScript error.
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface QualityCheck {
  rigor: string;
  rigorScore: string;
  valueAdd: string;
  constructiveTone: string;
}

export interface SearchFilters {
  startDate: string;
  endDate: string;
  journals: string;
}