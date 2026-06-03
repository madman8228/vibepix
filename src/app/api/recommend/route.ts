import { db } from "../../../lib/db";
import { buildPlayRecommendations } from "../../../lib/recommendation/engine";
import { recommendRequestSchema } from "../../../lib/schemas/recommend";

function parseStoredStringArray(value: string | null) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [] as string[];
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = recommendRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid play lobby request.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const upload = await db.upload.findUnique({
    where: { id: parsedBody.data.uploadSessionId },
    select: {
      id: true,
      complianceStatus: true,
      blockedReason: true,
      analysisSummary: true,
      vibeTags: true,
    },
  });

  if (!upload) {
    return Response.json({ error: "Upload session not found." }, { status: 404 });
  }

  if (upload.complianceStatus === "BLOCKED") {
    return Response.json(
      {
        error:
          upload.blockedReason ??
          "This image has a compliance issue and cannot be processed.",
      },
      { status: 409 },
    );
  }

  const analysis = {
    summary:
      upload.analysisSummary ??
      "Warm portrait with calm energy and an approachable first impression.",
    tags: parseStoredStringArray(upload.vibeTags),
  };
  const recommendations = buildPlayRecommendations({
    tags: analysis.tags,
  });

  return Response.json({
    uploadSessionId: upload.id,
    analysis,
    recommendedPlays: recommendations.recommendedPlays,
    availablePlays: recommendations.availablePlays,
  });
}
