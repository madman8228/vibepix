import { describe, expect, it } from "vitest";

import { buildRecommendations } from "./engine";

describe("buildRecommendations", () => {
  it("matches tags and keeps tie ordering stable by sortOrder for free tier recommendations", () => {
    const result = buildRecommendations({
      vibeTags: ["gentle", "student", "portrait"],
      tierKey: "free",
    });

    expect(result.styles.map((item) => item.id)).toEqual([
      "storybook-pastel",
      "campus-anime",
    ]);
    expect(result.modes.map((item) => item.id)).toEqual([
      "single-scene",
      "day-in-the-life",
    ]);
    expect(result.gameplay.map((item) => item.id)).toEqual([
      "slice-of-life",
      "study-buddy-quest",
    ]);
  });

  it("filters out plus-only catalog items when the tier is free", () => {
    const result = buildRecommendations({
      vibeTags: ["dramatic", "heroic", "portrait"],
      tierKey: "free",
    });

    expect(result.styles.map((item) => item.id)).not.toContain("cinematic-ink");
    expect(result.modes.map((item) => item.id)).not.toContain("mini-arc");
    expect(result.gameplay.map((item) => item.id)).not.toContain("mystery-route");
  });

  it("orders plus-tier recommendations by tag score before sortOrder", () => {
    const result = buildRecommendations({
      vibeTags: ["dramatic", "heroic", "portrait"],
      tierKey: "plus",
    });

    expect(result.styles.map((item) => item.id)).toEqual([
      "cinematic-ink",
      "storybook-pastel",
      "campus-anime",
    ]);
    expect(result.modes.map((item) => item.id)).toEqual([
      "mini-arc",
      "single-scene",
      "day-in-the-life",
    ]);
    expect(result.gameplay.map((item) => item.id)).toEqual([
      "mystery-route",
      "slice-of-life",
      "study-buddy-quest",
    ]);
  });
});
