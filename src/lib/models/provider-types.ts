export type AvatarAnalysis = {
  summary: string;
  vibeTags: string[];
};

export type AvatarAnalysisInput = {
  fileName?: string | null;
  sourceUrl?: string | null;
  mimeType?: string | null;
};

export interface ImageUnderstandingProvider {
  analyzeAvatar(input: AvatarAnalysisInput): Promise<AvatarAnalysis>;
}
