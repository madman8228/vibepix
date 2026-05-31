import { db } from "../../../lib/db";
import { getImageUnderstandingProvider } from "../../../lib/models/provider-registry";
import type { AvatarAnalysis } from "../../../lib/models/provider-types";
import { buildRecommendationsFromAnalysis } from "../../../lib/recommendation/engine";
import { recommendRequestSchema } from "../../../lib/schemas/recommend";

function parseStoredTags(value: string | null): string[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((tag) => typeof tag === "string")
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

async function resolveAnalysis(upload: {
  id: string;
  fileName: string | null;
  sourceUrl: string;
  mimeType: string | null;
  analysisSummary: string | null;
  vibeTags: string | null;
}): Promise<AvatarAnalysis> {
  const storedTags = parseStoredTags(upload.vibeTags);

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

  await db.recommendation.create({
    data: {
      uploadId: upload.id,
      tierId: tier.id,
      styleKeys: JSON.stringify(recommendations.styles.map((item) => item.key)),
      modeKeys: JSON.stringify(recommendations.modes.map((item) => item.key)),
      gameplayKeys: JSON.stringify(
        recommendations.gameplay.map((item) => item.key),
      ),
    },
  });

  return Response.json({
    uploadSessionId: upload.id,
    analysis,
    recommendations,
  });
}
