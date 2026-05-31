import type { RecommendationGroup } from "../types";

export const defaultStyles: RecommendationGroup[] = [
  {
    id: "storybook-pastel",
    title: "Storybook Pastel",
    description: "Soft watercolor styling for calm portrait-led scenes.",
    reason: "Pairs well with gentle moods and portrait-heavy uploads.",
    tags: ["gentle", "portrait", "student", "dreamy"],
    tierKeys: ["free", "plus"],
    sortOrder: 1,
  },
  {
    id: "campus-anime",
    title: "Campus Anime",
    description: "Bright character art with youthful classroom energy.",
    reason: "Good fit for student-coded uploads with expressive framing.",
    tags: ["student", "portrait", "bright", "daily-life"],
    tierKeys: ["free", "plus"],
    sortOrder: 2,
  },
  {
    id: "cinematic-ink",
    title: "Cinematic Ink",
    description: "Sharper line work for dramatic hero shots and contrast.",
    reason: "Reserved for higher tiers with more stylized story treatment.",
    tags: ["dramatic", "portrait", "heroic"],
    tierKeys: ["plus"],
    sortOrder: 3,
  },
];
