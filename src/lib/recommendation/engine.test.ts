import { describe, expect, it } from "vitest";

import { buildRecommendations } from "./engine";

describe("buildRecommendations", () => {
  it("returns style, mode, and gameplay groups from analysis tags", () => {
    const result = buildRecommendations({
      vibeTags: ["gentle", "student", "portrait"],
      tierKey: "free",
    });

    expect(result.styles.length).toBeGreaterThan(0);
    expect(result.modes.length).toBeGreaterThan(0);
    expect(result.gameplay.length).toBeGreaterThan(0);
  });
});
