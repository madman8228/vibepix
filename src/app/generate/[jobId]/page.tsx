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
        setErrorMessage("缺少结果信息，请回到前一步重试。");
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
        setErrorMessage(error instanceof Error ? error.message : "暂时无法读取这个结果。");
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
      <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[rgba(178,85,77,0.2)] bg-[rgba(255,253,249,0.94)] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b2554d]">
            这次结果
          </p>
          <h1 className="font-display mt-4 text-4xl text-[var(--ink)]">暂时没能读到结果</h1>
          <p className="mt-4 text-base leading-7 text-[var(--ink-soft)]">
            {errorMessage ?? "请回到玩法页再试一次。"}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
          >
            回到首页
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]">
          这是兼容结果页。正式体验已经回到首页，你也可以直接在那里上传头像、选玩法并查看结果。
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
              这次结果
            </p>
            <h1 className="font-display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">
              一次，只看一个结果
            </h1>
          </div>
          {job ? (
            <Link
              href="/"
              className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
            >
              回到首页
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
              label: "准备中",
              message: "正在载入这次结果。",
              percent: 10,
            }}
          />
        )}
      </div>
    </main>
  );
}
