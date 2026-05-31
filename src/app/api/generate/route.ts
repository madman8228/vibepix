import { createGenerationJob } from "../../../lib/orchestration/pipeline";
import { generateRequestSchema } from "../../../lib/schemas/generate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBody = generateRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid generation request.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const response = await createGenerationJob(parsedBody.data);

    return Response.json(response, { status: 202 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Generation could not be started.";
    const status =
      message === "Recommendation not found."
        ? 404
        : message === "Selection is not valid for this recommendation."
          ? 409
          : 500;

    return Response.json({ error: message }, { status });
  }
}
