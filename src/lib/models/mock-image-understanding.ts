import type {
  AvatarAnalysis,
  AvatarAnalysisInput,
  ImageUnderstandingProvider,
} from "./provider-types";

const defaultAnalysis: AvatarAnalysis = {
  summary: "Warm portrait with a calm, approachable feeling.",
  vibeTags: ["gentle", "portrait", "friendly"],
};

function buildDeterministicAnalysis(
  input: AvatarAnalysisInput,
): AvatarAnalysis {
  const normalizedSource = [
    input.sourceUrl?.toLowerCase(),
    input.fileName?.toLowerCase(),
    input.mimeType?.toLowerCase(),
  ]
    .filter(Boolean)
    .join(" ");

  if (normalizedSource.includes("dramatic")) {
    return {
      summary: "Bold portrait with a dramatic, cinematic energy.",
      vibeTags: ["dramatic", "heroic", "portrait"],
    };
  }

  return defaultAnalysis;
}

export const mockImageUnderstandingProvider: ImageUnderstandingProvider = {
  async analyzeAvatar(input) {
    return buildDeterministicAnalysis(input);
  },
};
