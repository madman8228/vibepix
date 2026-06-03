import { describe, expect, it } from "vitest";

import { buildPlayRecommendations } from "./engine";

describe("buildPlayRecommendations", () => {
  it("returns five plays with one text play and four image plays", () => {
    const result = buildPlayRecommendations({
      tags: ["bright", "friendly", "upbeat"],
    });

    expect(result.recommendedPlays).toHaveLength(5);
    expect(result.availablePlays).toHaveLength(8);
    expect(
      result.recommendedPlays.filter((play) => play.category === "text"),
    ).toHaveLength(1);
    expect(
      result.recommendedPlays.filter((play) => play.category === "image"),
    ).toHaveLength(4);
  });
});
