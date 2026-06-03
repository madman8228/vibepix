import type { AvatarAnalysis, PlayResult, PlayType } from "../types";

export type ComplianceCheckResult =
  | {
      status: "approved";
    }
  | {
      status: "blocked";
      reason: string;
    };

export type AvatarInspectionInput = {
  sourceUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
};

export type AvatarInspectionResult = {
  compliance: ComplianceCheckResult;
  analysis: AvatarAnalysis | null;
};

export interface AvatarIntelligenceProvider {
  inspectAvatar(input: AvatarInspectionInput): Promise<AvatarInspectionResult>;
  executePlay(input: {
    uploadId: string;
    playType: PlayType;
    analysis: AvatarAnalysis;
    now: Date;
  }): Promise<PlayResult>;
}
