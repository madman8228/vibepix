import { buildPlayResult } from "../orchestration/pipeline";
import type { AvatarIntelligenceProvider, AvatarInspectionInput, AvatarInspectionResult } from "./provider-types";

function normalizeSource(input: AvatarInspectionInput) {
  return [input.sourceUrl, input.fileName, input.mimeType]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildAnalysis(input: AvatarInspectionInput): AvatarInspectionResult {
  const normalized = normalizeSource(input);

  if (normalized.includes("unsafe") || normalized.includes("blocked") || normalized.includes("banned")) {
    return {
      compliance: {
        status: "blocked",
        reason: "This image has a compliance issue and cannot be processed.",
      },
      analysis: null,
    };
  }

  if (normalized.includes("dramatic")) {
    return {
      compliance: { status: "approved" },
      analysis: {
        summary: "Bold portrait with dramatic contrast and a high-energy first impression.",
        tags: ["dramatic", "bold", "heroic"],
      },
    };
  }

  if (normalized.includes("happy") || normalized.includes("bright")) {
    return {
      compliance: { status: "approved" },
      analysis: {
        summary: "Bright and upbeat portrait with a friendly social vibe.",
        tags: ["bright", "friendly", "upbeat"],
      },
    };
  }

  return {
    compliance: { status: "approved" },
    analysis: {
      summary: "Warm portrait with calm energy and an approachable first impression.",
      tags: ["warm", "gentle", "friendly"],
    },
  };
}

export const mockAvatarIntelligenceProvider: AvatarIntelligenceProvider = {
  async inspectAvatar(input) {
    return buildAnalysis(input);
  },
  async executePlay(input) {
    return buildPlayResult(input);
  },
};
