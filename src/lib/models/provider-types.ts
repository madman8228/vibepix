export type AvatarAnalysis = {
  summary: string;
  vibeTags: string[];
};

export type AvatarAnalysisInput = {
  sourceUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export interface ImageUnderstandingProvider {
  analyzeAvatar(input: AvatarAnalysisInput): Promise<AvatarAnalysis>;
}
