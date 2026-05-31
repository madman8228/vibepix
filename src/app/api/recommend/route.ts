import type { Recommendation } from "@prisma/client";

import { db } from "../../../lib/db";
import { getImageUnderstandingProvider } from "../../../lib/models/provider-registry";
import type { AvatarAnalysis } from "../../../lib/models/provider-types";
import { buildRecommendationsFromAnalysis } from "../../../lib/recommendation/engine";
import {
  recommendRequestSchema,
  recommendSelectionUpdateSchema,
} from "../../../lib/schemas/recommend";
import type {
  RecommendationGroup,
  RecommendationResult,
  RecommendationSelectionState,
} from "../../../lib/types";

function parseStoredStringArray(value: string | null): string[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function hasUsableSourceUrl(
  upload: {
    sourceUrl: string | null;
  },
): upload is { sourceUrl: string } {
  return typeof upload.sourceUrl === "string" && upload.sourceUrl.trim().length > 0;
}

function selectKey(
  items: RecommendationGroup[],
  selectedKey: string | null,
): string | null {
  if (selectedKey && items.some((item) => item.key === selectedKey)) {
    return selectedKey;
  }

  return items[0]?.key ?? null;
}

function resolveSelectionState(
  recommendation: Pick<
    Recommendation,
    "selectedStyleKey" | "selectedModeKey" | "selectedGameplayKey"
  > | null,
  recommendations: RecommendationResult,
): RecommendationSelectionState {
  return {
    selectedStyleKey: selectKey(
      recommendations.styles,
      recommendation?.selectedStyleKey ?? null,
    ),
    selectedModeKey: selectKey(
      recommendations.modes,
      recommendation?.selectedModeKey ?? null,
    ),
    selectedGameplayKey: selectKey(
      recommendations.gameplay,
      recommendation?.selectedGameplayKey ?? null,
    ),
  };
}

function isSelectionStateEqual(
  left: RecommendationSelectionState,
  right: RecommendationSelectionState,
): boolean {
  return (
    left.selectedStyleKey === right.selectedStyleKey &&
    left.selectedModeKey === right.selectedModeKey &&
    left.selectedGameplayKey === right.selectedGameplayKey
  );
}

function isSelectionAllowed(
  selection: RecommendationSelectionState,
  recommendation: Pick<
    Recommendation,
    "styleKeys" | "modeKeys" | "gameplayKeys"
  >,
): boolean {
  const styleKeys = parseStoredStringArray(recommendation.styleKeys);
  const modeKeys = parseStoredStringArray(recommendation.modeKeys);
  const gameplayKeys = parseStoredStringArray(recommendation.gameplayKeys);

  if (!styleKeys || !modeKeys || !gameplayKeys) {
    return false;
  }

  return (
    (selection.selectedStyleKey === null ||
      styleKeys.includes(selection.selectedStyleKey)) &&
    (selection.selectedModeKey === null ||
      modeKeys.includes(selection.selectedModeKey)) &&
    (selection.selectedGameplayKey === null ||
      gameplayKeys.includes(selection.selectedGameplayKey))
  );
}

async function resolveAnalysis(upload: {
  id: string;
  fileName: string | null;
  sourceUrl: string;
  mimeType: string | null;
  analysisSummary: string | null;
  vibeTags: string | null;
}): Promise<AvatarAnalysis> {
  const storedTags = parseStoredStringArray(upload.vibeTags);

  if (upload.analysisSummary && storedTags) {
    return {
      summary: upload.analysisSummary,
      vibeTags: storedTags,
    };
  }

  const provider = getImageUnderstandingProvider();
  const analysis = await provider.analyzeAvatar({
    fileName: upload.fileName,
    sourceUrl: upload.sourceUrl,
    mimeType: upload.mimeType,
  });

  await db.upload.update({
    where: { id: upload.id },
    data: {
      analysisSummary: analysis.summary,
      vibeTags: JSON.stringify(analysis.vibeTags),
    },
  });

  return analysis;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = recommendRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid recommendation request.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const [upload, tier] = await Promise.all([
    db.upload.findUnique({
      where: { id: parsedBody.data.uploadSessionId },
    }),
    db.tier.findUnique({
      where: { key: parsedBody.data.tierKey },
    }),
  ]);

  if (!upload) {
    return Response.json(
      { error: "Upload session not found." },
      { status: 404 },
    );
  }

  if (!tier) {
    return Response.json({ error: "Tier not found." }, { status: 404 });
  }

  if (!hasUsableSourceUrl(upload)) {
    return Response.json(
      { error: "Upload session is missing a usable sourceUrl." },
      { status: 409 },
    );
  }

  const analysis = await resolveAnalysis(upload);
  const recommendations = buildRecommendationsFromAnalysis({
    vibeTags: analysis.vibeTags,
    tierKey: parsedBody.data.tierKey,
  });
  const serializedRecommendationKeys = {
    styleKeys: JSON.stringify(recommendations.styles.map((item) => item.key)),
    modeKeys: JSON.stringify(recommendations.modes.map((item) => item.key)),
    gameplayKeys: JSON.stringify(
      recommendations.gameplay.map((item) => item.key),
    ),
  };
  const defaultSelection = resolveSelectionState(null, recommendations);

  let storedRecommendation = await db.recommendation.upsert({
    where: {
      uploadId_tierId: {
        uploadId: upload.id,
        tierId: tier.id,
      },
    },
    create: {
      uploadId: upload.id,
      tierId: tier.id,
      ...serializedRecommendationKeys,
      ...defaultSelection,
    },
    update: serializedRecommendationKeys,
    select: {
      id: true,
      selectedStyleKey: true,
      selectedModeKey: true,
      selectedGameplayKey: true,
    },
  });

  const selection = resolveSelectionState(storedRecommendation, recommendations);

  if (
    !isSelectionStateEqual(
      {
        selectedStyleKey: storedRecommendation.selectedStyleKey,
        selectedModeKey: storedRecommendation.selectedModeKey,
        selectedGameplayKey: storedRecommendation.selectedGameplayKey,
      },
      selection,
    )
  ) {
    storedRecommendation = await db.recommendation.update({
      where: { id: storedRecommendation.id },
      data: selection,
      select: {
        id: true,
        selectedStyleKey: true,
        selectedModeKey: true,
        selectedGameplayKey: true,
      },
    });
  }

  return Response.json({
    recommendationId: storedRecommendation.id,
    uploadSessionId: upload.id,
    analysis,
    recommendations,
    ...selection,
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = recommendSelectionUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid recommendation selection update.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const recommendation = await db.recommendation.findUnique({
    where: { id: parsedBody.data.recommendationId },
    select: {
      id: true,
      styleKeys: true,
      modeKeys: true,
      gameplayKeys: true,
    },
  });

  if (!recommendation) {
    return Response.json(
      { error: "Recommendation not found." },
      { status: 404 },
    );
  }

  const selection: RecommendationSelectionState = {
    selectedStyleKey: parsedBody.data.selectedStyleKey,
    selectedModeKey: parsedBody.data.selectedModeKey,
    selectedGameplayKey: parsedBody.data.selectedGameplayKey,
  };

  if (!isSelectionAllowed(selection, recommendation)) {
    return Response.json(
      { error: "Selection is not valid for this recommendation." },
      { status: 409 },
    );
  }

  const updatedRecommendation = await db.recommendation.update({
    where: { id: recommendation.id },
    data: selection,
    select: {
      id: true,
      selectedStyleKey: true,
      selectedModeKey: true,
      selectedGameplayKey: true,
    },
  });

  return Response.json({
    recommendationId: updatedRecommendation.id,
    selectedStyleKey: updatedRecommendation.selectedStyleKey,
    selectedModeKey: updatedRecommendation.selectedModeKey,
    selectedGameplayKey: updatedRecommendation.selectedGameplayKey,
  });
}
