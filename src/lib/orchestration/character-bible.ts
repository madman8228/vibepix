import type { AvatarAnalysis } from "../models/provider-types";
import type { RecommendationGroup } from "../types";

export type GenerationSelection = {
  style: RecommendationGroup;
  mode: RecommendationGroup;
  gameplay: RecommendationGroup;
};

export type CharacterBible = {
  coreSummary: string;
  signatureTraits: string[];
  visualDirection: string;
  storyHook: string;
};

type BuildCharacterBibleInput = {
  analysis: AvatarAnalysis;
  selection: GenerationSelection;
  panelCount: number;
};

function dedupeTraits(vibeTags: string[]) {
  return Array.from(new Set(vibeTags.map((tag) => tag.trim()).filter(Boolean)));
}

export function buildCharacterBible({
  analysis,
  selection,
  panelCount,
}: BuildCharacterBibleInput): CharacterBible {
  const signatureTraits = dedupeTraits(analysis.vibeTags).slice(0, 3);
  const coreSummary = analysis.summary.trim();
  const visualDirection = [
    selection.style.title,
    selection.mode.title,
    selection.gameplay.title,
  ].join(" | ");
  const storyHook = `Build ${panelCount} polished panel${
    panelCount === 1 ? "" : "s"
  } around ${selection.gameplay.title} with ${selection.mode.title.toLowerCase()} pacing and ${selection.style.title.toLowerCase()} styling.`;

  return {
    coreSummary,
    signatureTraits,
    visualDirection,
    storyHook,
  };
}
