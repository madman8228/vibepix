import type { RecommendationGroup } from "../types";

export const defaultGameplay: RecommendationGroup[] = [
  {
    id: "slice-of-life",
    title: "Slice of Life",
    description: "Small personal moments built around comfort and warmth.",
    reason: "A safe match for gentle vibes and soft portrait analysis.",
    tags: ["gentle", "student", "cozy"],
    tierKeys: ["free", "plus"],
    sortOrder: 1,
  },
  {
    id: "study-buddy-quest",
    title: "Study Buddy Quest",
    description: "Light progression framed as classes, goals, and teamwork.",
    reason: "Keeps the student theme while adding playful direction.",
    tags: ["student", "playful", "daily-life"],
    tierKeys: ["free", "plus"],
    sortOrder: 2,
  },
  {
    id: "mystery-route",
    title: "Mystery Route",
    description: "A more cinematic branch with clues and dramatic reveals.",
    reason: "Best saved for richer multi-panel generation paths.",
    tags: ["dramatic", "mystery", "heroic"],
    tierKeys: ["plus"],
    sortOrder: 3,
  },
];
