// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCroppedImageFile } from "./crop-image";

describe("buildCroppedImageFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("clamps an out-of-bounds crop back into the source canvas before drawing", async () => {
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = 200;
    sourceCanvas.height = 120;

    const drawImage = vi.fn();
    const outputCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toDataURL: vi.fn(() => "data:image/png;base64,"),
    } as unknown as HTMLCanvasElement;

    const createElementSpy = vi.spyOn(document, "createElement");
    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return outputCanvas;
      }

      return document.createElement(tagName);
    });

    await buildCroppedImageFile({
      sourceCanvas,
      crop: { x: 250, y: 160, width: 50, height: 40 },
      fileName: "avatar.png",
      mimeType: "image/png",
    });

    expect(drawImage).toHaveBeenCalledWith(
      sourceCanvas,
      199,
      119,
      1,
      1,
      0,
      0,
      1,
      1,
    );
  });
});
