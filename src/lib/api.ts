import type { AvatarAnalysis } from "./models/provider-types";
import type {
  RecommendationResult,
  RecommendationSelectionState,
  TierKey,
} from "./types";

type ApiErrorShape = {
  error?: string;
};

export type UploadResponse = {
  uploadSessionId: string;
  analysis: AvatarAnalysis;
};

export type RecommendationResponse = {
  recommendationId: string;
  uploadSessionId: string;
  analysis: AvatarAnalysis;
  recommendations: RecommendationResult;
} & RecommendationSelectionState;

export type RecommendationSelectionResponse = {
  recommendationId: string;
} & RecommendationSelectionState;

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

export async function updateRecommendationSelection(
  recommendationId: string,
  selection: RecommendationSelectionState,
): Promise<RecommendationSelectionResponse> {
  const response = await fetch("/api/recommend", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      recommendationId,
      ...selection,
    }),
  });

  return parseApiResponse<RecommendationSelectionResponse>(
    response,
    "Selection update failed. Please try again.",
  );
}
