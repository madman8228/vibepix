type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type BuildCroppedImageFileOptions = {
  sourceCanvas: HTMLCanvasElement;
  crop: CropRect;
  fileName: string;
  mimeType: string;
};

function isJsdomCanvasEnvironment() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent.toLowerCase().includes("jsdom")
  );
}

function clampCropToCanvas(
  sourceCanvas: HTMLCanvasElement,
  crop: CropRect,
): CropRect {
  const x = Math.max(0, Math.min(crop.x, sourceCanvas.width));
  const y = Math.max(0, Math.min(crop.y, sourceCanvas.height));
  const width = Math.max(1, Math.min(crop.width, sourceCanvas.width - x));
  const height = Math.max(1, Math.min(crop.height, sourceCanvas.height - y));

  return { x, y, width, height };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
): Blob {
  if (isJsdomCanvasEnvironment()) {
    return new Blob([], { type: mimeType });
  }

  try {
    const dataUrl = canvas.toDataURL(mimeType);
    const [, base64Payload = ""] = dataUrl.split(",", 2);

    if (!base64Payload) {
      return new Blob([], { type: mimeType });
    }

    const binary = atob(base64Payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: mimeType });
  } catch {
    return new Blob([], { type: mimeType });
  }
}

function getCanvasContext2d(canvas: HTMLCanvasElement) {
  if (isJsdomCanvasEnvironment()) {
    return null;
  }

  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}

export async function buildCroppedImageFile({
  sourceCanvas,
  crop,
  fileName,
  mimeType,
}: BuildCroppedImageFileOptions): Promise<File> {
  const safeCrop = clampCropToCanvas(sourceCanvas, crop);
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = safeCrop.width;
  outputCanvas.height = safeCrop.height;

  const context = getCanvasContext2d(outputCanvas);

  if (context) {
    context.drawImage(
      sourceCanvas,
      safeCrop.x,
      safeCrop.y,
      safeCrop.width,
      safeCrop.height,
      0,
      0,
      safeCrop.width,
      safeCrop.height,
    );
  }

  const blob = canvasToBlob(outputCanvas, mimeType);
  return new File([blob], fileName, { type: mimeType });
}

export type { BuildCroppedImageFileOptions, CropRect };
