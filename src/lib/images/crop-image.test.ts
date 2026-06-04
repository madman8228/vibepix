// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { buildCroppedImageFile } from "./crop-image";

describe("buildCroppedImageFile", () => {
  it("returns a new file for the selected freeform crop", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 120;

    const file = await buildCroppedImageFile({
      sourceCanvas: canvas,
      crop: { x: 20, y: 10, width: 100, height: 60 },
      fileName: "avatar.png",
      mimeType: "image/png",
    });

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("avatar.png");
    expect(file.type).toBe("image/png");
  });
});
