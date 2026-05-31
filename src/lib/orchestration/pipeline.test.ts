import { describe, expect, it } from "vitest";

import { defaultGameplay } from "../catalog/default-gameplay";
import { defaultModes } from "../catalog/default-modes";
import { defaultStyles } from "../catalog/default-styles";
import { prepareGenerationArtifacts } from "./pipeline";

describe("prepareGenerationArtifacts", () => {
  it("builds a compact character bible, provider prompt, and deterministic mock assets", () => {
    const artifacts = prepareGenerationArtifacts({
      jobId: "job_pipeline_test",
      analysis: {
        summary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: ["gentle", "portrait", "friendly"],
      },
      selection: {
        style: defaultStyles[1],
        mode: defaultModes[1],
        gameplay: defaultGameplay[1],
      },
      panelCount: 2,
    });

    expect(artifacts.characterBible.coreSummary).toContain(
      "Warm portrait with a calm, approachable feeling.",
    );
    expect(artifacts.characterBible.signatureTraits).toEqual([
      "gentle",
      "portrait",
      "friendly",
    ]);
    expect(artifacts.intent.providerKey).toBe("mock-image-generator");
    expect(artifacts.intent.seed).toBe("job_pipeline_test");
    expect(artifacts.prompt.providerKey).toBe("mock-image-generator");
    expect(artifacts.prompt.imagePrompt).toContain("Campus Anime");
    expect(artifacts.prompt.imagePrompt).toContain("Day in the Life");
    expect(artifacts.prompt.imagePrompt).toContain("Study Buddy Quest");
    expect(artifacts.result.assets).toHaveLength(2);
    expect(artifacts.result.assets[0]).toMatchObject({
      title: "Panel 1",
      imageUrl: expect.stringMatching(/^data:image\/svg\+xml/),
      altText: expect.stringContaining("Campus Anime"),
    });
    expect(artifacts.result.summary).toContain("Day in the Life");
  });
});
