"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { JobProgress } from "../../../components/generate/job-progress";
import { RatingPanel } from "../../../components/generate/rating-panel";
import { ResultViewer } from "../../../components/generate/result-viewer";
import { getPlayJob, ratePlayJob } from "../../../lib/api";
import type { PlayJobResponse } from "../../../lib/schemas/generate";

type PageState = "loading" | "ready" | "error";

export default function GenerateResultPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = typeof params?.jobId === "string" ? params.jobId : "";
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [job, setJob] = useState<PlayJobResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (!jobId) {
        setPageState("error");
        setErrorMessage("Play job missing. Start again from the play lobby.");
        return;
      }

      try {
        const nextJob = await getPlayJob(jobId);

        if (cancelled) {
          return;
        }

        setJob(nextJob);
        setPageState("ready");
        setErrorMessage(null);

        if (nextJob.status === "RUNNING" || nextJob.status === "PENDING") {
          timeoutId = setTimeout(() => {
            void poll();
          }, 700);
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        setPageState("error");
        setErrorMessage(error instanceof Error ? error.message : "We could not load this play result right now.");
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [jobId]);

  async function handleRate(score: number) {
    if (!job) {
      return;
    }

    const rating = await ratePlayJob(job.jobId, score);
    setJob({
      ...job,
      rating: rating.rating,
    });
  }

  if (pageState === "error") {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-rose-400/30 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Play result</p>
          <h1 className="text-3xl font-semibold text-white">We could not load this result.</h1>
          <p className="text-base text-slate-300">{errorMessage ?? "Please go back to the play lobby and try again."}</p>
          <Link href="/" className="inline-flex w-fit rounded-full bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200">
            Back to upload
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Play result</p>
            <h1 className="text-4xl font-semibold text-white">One result at a time</h1>
            <p className="max-w-2xl text-base text-slate-300">Each selected play returns one focused text card or one generated image, plus optional half-star feedback.</p>
          </div>
          {job ? (
            <Link
              href={`/recommend?uploadSessionId=${encodeURIComponent(job.uploadSessionId)}`}
              className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              Back to play lobby
            </Link>
          ) : null}
        </div>

        {job ? (
          <>
            <JobProgress status={job.status} progress={job.progress} />
            {job.result ? <ResultViewer job={job} /> : null}
            {job.status === "SUCCEEDED" ? (
              <RatingPanel value={job.rating.score} onRate={handleRate} />
            ) : null}
          </>
        ) : (
          <JobProgress
            status="RUNNING"
            progress={{
              label: "Preparing",
              message: "Loading your selected play.",
              percent: 10,
            }}
          />
        )}
      </div>
    </main>
  );
}
