import { JobStatus, WorkKind, type CatalogItem } from "@prisma/client";

import { db } from "../db";
import { getImageUnderstandingProvider } from "../models/provider-registry";
import {
  buildMockGenerationResult,
  mockImageGenerationProvider,
} from "../models/mock-image-generation";
import type { AvatarAnalysis } from "../models/provider-types";
import type {
  GenerationJobProgress,
  GenerationJobResponse,
  GenerationJobStatus,
  StartGenerationResponse,
} from "../schemas/generate";
import type { RecommendationGroup } from "../types";
import {
  buildCharacterBible,
  type GenerationSelection,
} from "./character-bible";
import {
  buildGenerationIntent,
  compileProviderPrompt,
} from "./prompt-compiler";

const MOCK_JOB_READY_DELAY_MS = 1200;
const INCOMPLETE_GENERATION_OUTPUT_MESSAGE =
  "Generation output was incomplete. Please try again.";

type SelectionKeys = {
  selectedStyleKey: string;
  selectedModeKey: string;
  selectedGameplayKey: string;
};

type RecommendationRecord = {
  id: string;
  uploadId: string;
  tierId: string;
  styleKeys: string;
  modeKeys: string;
  gameplayKeys: string;
  selectedStyleKey: string | null;
  selectedModeKey: string | null;
  selectedGameplayKey: string | null;
  tier: {
    id: string;
    key: string;
    maxPanels: number;
  };
  upload: {
    id: string;
    sourceUrl: string;
    fileName: string | null;
    mimeType: string | null;
    analysisSummary: string | null;
    vibeTags: string | null;
  };
};

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

function isSelectionAllowed(
  selection: SelectionKeys,
  recommendation: Pick<
    RecommendationRecord,
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
    styleKeys.includes(selection.selectedStyleKey) &&
    modeKeys.includes(selection.selectedModeKey) &&
    gameplayKeys.includes(selection.selectedGameplayKey)
  );
}

function parseJsonArray(value: string, fallback: string[] = []) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function toRecommendationGroup(item: CatalogItem): RecommendationGroup {
  return {
    key: item.key,
    title: item.title,
    description: item.description ?? "",
    reason: item.reason ?? "",
    tags: parseJsonArray(item.tags).filter((tag): tag is string => typeof tag === "string"),
    tierKeys: parseJsonArray(item.tierKeys).filter(
      (tierKey): tierKey is "free" | "plus" =>
        tierKey === "free" || tierKey === "plus",
    ),
    sortOrder: item.sortOrder,
    previewImageUrl: item.previewImageUrl ?? undefined,
  };
}

async function resolveAnalysis(
  upload: RecommendationRecord["upload"],
): Promise<AvatarAnalysis> {
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

async function resolveSelectionGroups(
  selection: SelectionKeys,
): Promise<GenerationSelection> {
  const items = await db.catalogItem.findMany({
    where: {
      key: {
        in: [
          selection.selectedStyleKey,
          selection.selectedModeKey,
          selection.selectedGameplayKey,
        ],
      },
      isActive: true,
    },
  });
  const itemByKey = new Map(items.map((item) => [item.key, item]));
  const style = itemByKey.get(selection.selectedStyleKey);
  const mode = itemByKey.get(selection.selectedModeKey);
  const gameplay = itemByKey.get(selection.selectedGameplayKey);

  if (!style || !mode || !gameplay) {
    throw new Error("Selected recommendation items are missing from the catalog.");
  }

  return {
    style: toRecommendationGroup(style),
    mode: toRecommendationGroup(mode),
    gameplay: toRecommendationGroup(gameplay),
  };
}

function resolvePanelCount(
  selection: SelectionKeys,
  maxPanels: number,
): number {
  if (selection.selectedModeKey === "mini-arc") {
    return Math.max(1, Math.min(maxPanels, 3));
  }

  if (selection.selectedModeKey === "day-in-the-life") {
    return Math.max(1, Math.min(maxPanels, 2));
  }

  return 1;
}

function mapJobStatus(status: JobStatus): GenerationJobStatus {
  return status;
}

function buildProgress(
  status: GenerationJobStatus,
  createdAt: Date,
): GenerationJobProgress {
  if (status === "SUCCEEDED") {
    return {
      label: "Ready",
      message: "Your mock generation is ready to review.",
      percent: 100,
    };
  }

  if (status === "FAILED") {
    return {
      label: "Failed",
      message: "This mock generation could not be prepared.",
      percent: 100,
    };
  }

  const elapsedMs = Date.now() - createdAt.getTime();
  const ratio = Math.max(0, Math.min(0.99, elapsedMs / MOCK_JOB_READY_DELAY_MS));

  if (ratio < 0.25) {
    return {
      label: "Queued",
      message: "Loading your saved recommendation set.",
      percent: 14,
    };
  }

  if (ratio < 0.55) {
    return {
      label: "Character Bible",
      message: "Summarizing your avatar into a compact character brief.",
      percent: 43,
    };
  }

  if (ratio < 0.85) {
    return {
      label: "Prompt Compiler",
      message: "Compiling provider-specific prompt stubs for the mock renderer.",
      percent: 74,
    };
  }

  return {
    label: "Finalizing",
    message: "Packaging assets for the result viewer.",
    percent: 92,
  };
}

function hasNonEmptyText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function buildLegacyAltText({
  title,
  styleTitle,
  gameplayTitle,
}: {
  title: string | null | undefined;
  styleTitle: string | null;
  gameplayTitle: string | null;
}) {
  const resolvedTitle = title ?? "Generated panel";

  if (styleTitle && gameplayTitle) {
    return `${resolvedTitle} from ${styleTitle} with ${gameplayTitle}.`;
  }

  if (styleTitle) {
    return `${resolvedTitle} from ${styleTitle}.`;
  }

  return `${resolvedTitle} from your saved recommendation set.`;
}

function hasPersistedGenerationResult(job: {
  outputSummary: string | null;
  panelCount: number;
  works: Array<{
    kind: WorkKind;
    title: string | null;
    imageUrl: string;
    altText: string;
  }>;
}) {
  const panelWorks = job.works.filter((work) => work.kind === WorkKind.PANEL);

  return (
    hasNonEmptyText(job.outputSummary) &&
    panelWorks.length === job.panelCount &&
    panelWorks.every((work) => hasNonEmptyText(work.imageUrl))
  );
}

async function maybeFinalizeRunningJob(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      panelCount: true,
      outputSummary: true,
      works: {
        select: {
          kind: true,
          title: true,
          imageUrl: true,
          altText: true,
        },
      },
    },
  });

  if (!job || job.status !== JobStatus.RUNNING) {
    return;
  }

  if (Date.now() - job.createdAt.getTime() < MOCK_JOB_READY_DELAY_MS) {
    return;
  }

  const persistedResultExists = hasPersistedGenerationResult(job);

  await db.job.update({
    where: { id: jobId },
    data: {
      status: persistedResultExists ? JobStatus.SUCCEEDED : JobStatus.FAILED,
      outputSummary: persistedResultExists
        ? job.outputSummary
        : INCOMPLETE_GENERATION_OUTPUT_MESSAGE,
    },
  });
}

export function prepareGenerationArtifacts({
  jobId,
  analysis,
  selection,
  panelCount,
}: {
  jobId: string;
  analysis: AvatarAnalysis;
  selection: GenerationSelection;
  panelCount: number;
}) {
  const characterBible = buildCharacterBible({
    analysis,
    selection,
    panelCount,
  });
  const intent = buildGenerationIntent({
    jobId,
    panelCount,
    selection,
    characterBible,
  });
  const prompt = compileProviderPrompt(intent);

  return {
    characterBible,
    intent,
    prompt,
    result: buildMockGenerationResult({
      jobId,
      prompt,
      intent,
    }),
  };
}

export async function createGenerationJob(
  selection: SelectionKeys & {
    recommendationId: string;
  },
): Promise<StartGenerationResponse> {
  const recommendation = await db.recommendation.findUnique({
    where: { id: selection.recommendationId },
    select: {
      id: true,
      uploadId: true,
      tierId: true,
      styleKeys: true,
      modeKeys: true,
      gameplayKeys: true,
      selectedStyleKey: true,
      selectedModeKey: true,
      selectedGameplayKey: true,
      tier: {
        select: {
          id: true,
          key: true,
          maxPanels: true,
        },
      },
      upload: {
        select: {
          id: true,
          sourceUrl: true,
          fileName: true,
          mimeType: true,
          analysisSummary: true,
          vibeTags: true,
        },
      },
    },
  });

  if (!recommendation) {
    throw new Error("Recommendation not found.");
  }

  if (!isSelectionAllowed(selection, recommendation)) {
    throw new Error("Selection is not valid for this recommendation.");
  }

  await db.recommendation.update({
    where: { id: recommendation.id },
    data: {
      selectedStyleKey: selection.selectedStyleKey,
      selectedModeKey: selection.selectedModeKey,
      selectedGameplayKey: selection.selectedGameplayKey,
    },
  });

  const [analysis, selectionGroups] = await Promise.all([
    resolveAnalysis(recommendation.upload),
    resolveSelectionGroups(selection),
  ]);
  const panelCount = resolvePanelCount(selection, recommendation.tier.maxPanels);

  const createdJob = await db.job.create({
    data: {
      recommendationId: recommendation.id,
      tierId: recommendation.tierId,
      panelCount,
      status: JobStatus.RUNNING,
    },
    select: {
      id: true,
    },
  });

  const prepared = prepareGenerationArtifacts({
    jobId: createdJob.id,
    analysis,
    selection: selectionGroups,
    panelCount,
  });
  const generated = await mockImageGenerationProvider.generate({
    jobId: createdJob.id,
    prompt: prepared.prompt,
    intent: prepared.intent,
  });

  await db.job.update({
    where: { id: createdJob.id },
    data: {
      outputSummary: generated.summary,
      works: {
        create: generated.assets.map((asset) => ({
          id: asset.id,
          kind: WorkKind.PANEL,
          title: asset.title,
          imageUrl: asset.imageUrl,
          altText: asset.altText,
          panelIndex: asset.panelIndex,
        })),
      },
    },
  });

  return {
    jobId: createdJob.id,
    status: "RUNNING",
    redirectTo: `/generate/${createdJob.id}`,
  };
}

export async function getGenerationJob(jobId: string): Promise<GenerationJobResponse | null> {
  await maybeFinalizeRunningJob(jobId);

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      panelCount: true,
      outputSummary: true,
      createdAt: true,
      updatedAt: true,
      works: {
        orderBy: {
          panelIndex: "asc",
        },
        select: {
          id: true,
          kind: true,
          title: true,
          imageUrl: true,
          altText: true,
          panelIndex: true,
        },
      },
      recommendation: {
        select: {
          selectedStyleKey: true,
          selectedModeKey: true,
          selectedGameplayKey: true,
        },
      },
    },
  });

  if (!job) {
    return null;
  }

  const selectionKeys = [
    job.recommendation?.selectedStyleKey,
    job.recommendation?.selectedModeKey,
    job.recommendation?.selectedGameplayKey,
  ].filter((key): key is string => typeof key === "string");
  const selectionItems = selectionKeys.length
    ? await db.catalogItem.findMany({
        where: {
          key: {
            in: selectionKeys,
          },
        },
      })
    : [];
  const titleByKey = new Map(selectionItems.map((item) => [item.key, item.title]));
  const persistedResultExists = hasPersistedGenerationResult(job);
  const status =
    job.status === JobStatus.SUCCEEDED && !persistedResultExists
      ? "FAILED"
      : mapJobStatus(job.status);
  const selectionTitles = {
    styleTitle: job.recommendation?.selectedStyleKey
      ? titleByKey.get(job.recommendation.selectedStyleKey) ?? null
      : null,
    modeTitle: job.recommendation?.selectedModeKey
      ? titleByKey.get(job.recommendation.selectedModeKey) ?? null
      : null,
    gameplayTitle: job.recommendation?.selectedGameplayKey
      ? titleByKey.get(job.recommendation.selectedGameplayKey) ?? null
      : null,
  };
  const panelWorks = job.works.filter((work) => work.kind === WorkKind.PANEL);

  return {
    jobId: job.id,
    status,
    progress: buildProgress(status, job.createdAt),
    result:
      status === "SUCCEEDED"
        ? {
            summary: job.outputSummary ?? "Your mock generation is ready.",
            assets: panelWorks.map((work) => ({
              id: work.id,
              title: work.title ?? `Panel ${(work.panelIndex ?? 0) + 1}`,
              imageUrl: work.imageUrl,
              altText:
                work.altText ||
                buildLegacyAltText({
                  title: work.title,
                  styleTitle: selectionTitles.styleTitle,
                  gameplayTitle: selectionTitles.gameplayTitle,
                }),
              panelIndex: work.panelIndex,
            })),
            selection: selectionTitles,
          }
        : null,
    errorMessage:
      status === "FAILED"
        ? job.status === JobStatus.FAILED
          ? job.outputSummary ?? "Generation failed."
          : INCOMPLETE_GENERATION_OUTPUT_MESSAGE
        : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
