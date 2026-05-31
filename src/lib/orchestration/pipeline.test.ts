import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { CatalogKind, JobStatus, WorkKind } from "@prisma/client";

import { defaultGameplay } from "../catalog/default-gameplay";
import { defaultModes } from "../catalog/default-modes";
import { defaultStyles } from "../catalog/default-styles";
import { db } from "../db";
import {
  getGenerationJob,
  prepareGenerationArtifacts,
} from "./pipeline";

const uploadId = "pipeline-test-upload";
const tierKey = "pipeline-test-free";
const recommendationId = "pipeline-test-recommendation";

function toCatalogSeedData(
  kind: CatalogKind,
  item: {
    key: string;
    title: string;
    description: string;
    reason: string;
    tags: string[];
    tierKeys: string[];
    sortOrder: number;
    previewImageUrl?: string;
  },
) {
  return {
    kind,
    key: item.key,
    title: item.title,
    description: item.description,
    reason: item.reason,
    previewImageUrl: item.previewImageUrl ?? null,
    tags: JSON.stringify(item.tags),
    tierKeys: JSON.stringify(item.tierKeys),
    sortOrder: item.sortOrder,
    isActive: true,
  };
}

describe("prepareGenerationArtifacts", () => {
  beforeAll(async () => {
    await db.tier.upsert({
      where: { key: tierKey },
      update: {
        name: "Pipeline Test Free",
        maxPanels: 1,
        monthlyQuota: 5,
      },
      create: {
        key: tierKey,
        name: "Pipeline Test Free",
        maxPanels: 1,
        monthlyQuota: 5,
      },
    });

    await db.upload.upsert({
      where: { id: uploadId },
      update: {
        sourceUrl: "https://example.com/pipeline-avatar.jpg",
        analysisSummary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: JSON.stringify(["gentle", "portrait", "friendly"]),
      },
      create: {
        id: uploadId,
        sourceUrl: "https://example.com/pipeline-avatar.jpg",
        analysisSummary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: JSON.stringify(["gentle", "portrait", "friendly"]),
      },
    });

    for (const item of defaultStyles) {
      await db.catalogItem.upsert({
        where: { key: item.key },
        update: toCatalogSeedData(CatalogKind.STYLE, item),
        create: toCatalogSeedData(CatalogKind.STYLE, item),
      });
    }

    for (const item of defaultModes) {
      await db.catalogItem.upsert({
        where: { key: item.key },
        update: toCatalogSeedData(CatalogKind.MODE, item),
        create: toCatalogSeedData(CatalogKind.MODE, item),
      });
    }

    for (const item of defaultGameplay) {
      await db.catalogItem.upsert({
        where: { key: item.key },
        update: toCatalogSeedData(CatalogKind.GAMEPLAY, item),
        create: toCatalogSeedData(CatalogKind.GAMEPLAY, item),
      });
    }
  });

  beforeEach(async () => {
    await db.work.deleteMany({
      where: {
        job: {
          recommendationId,
        },
      },
    });
    await db.job.deleteMany({
      where: { recommendationId },
    });
    await db.recommendation.deleteMany({
      where: { id: recommendationId },
    });
  });

  afterAll(async () => {
    await db.work.deleteMany({
      where: {
        job: {
          recommendationId,
        },
      },
    });
    await db.job.deleteMany({
      where: { recommendationId },
    });
    await db.recommendation.deleteMany({
      where: { id: recommendationId },
    });
    await db.upload.deleteMany({
      where: { id: uploadId },
    });
  });

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

  it("marks stale running jobs without persisted result assets as failed", async () => {
    const tier = await db.tier.findUniqueOrThrow({
      where: { key: tierKey },
    });

    await db.recommendation.create({
      data: {
        id: recommendationId,
        uploadId,
        tierId: tier.id,
        styleKeys: JSON.stringify(defaultStyles.map((item) => item.key)),
        modeKeys: JSON.stringify(defaultModes.map((item) => item.key)),
        gameplayKeys: JSON.stringify(defaultGameplay.map((item) => item.key)),
        selectedStyleKey: "campus-anime",
        selectedModeKey: "day-in-the-life",
        selectedGameplayKey: "study-buddy-quest",
      },
    });

    const job = await db.job.create({
      data: {
        recommendationId,
        tierId: tier.id,
        panelCount: 1,
        status: JobStatus.RUNNING,
        createdAt: new Date(Date.now() - 5_000),
      },
      select: {
        id: true,
      },
    });

    await expect(getGenerationJob(job.id)).resolves.toMatchObject({
      jobId: job.id,
      status: "FAILED",
      result: null,
      errorMessage: "Generation output was incomplete. Please try again.",
    });

    await expect(
      db.job.findUniqueOrThrow({
        where: { id: job.id },
        select: {
          status: true,
          outputSummary: true,
        },
      }),
    ).resolves.toMatchObject({
      status: "FAILED",
      outputSummary: "Generation output was incomplete. Please try again.",
    });
  });

  it("keeps legacy succeeded jobs readable when altText is missing", async () => {
    const tier = await db.tier.findUniqueOrThrow({
      where: { key: tierKey },
    });

    await db.recommendation.create({
      data: {
        id: recommendationId,
        uploadId,
        tierId: tier.id,
        styleKeys: JSON.stringify(defaultStyles.map((item) => item.key)),
        modeKeys: JSON.stringify(defaultModes.map((item) => item.key)),
        gameplayKeys: JSON.stringify(defaultGameplay.map((item) => item.key)),
        selectedStyleKey: "campus-anime",
        selectedModeKey: "day-in-the-life",
        selectedGameplayKey: "study-buddy-quest",
      },
    });

    const job = await db.job.create({
      data: {
        recommendationId,
        tierId: tier.id,
        panelCount: 1,
        status: JobStatus.SUCCEEDED,
        outputSummary:
          "Day in the Life scene package for Study Buddy Quest, rendered as a Campus Anime mock set.",
        works: {
          create: {
            id: "legacy-panel-1",
            kind: WorkKind.PANEL,
            title: "Panel 1",
            imageUrl: "data:image/svg+xml;charset=UTF-8,legacy-panel",
            altText: "",
            panelIndex: 0,
          },
        },
      },
      select: {
        id: true,
      },
    });

    await expect(getGenerationJob(job.id)).resolves.toMatchObject({
      jobId: job.id,
      status: "SUCCEEDED",
      errorMessage: null,
      result: {
        assets: [
          {
            id: "legacy-panel-1",
            altText: expect.stringContaining("Campus Anime"),
          },
        ],
      },
    });
  });
});
