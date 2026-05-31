import type { RecommendationGroup } from "../types";

export const defaultModes: RecommendationGroup[] = [
  {
    id: "single-scene",
    title: "Single Scene",
    description: "One polished frame that centers the character clearly.",
    reason: "Fits free-tier output limits while preserving portrait clarity.",
    tags: ["portrait", "gentle", "focused"],
    tierKeys: ["free", "plus"],
    sortOrder: 1,
  },
  {
    id: "day-in-the-life",
    title: "Day in the Life",
    description: "A grounded slice from school or everyday routines.",
    reason: "Works well when the upload reads as youthful and approachable.",
    tags: ["student", "gentle", "daily-life"],
    tierKeys: ["free", "plus"],
    sortOrder: 2,
  },
  {
    id: "mini-arc",
    title: "Mini Arc",
    description: "A multi-beat narrative mode for stronger story progression.",
    reason: "Uses extra panel allowance available on paid tiers.",
    tags: ["dramatic", "heroic", "story"],
    tierKeys: ["plus"],
    sortOrder: 3,
  },
];
