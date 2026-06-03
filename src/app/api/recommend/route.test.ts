import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../../lib/db";
import { POST } from "./route";

const uploadId = "play-lobby-upload";

describe("POST /api/recommend", () => {
  beforeAll(async () => {
    await db.upload.upsert({
      where: { id: uploadId },
      update: {
        sourceUrl: "https://example.com/avatar-happy.jpg",
        analysisSummary: "Bright and upbeat portrait with a friendly social vibe.",
        vibeTags: JSON.stringify(["bright", "friendly", "upbeat"]),
        complianceStatus: "APPROVED",
      },
      create: {
        id: uploadId,
        sourceUrl: "https://example.com/avatar-happy.jpg",
        analysisSummary: "Bright and upbeat portrait with a friendly social vibe.",
        vibeTags: JSON.stringify(["bright", "friendly", "upbeat"]),
        complianceStatus: "APPROVED",
      },
    });
  });

  beforeEach(async () => {
    await db.job.deleteMany({
      where: { uploadId },
    });
  });

  afterAll(async () => {
    await db.job.deleteMany({
      where: { uploadId },
    });
    await db.upload.deleteMany({
      where: { id: uploadId },
    });
  });

  it("returns visible analysis, five recommended plays, and all available plays", async () => {
    const response = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: uploadId,
        }),
      }),
    );

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.analysis).toMatchObject({
      summary: expect.any(String),
      tags: expect.any(Array),
    });
    expect(json.recommendedPlays).toHaveLength(5);
    expect(json.availablePlays).toHaveLength(8);
    expect(
      json.recommendedPlays.filter((play: { category: string }) => play.category === "text"),
    ).toHaveLength(1);
    expect(
      json.recommendedPlays.filter((play: { category: string }) => play.category === "image"),
    ).toHaveLength(4);
  });

  it("rejects blocked uploads before showing the play lobby", async () => {
    const blockedUploadId = "blocked-play-lobby-upload";

    await db.upload.upsert({
      where: { id: blockedUploadId },
      update: {
        sourceUrl: "https://example.com/avatar-unsafe.jpg",
        complianceStatus: "BLOCKED",
        blockedReason: "This image has a compliance issue and cannot be processed.",
      },
      create: {
        id: blockedUploadId,
        sourceUrl: "https://example.com/avatar-unsafe.jpg",
        complianceStatus: "BLOCKED",
        blockedReason: "This image has a compliance issue and cannot be processed.",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/recommend", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: blockedUploadId,
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "This image has a compliance issue and cannot be processed.",
    });

    await db.upload.deleteMany({
      where: { id: blockedUploadId },
    });
  });
});
