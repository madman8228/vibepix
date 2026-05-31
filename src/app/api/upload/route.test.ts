import { afterEach, describe, expect, it } from "vitest";

import { db } from "../../../lib/db";
import { POST } from "./route";

const createdUploadIds: string[] = [];

describe("POST /api/upload", () => {
  afterEach(async () => {
    if (createdUploadIds.length === 0) {
      return;
    }

    await db.upload.deleteMany({
      where: {
        id: {
          in: createdUploadIds.splice(0, createdUploadIds.length),
        },
      },
    });
  });

  it("creates an upload session when the payload includes a sourceUrl", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sourceUrl: "https://example.com/avatar.jpg",
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
        summary: "Warm portrait with a calm, approachable feeling.",
        vibeTags: ["gentle", "portrait", "friendly"],
      },
    });
  });

  it("rejects a fileName-only upload payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fileName: "avatar.jpg",
        }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects an empty upload payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
  });
});
