"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AnalysisSummary } from "../../components/recommend/analysis-summary";
import { MoodPreviewTable } from "../../components/recommend/mood-preview-table";
import { RecommendationStrip } from "../../components/recommend/recommendation-strip";
import { getPlayLobby, startPlay, type PlayLobbyResponse, type PlayType } from "../../lib/api";

function RecommendationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadSessionId = searchParams.get("uploadSessionId");
  const [payload, setPayload] = useState<PlayLobbyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingPlay, setIsStartingPlay] = useState<PlayType | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!uploadSessionId) {
      setErrorMessage("Upload session missing. Start again from the home page.");
      return () => {
        cancelled = true;
      };
    }

    getPlayLobby(uploadSessionId)
      .then((nextPayload) => {
        if (!cancelled) {
          setPayload(nextPayload);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "We could not load the play lobby right now.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uploadSessionId]);

  async function handleStartPlay(playType: PlayType) {
    if (!payload) {
      return;
    }

    setIsStartingPlay(playType);

    try {
      const job = await startPlay({
        uploadSessionId: payload.uploadSessionId,
        playType,
      });

      router.push(job.redirectTo);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "This play could not be started right now.",
      );
      setIsStartingPlay(null);
    }
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-rose-400/30 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Play lobby</p>
          <h1 className="text-3xl font-semibold text-white">We could not open this avatar experience.</h1>
          <p className="text-base text-slate-300">{errorMessage}</p>
          <Link href="/" className="inline-flex w-fit rounded-full bg-rose-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-200">
            Back to upload
          </Link>
        </div>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Play lobby</p>
          <h1 className="text-3xl font-semibold text-white">Opening your play lobby</h1>
          <p className="text-base text-slate-300">Checking the avatar summary and lining up the first recommended plays.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Play lobby</p>
            <h1 className="text-4xl font-semibold text-white">Your avatar play lobby</h1>
            <p className="max-w-2xl text-base text-slate-300">
              推荐区优先给你一条解读和四个出图方向；如果你更清楚想玩什么，也可以直接从固定玩法里开始。
            </p>
          </div>
          <Link href="/" className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
            Upload another avatar
          </Link>
        </div>

        <AnalysisSummary analysis={payload.analysis} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <RecommendationStrip
            title="Recommended plays"
            subtitle="Five suggestions based on the visible avatar analysis: one text read and four image-driven plays."
            items={payload.recommendedPlays}
            onStart={(playType) => void handleStartPlay(playType)}
            disabled={isStartingPlay !== null}
          />

          <div className="space-y-6">
            <MoodPreviewTable />
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Single-result rule</p>
              <h3 className="mt-2 text-xl font-semibold text-white">一次只跑一个玩法</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                结果页会只返回一个解读卡片或一张图，便于快速评分、切换玩法，也更接近轻娱乐产品的节奏。
              </p>
            </section>
          </div>
        </div>

        <RecommendationStrip
          title="All fixed plays"
          subtitle="You can ignore the recommendations and start any available play directly."
          items={payload.availablePlays}
          onStart={(playType) => void handleStartPlay(playType)}
          disabled={isStartingPlay !== null}
        />
      </div>
    </main>
  );
}

function RecommendationPageFallback() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Play lobby</p>
        <h1 className="text-3xl font-semibold text-white">Opening your play lobby</h1>
      </div>
    </main>
  );
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<RecommendationPageFallback />}>
      <RecommendationPageContent />
    </Suspense>
  );
}
