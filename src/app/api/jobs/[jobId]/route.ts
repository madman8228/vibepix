import { getPlayJob, ratePlayJob } from "../../../../lib/orchestration/pipeline";
import { playRatingUpdateSchema } from "../../../../lib/schemas/generate";

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const job = await getPlayJob(jobId);

  if (!job) {
    return Response.json({ error: "Job not found." }, { status: 404 });
  }

  return Response.json(job);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsedBody = playRatingUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        error: "Invalid rating update.",
        issues: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const rating = await ratePlayJob({
    jobId,
    score: parsedBody.data.score,
  });

  return Response.json(rating);
}
