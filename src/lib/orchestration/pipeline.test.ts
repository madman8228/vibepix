import { describe, expect, it } from "vitest";

import { buildPlayResult } from "./pipeline";

describe("buildPlayResult", () => {
  it("builds a structured text play result", () => {
    const result = buildPlayResult({
      uploadId: "upload_1",
      playType: "social_aura",
      analysis: {
        summary: "Warm and friendly portrait with upbeat energy.",
        tags: ["friendly", "upbeat", "bright"],
      },
      now: new Date("2026-06-03T08:00:00.000Z"),
    });

    expect(result).toMatchObject({
      kind: "text",
      title: expect.any(String),
      summary: expect.any(String),
      highlights: [expect.any(String), expect.any(String), expect.any(String)],
      suggestion: expect.any(String),
      disclaimer: expect.any(String),
    });
  });

  it("builds a single deterministic image play result", () => {
    const result = buildPlayResult({
      uploadId: "upload_1",
      playType: "mood_mode",
      analysis: {
        summary: "Warm and friendly portrait with upbeat energy.",
        tags: ["friendly", "upbeat", "bright"],
      },
      now: new Date("2026-06-03T08:00:00.000Z"),
    });

    expect(result).toMatchObject({
      kind: "image",
      playType: "mood_mode",
      title: expect.any(String),
      summary: expect.any(String),
      imageUrl: expect.stringMatching(/^data:image\/svg\+xml/),
      altText: expect.any(String),
    });
  });
});
