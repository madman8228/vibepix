import { createPlayJob } from "../../../lib/orchestration/pipeline";
import { startPlayRequestSchema } from "../../../lib/schemas/generate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = startPlayRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid play request.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const response = await createPlayJob(parsedBody.data);
    return Response.json(response, { status: 202 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "This play could not be started.";
    const status = message === "Upload session not found."
      ? 404
      : message === "This image has a compliance issue and cannot be processed."
        ? 409
        : 500;

    return Response.json({ error: message }, { status });
  }
}
