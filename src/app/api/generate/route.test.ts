import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { CatalogKind } from "@prisma/client";

import { db } from "../../../lib/db";
import { defaultGameplay } from "../../../lib/catalog/default-gameplay";
import { defaultModes } from "../../../lib/catalog/default-modes";
import { defaultStyles } from "../../../lib/catalog/default-styles";
import {
  getGenerationJob,
  prepareGenerationArtifacts,
} from "../../../lib/orchestration/pipeline";
import { POST } from "./route";

const uploadId = "generate-upload-session";
const tierKey = "free";
const tierName = "Free";
const recommendationId = "generate-recommendation";
const selectedKeys = {
  selectedStyleKey: "campus-anime",
  selectedModeKey: "day-in-the-life",
  selectedGameplayKey: "study-buddy-quest",
};

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

describe("POST /api/generate", () => {
  beforeAll(async () => {
    await db.tier.upsert({
      where: { key: tierKey },
      update: {
        name: tierName,
        maxPanels: 1,
        monthlyQuota: 5,
      },
      create: {
        key: tierKey,
        name: tierName,
        maxPanels: 1,
        monthlyQuota: 5,
      },
    });

    await db.upload.upsert({
      where: { id: uploadId },
      update: {
        sourceUrl: "https://example.com/avatar.jpg",
        analysisSummary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: JSON.stringify(["gentle", "portrait", "friendly"]),
      },
      create: {
        id: uploadId,
        sourceUrl: "https://example.com/avatar.jpg",
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
        selectedStyleKey: "storybook-pastel",
        selectedModeKey: "single-scene",
        selectedGameplayKey: "slice-of-life",
      },
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

  it("creates a running generation job from a recommendation and selected keys", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          recommendationId,
          ...selectedKeys,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(202);

    const payload = await response.json();

    expect(payload).toMatchObject({
      jobId: expect.any(String),
      status: "RUNNING",
      redirectTo: expect.stringMatching(/^\/generate\//),
    });

    await expect(
      db.recommendation.findUniqueOrThrow({
        where: { id: recommendationId },
        select: {
          selectedStyleKey: true,
          selectedModeKey: true,
          selectedGameplayKey: true,
        },
      }),
    ).resolves.toMatchObject(selectedKeys);

    await expect(
      db.job.findUniqueOrThrow({
        where: { id: payload.jobId as string },
        select: {
          recommendationId: true,
          panelCount: true,
          status: true,
          outputSummary: true,
        },
      }),
    ).resolves.toMatchObject({
      recommendationId,
      panelCount: 1,
      status: "RUNNING",
      outputSummary: expect.stringContaining("Study Buddy Quest"),
    });

    await expect(
      db.work.findMany({
        where: {
          jobId: payload.jobId as string,
        },
        orderBy: {
          panelIndex: "asc",
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
        },
      }),
    ).resolves.toEqual([
      {
        id: `${payload.jobId as string}_panel_1`,
        title: "Panel 1",
        imageUrl: expect.stringMatching(/^data:image\/svg\+xml/),
      },
    ]);
  });

  it("returns the canonical generated result contract once the running job is ready", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          recommendationId,
          ...selectedKeys,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(202);

    const payload = await response.json();
    const jobId = payload.jobId as string;

    await db.job.update({
      where: { id: jobId },
      data: {
        createdAt: new Date(Date.now() - 5_000),
      },
    });

    const expected = prepareGenerationArtifacts({
      jobId,
      analysis: {
        summary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: ["gentle", "portrait", "friendly"],
      },
      selection: {
        style: defaultStyles[1],
        mode: defaultModes[1],
        gameplay: defaultGameplay[1],
      },
      panelCount: 1,
    }).result;

    await expect(getGenerationJob(jobId)).resolves.toMatchObject({
      jobId,
      status: "SUCCEEDED",
      result: expected,
      errorMessage: null,
    });
  });

  it("rejects generation requests that pick keys outside the recommendation set", async () => {
    const response = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          recommendationId,
          selectedStyleKey: "not-in-set",
          selectedModeKey: selectedKeys.selectedModeKey,
          selectedGameplayKey: selectedKeys.selectedGameplayKey,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "Selection is not valid for this recommendation.",
    });
  });
});
