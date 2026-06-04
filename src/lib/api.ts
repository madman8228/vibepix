import type { AvatarAnalysis, PlayDescriptor, PlayType } from "./types";
import type {
  PlayJobResponse,
  PlayRatingResponse,
  StartPlayRequest,
  StartPlayResponse,
} from "./schemas/generate";

type ApiErrorShape = {
  error?: string;
};

export type UploadResponse = {
  uploadSessionId: string;
  analysis: AvatarAnalysis;
};

export type PlayLobbyResponse = {
  uploadSessionId: string;
  analysis: AvatarAnalysis;
  recommendedPlays: PlayDescriptor[];
  availablePlays: PlayDescriptor[];
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Upload failed while preparing the selected image."));
    };

    reader.onerror = () => {
      reject(new Error("Upload failed while reading the selected image."));
    };

    reader.readAsDataURL(file);
  });
}

async function parseApiResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as ApiErrorShape | T | null;

  if (!response.ok) {
    throw new Error(
      payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
        ? payload.error
        : fallbackMessage,
    );
  }

  return payload as T;
}

// The workbench may pass either the original selected avatar or a cropped derivative.
export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const sourceUrl = await fileToDataUrl(file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name || undefined,
      mimeType: file.type || undefined,
      sourceUrl,
    }),
  });

  return parseApiResponse<UploadResponse>(
    response,
    "Upload failed. Please try another image.",
  );
}

export async function getPlayLobby(
  uploadSessionId: string,
): Promise<PlayLobbyResponse> {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ uploadSessionId }),
  });

  return parseApiResponse<PlayLobbyResponse>(
    response,
    "Play lobby failed to load. Please upload again.",
  );
}

export async function startPlay(
  request: StartPlayRequest,
): Promise<StartPlayResponse> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseApiResponse<StartPlayResponse>(
    response,
    "This play could not be started right now.",
  );
}

export async function getPlayJob(jobId: string): Promise<PlayJobResponse> {
  const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
    cache: "no-store",
  });

  return parseApiResponse<PlayJobResponse>(
    response,
    "Play result lookup failed. Please refresh and try again.",
  );
}

export async function ratePlayJob(
  jobId: string,
  score: number,
): Promise<PlayRatingResponse> {
  const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ score }),
  });

  return parseApiResponse<PlayRatingResponse>(
    response,
    "We could not save that rating right now.",
  );
}

export type { PlayType };
