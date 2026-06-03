import { afterEach, describe, expect, it } from "vitest";

import { db } from "../../../lib/db";
import { POST } from "./route";

const createdUploadIds: string[] = [];

describe("POST /api/upload", () => {
  afterEach(async () => {
    if (createdUploadIds.length === 0) {
      return;
    }

    await db.job.deleteMany({
      where: {
        uploadId: {
          in: createdUploadIds,
        },
      },
    });
    await db.upload.deleteMany({
      where: {
        id: {
          in: createdUploadIds.splice(0, createdUploadIds.length),
        },
      },
    });
  });

  it("creates a compliant upload session with analysis summary and tags", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceUrl: "https://example.com/avatar-happy.jpg",
          mimeType: "image/jpeg",
        }),
      }),
    );

    expect(response.status).toBe(200);

    const json = await response.json();
    createdUploadIds.push(json.uploadSessionId);

    expect(json).toMatchObject({
      uploadSessionId: expect.any(String),
      analysis: {
        summary: expect.any(String),
        tags: expect.any(Array),
      },
    });
  });

  it("blocks uploads that fail image compliance", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceUrl: "https://example.com/avatar-unsafe.jpg",
          mimeType: "image/jpeg",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: "This image has a compliance issue and cannot be processed.",
    });
  });
});
