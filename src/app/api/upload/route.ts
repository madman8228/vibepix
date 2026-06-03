import { db } from "../../../lib/db";
import { getAvatarIntelligenceProvider } from "../../../lib/models/provider-registry";
import { uploadRequestSchema } from "../../../lib/schemas/upload";

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);

  if (body === undefined) {
    return Response.json(
      {
        error: "Invalid upload request.",
        issues: {
          formErrors: ["Malformed JSON body."],
          fieldErrors: {},
        },
      },
      { status: 400 },
    );
  }

  const parsedBody = uploadRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid upload request.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const provider = getAvatarIntelligenceProvider();
  const inspection = await provider.inspectAvatar(parsedBody.data);

  if (inspection.compliance.status === "blocked") {
    return Response.json(
      {
        error: inspection.compliance.reason,
      },
      { status: 409 },
    );
  }

  const upload = await db.upload.create({
    data: {
      fileName: parsedBody.data.fileName ?? null,
      sourceUrl: parsedBody.data.sourceUrl,
      mimeType: parsedBody.data.mimeType ?? null,
      complianceStatus: "APPROVED",
      analysisSummary: inspection.analysis?.summary ?? null,
      vibeTags: JSON.stringify(inspection.analysis?.tags ?? []),
    },
  });

  return Response.json({
    uploadSessionId: upload.id,
    analysis: inspection.analysis,
  });
}
