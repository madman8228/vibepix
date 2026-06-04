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
  "仅供轻娱乐体验参考，不作为建议、诊断或任何重要决策依据。";

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
  variantLabel,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
  now: Date;
  variantLabel?: string;
}): TextPlayResult {
  const primaryTag = analysis.tags[0] ?? "温和";
  const secondaryTag = analysis.tags[1] ?? "亲近";
  const dailySeed = playType === "daily_fortune" ? buildFortuneVariant(uploadId, now) : uploadId;
  const variant = hashValue(`${dailySeed}:${playType}:${playPrompts[playType]}`) % 3;

  if (playType === "daily_fortune") {
    const fortuneSets = [
      {
        title: "今日运势",
        summary: `今天这张头像给人的感觉偏${primaryTag}，也带一点${secondaryTag}的尾调，整体会更轻松顺一点${variantLabel ? `，也更适合「${variantLabel}」这类氛围` : ""}。`,
        highlights: [
          "适合先从一件小事开始，状态会慢慢顺起来。",
          "今天的人际互动，节奏会比你预想得更轻松。",
          "一个被看见的小细节，可能会让你心情变好。",
        ] as [string, string, string],
        suggestion: "别把今天安排得太满，先接住一个轻松的小好运。",
      },
      {
        title: "今日运势",
        summary: `这张头像今天透出的感觉更偏${primaryTag}和${secondaryTag}，说明今天适合走稳定、舒服的节奏${variantLabel ? `，也更适合「${variantLabel}」的打开方式` : ""}。`,
        highlights: [
          "适合放慢一点，把自己的状态调回来。",
          "别人会更容易觉得你亲近、好沟通。",
          "今天安静一点的选择，反而可能更合适。",
        ] as [string, string, string],
        suggestion: "尽量把注意力留给真正重要的事，舒服一点会更顺。",
      },
      {
        title: "今日运势",
        summary: `今天这张头像更像一种${primaryTag}的开场，再带一点${secondaryTag}的气氛，整体是轻轻发亮的一天${variantLabel ? `，很适合放大成「${variantLabel}」的感觉` : ""}。`,
        highlights: [
          "适合做一点轻松、带玩心的决定。",
          "你可能会收到比平时更快的正向反馈。",
          "熟悉的日常里，也会冒出一点新鲜感。",
        ] as [string, string, string],
        suggestion: "下一件小事，尽量选那个你更想做的版本。",
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
      title: "性格解读",
      summary: `这张头像会让人先感受到你的${primaryTag}，再慢慢注意到一点${secondaryTag}。整体气质不张扬，但有自己的温度${variantLabel ? `，也很适合「${variantLabel}」这种表达` : ""}。`,
      highlights: [
        `第一眼最容易被读到的，是你身上的${primaryTag}感。`,
        `${secondaryTag}让这张头像看起来更柔和，也更容易被喜欢。`,
        "整体不是那种用力吸引注意的类型，而是慢慢留下印象。",
      ],
      suggestion: "这类气质最适合自然一点，不需要把自己包装得太满。",
    },
    social_aura: {
      title: "社交气场",
      summary: `这张头像在社交场景里会先给出一种${primaryTag}的感觉，底下又带一点${secondaryTag}，所以整体比较容易靠近${variantLabel ? `，尤其适合「${variantLabel}」这一类呈现` : ""}。`,
      highlights: [
        "第一印象偏柔和，不会让人有距离感。",
        "放在轻松、温暖一点的场景里会更讨喜。",
        "一个小小的自信动作，就足够让你被记住。",
      ],
      suggestion: "如果你想显得自然、亲切又不无聊，这种气场就很合适。",
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
  variantLabel,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
  variantLabel?: string;
}): ImagePlayResult {
  const titles: Record<PlayType, string> = {
    personality_read: "性格解读",
    daily_fortune: "今日运势",
    social_aura: "社交气场",
    style_swap: "换风格头像",
    new_avatar: "新头像生成",
    poster: "海报生成",
    mood_mode: "心情模式",
    story_mode: "剧情模式",
  };
  const subtitles: Record<PlayType, string> = {
    personality_read: analysis.summary,
    daily_fortune: analysis.summary,
    social_aura: analysis.summary,
    style_swap: "保留原来的辨识度，换一种更新鲜的视觉气质。",
    new_avatar: "以原头像为灵感，生成一个更有变化的新版本。",
    poster: "让画面更有展示感，也更像一张完整海报。",
    mood_mode: "把情绪和氛围感拉到画面最前面。",
    story_mode: "像一张故事截图，留一点想象空间。",
  };
  const accentHue = hashValue(`${uploadId}:${playType}:${analysis.tags.join(",")}:${variantLabel ?? ""}`);
  const title = titles[playType];
  const summary = variantLabel
    ? `${subtitles[playType]} 这次会更偏「${variantLabel}」的画面氛围。`
    : subtitles[playType];

  return {
    kind: "image",
    playType,
    title,
    summary,
    imageUrl: buildSvgDataUrl({ title, subtitle: summary, accentHue }),
    altText: `根据头像的${analysis.tags.join("、")}气质生成的${title}结果。`,
  };
}

export function buildPlayResult({
  uploadId,
  playType,
  analysis,
  now,
  variantLabel,
}: {
  uploadId: string;
  playType: PlayType;
  analysis: AvatarAnalysis;
  now: Date;
  variantLabel?: string;
}): PlayResult {
  if (playType === "personality_read" || playType === "daily_fortune" || playType === "social_aura") {
    return buildTextResult({ uploadId, playType, analysis, now, variantLabel });
  }

  return buildImageResult({ uploadId, playType, analysis, variantLabel });
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
      message: "结果已经准备好了。",
      percent: 100,
    };
  }

  if (status === "FAILED") {
    return {
      label: "Stopped",
      message: "这个玩法暂时没能完成。",
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
      message: "正在读取头像信息并准备这个玩法。",
      percent: 32,
    };
  }

  if (ratio < 0.72) {
    return {
      label: "Generating",
      message: "正在生成这次唯一的结果。",
      percent: 71,
    };
  }

  return {
    label: "Finalizing",
    message: "正在整理结果展示和评分状态。",
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
  variantKey,
  variantLabel,
}: {
  uploadSessionId: string;
  playType: PlayType;
  variantKey?: string;
  variantLabel?: string;
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
      "这张头像给人的感觉温和、安静，也比较容易让人产生好感。",
    tags: parseStoredStringArray(upload.vibeTags),
  };
  const now = new Date();
  const result = await getAvatarIntelligenceProvider().executePlay({
    uploadId: upload.id,
    playType,
    variantKey,
    variantLabel,
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
