import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../../lib/db";
import { GET, PATCH } from "../jobs/[jobId]/route";
import { POST } from "./route";

const uploadId = "play-execution-upload";

function buildRouteContext(jobId: string) {
  return {
    params: Promise.resolve({
      jobId,
    }),
  };
}

describe("play execution routes", () => {
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
    await db.work.deleteMany({
      where: {
        job: {
          uploadId,
        },
      },
    });
    await db.job.deleteMany({
      where: { uploadId },
    });
  });

  afterAll(async () => {
    await db.work.deleteMany({
      where: {
        job: {
          uploadId,
        },
      },
    });
    await db.job.deleteMany({
      where: { uploadId },
    });
    await db.upload.deleteMany({
      where: { id: uploadId },
    });
  });

  it("starts a text play and returns a single structured result with optional rating", async () => {
    const startResponse = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: uploadId,
          playType: "personality_read",
        }),
      }),
    );

    expect(startResponse.status).toBe(202);

    const { jobId } = await startResponse.json();
    expect(jobId).toEqual(expect.any(String));

    await db.job.update({
      where: { id: jobId },
      data: {
        createdAt: new Date(Date.now() - 5_000),
      },
    });

    const resultResponse = await GET(
      new Request(`http://localhost/api/jobs/${jobId}`),
      buildRouteContext(jobId),
    );

    expect(resultResponse.status).toBe(200);

    await expect(resultResponse.json()).resolves.toMatchObject({
      jobId,
      playType: "personality_read",
      result: {
        kind: "text",
        title: expect.any(String),
        summary: expect.any(String),
        highlights: [expect.any(String), expect.any(String), expect.any(String)],
        suggestion: expect.any(String),
        disclaimer: expect.any(String),
      },
      rating: {
        score: null,
      },
    });
  });

  it("keeps daily fortune stable for the same upload on the same day", async () => {
    const firstResponse = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: uploadId,
          playType: "daily_fortune",
        }),
      }),
    );
    const secondResponse = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: uploadId,
          playType: "daily_fortune",
        }),
      }),
    );

    const firstJob = await firstResponse.json();
    const secondJob = await secondResponse.json();

    await db.job.updateMany({
      where: {
        id: {
          in: [firstJob.jobId, secondJob.jobId],
        },
      },
      data: {
        createdAt: new Date(Date.now() - 5_000),
      },
    });

    const firstResult = await (
      await GET(
        new Request(`http://localhost/api/jobs/${firstJob.jobId}`),
        buildRouteContext(firstJob.jobId),
      )
    ).json();
    const secondResult = await (
      await GET(
        new Request(`http://localhost/api/jobs/${secondJob.jobId}`),
        buildRouteContext(secondJob.jobId),
      )
    ).json();

    expect(firstResult.result).toMatchObject(secondResult.result);
  });

  it("stores optional half-star ratings for single play results", async () => {
    const startResponse = await POST(
      new Request("http://localhost/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          uploadSessionId: uploadId,
          playType: "poster",
        }),
      }),
    );

    const { jobId } = await startResponse.json();

    const ratingResponse = await PATCH(
      new Request(`http://localhost/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          score: 4.5,
        }),
      }),
      buildRouteContext(jobId),
    );

    expect(ratingResponse.status).toBe(200);
    await expect(ratingResponse.json()).resolves.toMatchObject({
      jobId,
      rating: {
        score: 4.5,
      },
    });
  });
});
