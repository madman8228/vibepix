export const tierKeys = ["free", "plus"] as const;

export type TierKey = (typeof tierKeys)[number];

export type RecommendationGroup = {
  key: string;
  title: string;
  description: string;
  reason: string;
  tags: string[];
  tierKeys: TierKey[];
  sortOrder: number;
  previewImageUrl?: string;
};

export type RecommendationInput = {
  vibeTags: string[];
  tierKey: TierKey;
};

export type RecommendationSelectionState = {
  selectedStyleKey: string | null;
  selectedModeKey: string | null;
  selectedGameplayKey: string | null;
};

export type RecommendationResult = {
  styles: RecommendationGroup[];
  modes: RecommendationGroup[];
  gameplay: RecommendationGroup[];
};
