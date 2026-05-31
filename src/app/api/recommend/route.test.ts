import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { db } from "../../../lib/db";
import { PATCH, POST } from "./route";

const uploadId = "test-session";
const missingSourceUploadId = "test-session-missing-source";
const tierKey = "free";
const updatedSelection = {
  selectedStyleKey: "campus-anime",
  selectedModeKey: "day-in-the-life",
  selectedGameplayKey: "study-buddy-quest",
};

let tierId: string;

describe("POST /api/recommend", () => {
  beforeAll(async () => {
    const tier = await db.tier.upsert({
      where: { key: tierKey },
      update: {
        name: "Free",
        maxPanels: 1,
        monthlyQuota: 5,
      },
      create: {
        key: tierKey,
        name: "Free",
        maxPanels: 1,
        monthlyQuota: 5,
      },
    });
    tierId = tier.id;

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

    await db.upload.upsert({
      where: { id: missingSourceUploadId },
      update: {
        sourceUrl: "",
        analysisSummary: null,
        vibeTags: null,
      },
      create: {
        id: missingSourceUploadId,
        sourceUrl: "",
      },
    });
  });

  beforeEach(async () => {
    await db.recommendation.deleteMany({
      where: { uploadId },
    });
  });

  afterAll(async () => {
    await db.recommendation.deleteMany({
      where: { uploadId },
    });

    await db.upload.deleteMany({
      where: {
        id: {
          in: [uploadId, missingSourceUploadId],
        },
      },
    });
  });

  it("returns analysis and recommended choices for an upload session", async () => {
    const response = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({ uploadSessionId: uploadId, tierKey }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toMatchObject({
      recommendationId: expect.any(String),
      uploadSessionId: uploadId,
      analysis: {
        summary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: ["gentle", "portrait", "friendly"],
      },
      recommendations: {
        styles: expect.any(Array),
        modes: expect.any(Array),
        gameplay: expect.any(Array),
      },
      selectedStyleKey: "storybook-pastel",
      selectedModeKey: "single-scene",
      selectedGameplayKey: "slice-of-life",
    });
  });

  it("reuses the same recommendation row across repeated loads", async () => {
    const firstResponse = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({ uploadSessionId: uploadId, tierKey }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    const secondResponse = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({ uploadSessionId: uploadId, tierKey }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const firstJson = await firstResponse.json();
    const secondJson = await secondResponse.json();

    expect(secondJson.recommendationId).toBe(firstJson.recommendationId);

    await expect(
      db.recommendation.count({
        where: {
          uploadId,
          tierId,
        },
      }),
    ).resolves.toBe(1);
  });

  it("enforces one recommendation row per upload and tier at the database layer", async () => {
    await db.recommendation.create({
      data: {
        uploadId,
        tierId,
        styleKeys: JSON.stringify(["storybook-pastel"]),
        modeKeys: JSON.stringify(["single-scene"]),
        gameplayKeys: JSON.stringify(["slice-of-life"]),
        selectedStyleKey: "storybook-pastel",
        selectedModeKey: "single-scene",
        selectedGameplayKey: "slice-of-life",
      },
    });

    await expect(
      db.recommendation.create({
        data: {
          uploadId,
          tierId,
          styleKeys: JSON.stringify(["campus-anime"]),
          modeKeys: JSON.stringify(["day-in-the-life"]),
          gameplayKeys: JSON.stringify(["study-buddy-quest"]),
          selectedStyleKey: "campus-anime",
          selectedModeKey: "day-in-the-life",
          selectedGameplayKey: "study-buddy-quest",
        },
      }),
    ).rejects.toThrow();
  });

  it("persists selected keys and returns them on later loads", async () => {
    const initialResponse = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({ uploadSessionId: uploadId, tierKey }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(initialResponse.status).toBe(200);

    const initialJson = await initialResponse.json();

    const updateResponse = await PATCH(
      new Request("http://localhost/api/recommend", {
        method: "PATCH",
        body: JSON.stringify({
          recommendationId: initialJson.recommendationId,
          ...updatedSelection,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject(updatedSelection);

    const reloadResponse = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({ uploadSessionId: uploadId, tierKey }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(reloadResponse.status).toBe(200);
    await expect(reloadResponse.json()).resolves.toMatchObject(updatedSelection);
  });

  it("rejects legacy upload sessions that do not have a usable sourceUrl", async () => {
    const response = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        body: JSON.stringify({
          uploadSessionId: missingSourceUploadId,
          tierKey,
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(409);

    await expect(response.json()).resolves.toMatchObject({
      error: "Upload session is missing a usable sourceUrl.",
    });
  });
});
