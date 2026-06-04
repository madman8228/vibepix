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
        summary: "这张头像反差感比较强，第一眼会让人觉得有气场，也带一点主角感。",
        tags: ["戏剧感", "自信", "主角感"],
      },
    };
  }

  if (normalized.includes("happy") || normalized.includes("bright")) {
    return {
      compliance: { status: "approved" },
      analysis: {
        summary: "这张头像整体偏明亮轻快，给人的感觉亲近、好接近，也有一点轻松的活力。",
        tags: ["明亮", "亲近", "轻快"],
      },
    };
  }

  return {
    compliance: { status: "approved" },
    analysis: {
      summary: "这张头像的气质偏温和安静，第一眼让人觉得舒服，也比较容易产生好感。",
      tags: ["温和", "安静", "亲近"],
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
