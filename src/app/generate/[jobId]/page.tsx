"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { JobProgress } from "../../../components/generate/job-progress";
import { ResultViewer } from "../../../components/generate/result-viewer";
import { getGenerationJob } from "../../../lib/api";
import type { GenerationJobResponse } from "../../../lib/schemas/generate";

type PageState = "loading" | "ready" | "error";

export default function GenerateResultPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = typeof params?.jobId === "string" ? params.jobId : "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [job, setJob] = useState<GenerationJobResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (!jobId) {
        setPageState("error");
        setErrorMessage("Generation job missing. Start again from recommendations.");
        return;
      }

      try {
        const nextJob = await getGenerationJob(jobId);

        if (cancelled) {
          return;
        }

        setJob(nextJob);
        setPageState("ready");
        setErrorMessage(null);

        if (nextJob.status === "RUNNING" || nextJob.status === "PENDING") {
          timeoutId = setTimeout(() => {
            void poll();
          }, 800);
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        setPageState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load this generation job right now.",
        );
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

  if (pageState === "error") {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-rose-400/30 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
            Generation job
          </p>
          <h1 className="text-3xl font-semibold text-white">
            We could not load this result.
          </h1>
          <p className="text-base text-slate-300">
            {errorMessage ?? "Please start a new generation from the recommendation page."}
          </p>
          <Link
            href="/"
            className="inline-flex w-fit rounded-full bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200"
          >
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Generation flow
            </p>
            <h1 className="text-4xl font-semibold text-white">
              Mocked result pipeline
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              This page polls the mocked generation job until the deterministic
              assets are ready.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            Upload another avatar
          </Link>
        </div>

        {job ? (
          <>
            <JobProgress status={job.status} progress={job.progress} />
            {job.result ? <ResultViewer result={job.result} /> : null}
            {job.status === "FAILED" ? (
              <section className="rounded-[2rem] border border-rose-400/30 bg-rose-400/10 p-6 text-rose-100">
                {job.errorMessage ?? "This mock generation failed."}
              </section>
            ) : null}
          </>
        ) : (
          <JobProgress
            status="RUNNING"
            progress={{
              label: "Queued",
              message: "Loading your generation job.",
              percent: 10,
            }}
          />
        )}
      </div>
    </main>
  );
}
