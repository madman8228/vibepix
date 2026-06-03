import { JobStatus } from "@prisma/client";

import { playPrompts } from "../catalog/play-prompts";
import { db } from "../db";
import { getAvatarIntelligenceProvider } from "../models/provider-registry";
import type { AvatarAnalysis } from "../types";
import type {
  PlayResult,
  PlayType,
} from "../types";
import type {
  PlayJobResponse,
  PlayJobStatus,
  StartPlayResponse,
  TextPlayResult,
  ImagePlayResult,
} from "../schemas/generate";

const MOCK_JOB_READY_DELAY_MS = 900;
const TEXT_DISCLAIMER =
  "For entertainment only. This result is a light interpretation, not advice or diagnosis.";

function hashValue(input: string) {
  let value = 0;

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 33 + input.charCodeAt(index)) % 360;
  }

  return value;
}

function buildSvgDataUrl({
  title,
  subtitle,
  accentHue,
}: {
  title: string;
  subtitle: string;
  accentHue: number;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${accentHue} 84% 68%)" />
          <stop offset="100%" stop-color="hsl(${(accentHue + 72) % 360} 70% 24%)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="#07111d" />
      <rect x="72" y="72" width="1056" height="1056" rx="64" fill="url(#bg)" opacity="0.94" />
      <circle cx="920" cy="280" r="170" fill="rgba(255,255,255,0.10)" />
      <circle cx="300" cy="890" r="210" fill="rgba(255,255,255,0.09)" />
      <text x="132" y="220" fill="white" font-size="42" font-family="Verdana, sans-serif" opacity="0.86">Avatar Play MVP</text>
      <text x="132" y="360" fill="white" font-size="92" font-family="Georgia, serif" font-weight="700">${title}</text>
      <text x="132" y="450" fill="rgba(255,255,255,0.92)" font-size="34" font-family="Verdana, sans-serif">${subtitle}</text>
      <rect x="132" y="580" width="360" height="14" rx="7" fill="rgba(255,255,255,0.42)" />
      <rect x="132" y="624" width="520" height="14" rx="7" fill="rgba(255,255,255,0.28)" />
      <rect x="132" y="668" width="440" height="14" rx="7" fill="rgba(255,255,255,0.22)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildFortuneVariant(uploadId: string, now: Date) {
  return `${uploadId}:${now.toISOString().slice(0, 10)}`;
}

function buildTextResult({
  uploadId,
  playType,
  analysis,
  now,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
  now: Date;
}): TextPlayResult {
  const primaryTag = analysis.tags[0] ?? "warm";
  const secondaryTag = analysis.tags[1] ?? "friendly";
  const dailySeed = playType === "daily_fortune" ? buildFortuneVariant(uploadId, now) : uploadId;
  const variant = hashValue(`${dailySeed}:${playType}:${playPrompts[playType]}`) % 3;

  if (playType === "daily_fortune") {
    const fortuneSets = [
      {
        title: "Today's Fortune",
        summary: `Your avatar reads as ${primaryTag} and ${secondaryTag} today, so the energy leans toward easy momentum and pleasant timing.`,
        highlights: [
          "Best when you lean into small confident steps.",
          "Social timing looks smoother than expected.",
          "A bright detail or compliment may lift your mood today.",
        ] as [string, string, string],
        suggestion: "Keep the day light and say yes to one easy win.",
      },
      {
        title: "Today's Fortune",
        summary: `Your current vibe feels ${primaryTag} with a steady ${secondaryTag} undertone, which points to a calm, low-drama day.`,
        highlights: [
          "Good energy for resetting your pace.",
          "People are more likely to read you as approachable.",
          "A quiet choice may turn out better than a rushed one.",
        ] as [string, string, string],
        suggestion: "Protect your attention and enjoy the most comfortable option.",
      },
      {
        title: "Today's Fortune",
        summary: `Your avatar gives off a ${primaryTag} first impression today, with ${secondaryTag} energy that makes the day feel gently lucky.`,
        highlights: [
          "Creative or playful decisions are favored.",
          "You may notice quick positive feedback from others.",
          "A familiar routine can still bring a fresh spark.",
        ] as [string, string, string],
        suggestion: "Choose the most fun version of your next small task.",
      },
    ];

    const chosen = fortuneSets[variant];
    return {
      kind: "text",
      playType,
      title: chosen.title,
      summary: chosen.summary,
      highlights: chosen.highlights,
      suggestion: chosen.suggestion,
      disclaimer: TEXT_DISCLAIMER,
    };
  }

  const definitions: Record<Exclude<PlayType, "style_swap" | "new_avatar" | "poster" | "mood_mode" | "story_mode" | "daily_fortune">, { title: string; summary: string; highlights: [string, string, string]; suggestion: string; }> = {
    personality_read: {
      title: "Personality Read",
      summary: `Your avatar comes across as ${primaryTag}, ${secondaryTag}, and easy to warm up to. The overall feel is light, steady, and quietly expressive.`,
      highlights: [
        `People may first read you as ${primaryTag}.`,
        `There is a ${secondaryTag} quality that softens the whole impression.`,
        "The vibe suggests calm confidence more than loud attention-seeking.",
      ],
      suggestion: "Lean into the most natural version of yourself rather than over-styling your image.",
    },
    social_aura: {
      title: "Social Aura",
      summary: `This avatar gives off a ${primaryTag} social aura with ${secondaryTag} energy underneath, making the vibe feel open and easy to approach.`,
      highlights: [
        "Your first impression feels softer than intimidating.",
        "The image reads best in casual, warm social settings.",
        "A small confident gesture is likely to stand out well.",
      ],
      suggestion: "Use this aura when you want to feel friendly, natural, and lightly magnetic.",
    },
  };

  const chosen = definitions[playType as keyof typeof definitions];
  return {
    kind: "text",
    playType,
    title: chosen.title,
    summary: chosen.summary,
    highlights: chosen.highlights,
    suggestion: chosen.suggestion,
    disclaimer: TEXT_DISCLAIMER,
  };
}

function buildImageResult({
  uploadId,
  playType,
  analysis,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
}): ImagePlayResult {
  const titles: Record<PlayType, string> = {
    personality_read: "Personality Read",
    daily_fortune: "Today's Fortune",
    social_aura: "Social Aura",
    style_swap: "Style Swap Avatar",
    new_avatar: "New Avatar Concept",
    poster: "Poster Composition",
    mood_mode: "Mood Mode Frame",
    story_mode: "Story Mode Frame",
  };
  const subtitles: Record<PlayType, string> = {
    personality_read: analysis.summary,
    daily_fortune: analysis.summary,
    social_aura: analysis.summary,
    style_swap: "Identity intact, visual mood refreshed.",
    new_avatar: "A more transformed avatar interpretation.",
    poster: "Display-first composition with stronger presentation energy.",
    mood_mode: "Emotion and atmosphere pushed to the front.",
    story_mode: "A single frame that hints at a larger scene.",
  };
  const accentHue = hashValue(`${uploadId}:${playType}:${analysis.tags.join(",")}`);
  const title = titles[playType];
  const summary = subtitles[playType];

  return {
    kind: "image",
    playType,
    title,
    summary,
    imageUrl: buildSvgDataUrl({ title, subtitle: summary, accentHue }),
    altText: `${title} generated from an avatar with ${analysis.tags.join(", ")} energy.`,
  };
}

export function buildPlayResult({
  uploadId,
  playType,
  analysis,
  now,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
  now: Date;
}): PlayResult {
  if (playType === "personality_read" || playType === "daily_fortune" || playType === "social_aura") {
    return buildTextResult({ uploadId, playType, analysis, now });
  }

  return buildImageResult({ uploadId, playType, analysis });
}

function parseStoredStringArray(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function buildProgress(status: PlayJobStatus, createdAt: Date) {
  if (status === "SUCCEEDED") {
    return {
      label: "Ready",
      message: "Your play result is ready to explore.",
      percent: 100,
    };
  }

  if (status === "FAILED") {
    return {
      label: "Stopped",
      message: "This play could not be completed.",
      percent: 100,
    };
  }

  const ratio = Math.max(
    0,
    Math.min(0.99, (Date.now() - createdAt.getTime()) / MOCK_JOB_READY_DELAY_MS),
  );

  if (ratio < 0.35) {
    return {
      label: "Preparing",
      message: "Reading your avatar and loading the selected play prompt.",
      percent: 32,
    };
  }

  if (ratio < 0.72) {
    return {
      label: "Generating",
      message: "Building a single result for the chosen play.",
      percent: 71,
    };
  }

  return {
    label: "Finalizing",
    message: "Packaging the result card and rating state.",
    percent: 92,
  };
}

async function resolveDefaultTierId() {
  const tier = await db.tier.upsert({
    where: { key: "free" },
    update: {
      name: "Free",
      maxPanels: 1,
      monthlyQuota: 999,
    },
    create: {
      key: "free",
      name: "Free",
      maxPanels: 1,
      monthlyQuota: 999,
    },
    select: { id: true },
  });

  return tier.id;
}

export async function createPlayJob({
  uploadSessionId,
  playType,
}: {
  uploadSessionId: string;
  playType: PlayType;
}): Promise<StartPlayResponse> {
  const upload = await db.upload.findUnique({
    where: { id: uploadSessionId },
    select: {
      id: true,
      complianceStatus: true,
      blockedReason: true,
      analysisSummary: true,
      vibeTags: true,
    },
  });

  if (!upload) {
    throw new Error("Upload session not found.");
  }

  if (upload.complianceStatus === "BLOCKED") {
    throw new Error(
      upload.blockedReason ?? "This image has a compliance issue and cannot be processed.",
    );
  }

  const analysis: AvatarAnalysis = {
    summary:
      upload.analysisSummary ??
      "Warm portrait with calm energy and an approachable first impression.",
    tags: parseStoredStringArray(upload.vibeTags),
  };
  const now = new Date();
  const result = await getAvatarIntelligenceProvider().executePlay({
    uploadId: upload.id,
    playType,
    analysis,
    now,
  });
  const tierId = await resolveDefaultTierId();

  const createdJob = await db.job.create({
    data: {
      uploadId: upload.id,
      playType,
      playCategory: result.kind,
      tierId,
      status: JobStatus.RUNNING,
      panelCount: 1,
      outputTitle: result.title,
      outputSummary: result.summary,
      outputHighlights: result.kind === "text" ? JSON.stringify(result.highlights) : null,
      outputSuggestion: result.kind === "text" ? result.suggestion : null,
      outputDisclaimer: result.kind === "text" ? result.disclaimer : null,
      dailyKey: playType === "daily_fortune" ? now.toISOString().slice(0, 10) : null,
      works: result.kind === "image"
        ? {
            create: {
              title: result.title,
              imageUrl: result.imageUrl,
              altText: result.altText,
            },
          }
        : undefined,
    },
    select: {
      id: true,
    },
  });

  return {
    jobId: createdJob.id,
    status: "RUNNING",
    redirectTo: `/generate/${createdJob.id}`,
  };
}

async function maybeFinalizeRunningJob(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  if (!job || job.status !== JobStatus.RUNNING) {
    return;
  }

  if (Date.now() - job.createdAt.getTime() < MOCK_JOB_READY_DELAY_MS) {
    return;
  }

  await db.job.update({
    where: { id: job.id },
    data: {
      status: JobStatus.SUCCEEDED,
    },
  });
}

export async function getPlayJob(jobId: string): Promise<PlayJobResponse | null> {
  await maybeFinalizeRunningJob(jobId);

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      uploadId: true,
      playType: true,
      playCategory: true,
      status: true,
      ratingScore: true,
      outputTitle: true,
      outputSummary: true,
      outputHighlights: true,
      outputSuggestion: true,
      outputDisclaimer: true,
      createdAt: true,
      updatedAt: true,
      works: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          title: true,
          imageUrl: true,
          altText: true,
        },
      },
    },
  });

  if (!job || !job.uploadId || !job.playType || !job.playCategory) {
    return null;
  }

  const status = job.status as PlayJobStatus;
  const result = status === "SUCCEEDED"
    ? job.playCategory === "text"
      ? {
          kind: "text" as const,
          playType: job.playType as PlayType,
          title: job.outputTitle ?? "Play Result",
          summary: job.outputSummary ?? "",
          highlights: (() => {
            try {
              const parsed = JSON.parse(job.outputHighlights ?? "[]");
              return [parsed[0] ?? "", parsed[1] ?? "", parsed[2] ?? ""] as [
                string,
                string,
                string,
              ];
            } catch {
              return ["", "", ""] as [string, string, string];
            }
          })(),
          suggestion: job.outputSuggestion ?? "",
          disclaimer: job.outputDisclaimer ?? TEXT_DISCLAIMER,
        }
      : {
          kind: "image" as const,
          playType: job.playType as PlayType,
          title: job.outputTitle ?? job.works[0]?.title ?? "Play Result",
          summary: job.outputSummary ?? "",
          imageUrl: job.works[0]?.imageUrl ?? "",
          altText: job.works[0]?.altText ?? "",
        }
    : null;

  return {
    jobId: job.id,
    uploadSessionId: job.uploadId,
    playType: job.playType as PlayType,
    status,
    progress: buildProgress(status, job.createdAt),
    result,
    rating: {
      score: job.ratingScore,
    },
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function ratePlayJob({
  jobId,
  score,
}: {
  jobId: string;
  score: number;
}) {
  const updatedJob = await db.job.update({
    where: { id: jobId },
    data: {
      ratingScore: score,
    },
    select: {
      id: true,
      ratingScore: true,
    },
  });

  return {
    jobId: updatedJob.id,
    rating: {
      score: updatedJob.ratingScore,
    },
  };
}
