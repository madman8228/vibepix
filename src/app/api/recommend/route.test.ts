import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "../../../lib/db";
import { POST } from "./route";

const uploadId = "test-session";
const missingSourceUploadId = "test-session-missing-source";
const tierKey = "free";

describe("POST /api/recommend", () => {
  beforeAll(async () => {
    await db.tier.upsert({
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
    });
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
