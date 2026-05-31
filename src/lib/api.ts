import type { AvatarAnalysis } from "./models/provider-types";
import type { RecommendationResult, TierKey } from "./types";

type ApiErrorShape = {
  error?: string;
};

export type UploadResponse = {
  uploadSessionId: string;
  analysis: AvatarAnalysis;
};

export type RecommendationResponse = {
  uploadSessionId: string;
  analysis: AvatarAnalysis;
  recommendations: RecommendationResult;
};

function createLocalUploadUrl(file: File) {
  return `local-upload://${encodeURIComponent(file.name || "avatar")}`;
}

async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorShape
    | T
    | null;

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

export async function uploadAvatar(file: File): Promise<UploadResponse> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name || undefined,
      mimeType: file.type || undefined,
      sourceUrl: createLocalUploadUrl(file),
    }),
  });

  return parseApiResponse<UploadResponse>(
    response,
    "Upload failed. Please try another image.",
  );
}

export async function getRecommendations(
  uploadSessionId: string,
  tierKey: TierKey,
): Promise<RecommendationResponse> {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      uploadSessionId,
      tierKey,
    }),
  });

  return parseApiResponse<RecommendationResponse>(
    response,
    "Recommendation lookup failed. Please upload again.",
  );
}
