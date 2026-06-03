export const playTypes = [
  "personality_read",
  "daily_fortune",
  "social_aura",
  "style_swap",
  "new_avatar",
  "poster",
  "mood_mode",
  "story_mode",
] as const;

export type PlayType = (typeof playTypes)[number];
export type PlayCategory = "text" | "image";

export type AvatarAnalysis = {
  summary: string;
  tags: string[];
};

export type PlayDescriptor = {
  playType: PlayType;
  category: PlayCategory;
  title: string;
  description: string;
  reason: string;
  promptKey: string;
  tags: string[];
};

export type PlayRecommendationInput = {
  tags: string[];
};

export type PlayRecommendationResult = {
  recommendedPlays: PlayDescriptor[];
  availablePlays: PlayDescriptor[];
};

export type TextPlayResult = {
  kind: "text";
  playType: PlayType;
  title: string;
  summary: string;
  highlights: [string, string, string];
  suggestion: string;
  disclaimer: string;
};

export type ImagePlayResult = {
  kind: "image";
  playType: PlayType;
  title: string;
  summary: string;
  imageUrl: string;
  altText: string;
};

export type PlayResult = TextPlayResult | ImagePlayResult;
