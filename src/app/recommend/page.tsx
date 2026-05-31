"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AnalysisSummary } from "../../components/recommend/analysis-summary";
import { RecommendationStrip } from "../../components/recommend/recommendation-strip";
import { getRecommendations, type RecommendationResponse } from "../../lib/api";
import type { TierKey } from "../../lib/types";

type RecommendationPageState = "loading" | "ready" | "error";

function normalizeTierKey(value: string | null): TierKey {
  return value === "plus" ? "plus" : "free";
}

function RecommendationPageContent() {
  const searchParams = useSearchParams();
  const uploadSessionId = searchParams.get("uploadSessionId");
  const tierKey = normalizeTierKey(searchParams.get("tierKey"));

  const [pageState, setPageState] = useState<RecommendationPageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [payload, setPayload] = useState<RecommendationResponse | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);
  const [selectedGameplayId, setSelectedGameplayId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    if (!uploadSessionId) {
      setPageState("error");
      setErrorMessage("Upload session missing. Start again from the home page.");
      return () => {
        isActive = false;
      };
    }

    setPageState("loading");
    setErrorMessage(null);

    getRecommendations(uploadSessionId, tierKey)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setPayload(response);
        setSelectedStyleId(response.recommendations.styles[0]?.key ?? null);
        setSelectedModeId(response.recommendations.modes[0]?.key ?? null);
        setSelectedGameplayId(response.recommendations.gameplay[0]?.key ?? null);
        setPageState("ready");
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "We could not load recommendations right now.",
        );
        setPageState("error");
      });

    return () => {
      isActive = false;
    };
  }, [tierKey, uploadSessionId]);

  if (pageState === "error") {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-rose-400/30 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
            Recommendation flow
          </p>
          <h1 className="text-3xl font-semibold text-white">
            We hit a snag loading your picks.
          </h1>
          <p className="text-base text-slate-300">
            {errorMessage ?? "Please try the upload again."}
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

  if (pageState !== "ready" || !payload) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Recommendation flow
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Building your starting set
          </h1>
          <p className="text-base text-slate-300">
            Reviewing your avatar vibes and matching them to a simple story
            package.
          </p>
        </div>
      </main>
    );
  }

  const chosenStyle =
    payload.recommendations.styles.find((item) => item.key === selectedStyleId) ??
    null;
  const chosenMode =
    payload.recommendations.modes.find((item) => item.key === selectedModeId) ??
    null;
  const chosenGameplay =
    payload.recommendations.gameplay.find(
      (item) => item.key === selectedGameplayId,
    ) ?? null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Recommendation flow
            </p>
            <h1 className="text-4xl font-semibold text-white">
              Your first AI story recommendations
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              These are preselected from your upload analysis. You can switch
              between the starter options before generation exists.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            Tier: <span className="font-semibold text-white">{tierKey}</span>
          </div>
        </div>

        <AnalysisSummary analysis={payload.analysis} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <RecommendationStrip
              title="Recommended styles"
              items={payload.recommendations.styles}
              selectedId={selectedStyleId}
              onSelect={setSelectedStyleId}
            />
            <RecommendationStrip
              title="Recommended modes"
              items={payload.recommendations.modes}
              selectedId={selectedModeId}
              onSelect={setSelectedModeId}
            />
            <RecommendationStrip
              title="Recommended gameplay"
              items={payload.recommendations.gameplay}
              selectedId={selectedGameplayId}
              onSelect={setSelectedGameplayId}
            />
          </div>

          <aside className="flex h-fit flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Current picks
            </p>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Style
                </p>
                <p className="mt-1 font-semibold text-white">
                  {chosenStyle?.title ?? "No style selected"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Mode
                </p>
                <p className="mt-1 font-semibold text-white">
                  {chosenMode?.title ?? "No mode selected"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Gameplay
                </p>
                <p className="mt-1 font-semibold text-white">
                  {chosenGameplay?.title ?? "No gameplay selected"}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Generation comes next. This task stops at choosing a recommendation
              set.
            </p>
            <Link
              href="/"
              className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              Upload another avatar
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function RecommendationPageFallback() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-cyan-300/20 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Recommendation flow
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Building your starting set
        </h1>
        <p className="text-base text-slate-300">
          Reviewing your avatar vibes and matching them to a simple story
          package.
        </p>
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
