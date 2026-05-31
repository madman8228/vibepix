"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { AnalysisSummary } from "../../components/recommend/analysis-summary";
import { RecommendationStrip } from "../../components/recommend/recommendation-strip";
import {
  getRecommendations,
  startGeneration,
  updateRecommendationSelection,
  type RecommendationResponse,
} from "../../lib/api";
import type { RecommendationSelectionState, TierKey } from "../../lib/types";

type RecommendationPageState = "loading" | "ready" | "error";

function normalizeTierKey(value: string | null): TierKey {
  return value === "plus" ? "plus" : "free";
}

function buildSelectionState(
  payload: RecommendationResponse,
): RecommendationSelectionState {
  return {
    selectedStyleKey: payload.selectedStyleKey,
    selectedModeKey: payload.selectedModeKey,
    selectedGameplayKey: payload.selectedGameplayKey,
  };
}

function RecommendationPageContent() {
  const router = useRouter();
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
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isStartingGeneration, setIsStartingGeneration] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  function applySelection(selection: RecommendationSelectionState) {
    setSelectedStyleId(selection.selectedStyleKey);
    setSelectedModeId(selection.selectedModeKey);
    setSelectedGameplayId(selection.selectedGameplayKey);
  }

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
    setSelectionError(null);

    getRecommendations(uploadSessionId, tierKey)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setPayload(response);
        applySelection(buildSelectionState(response));
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

  async function persistSelection(partial: Partial<RecommendationSelectionState>) {
    if (!payload) {
      return;
    }

    const previousSelection: RecommendationSelectionState = {
      selectedStyleKey: selectedStyleId,
      selectedModeKey: selectedModeId,
      selectedGameplayKey: selectedGameplayId,
    };
    const nextSelection: RecommendationSelectionState = {
      ...previousSelection,
      ...partial,
    };

    applySelection(nextSelection);
    setSelectionError(null);
    setIsSavingSelection(true);

    try {
      const savedSelection = await updateRecommendationSelection(
        payload.recommendationId,
        nextSelection,
      );

      applySelection(savedSelection);
    } catch (error: unknown) {
      applySelection(previousSelection);
      setSelectionError(
        error instanceof Error
          ? error.message
          : "We could not save that pick. Please try again.",
      );
    } finally {
      setIsSavingSelection(false);
    }
  }

  async function handleStartGeneration() {
    if (
      !payload ||
      !selectedStyleId ||
      !selectedModeId ||
      !selectedGameplayId
    ) {
      setGenerationError("Choose one option in each section before generating.");
      return;
    }

    setGenerationError(null);
    setIsStartingGeneration(true);

    try {
      const job = await startGeneration({
        recommendationId: payload.recommendationId,
        selectedStyleKey: selectedStyleId,
        selectedModeKey: selectedModeId,
        selectedGameplayKey: selectedGameplayId,
      });

      router.push(job.redirectTo);
    } catch (error: unknown) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Generation could not be started right now.",
      );
    } finally {
      setIsStartingGeneration(false);
    }
  }

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
              onSelect={(selectedStyleKey) =>
                void persistSelection({ selectedStyleKey })
              }
              disabled={isSavingSelection}
            />
            <RecommendationStrip
              title="Recommended modes"
              items={payload.recommendations.modes}
              selectedId={selectedModeId}
              onSelect={(selectedModeKey) =>
                void persistSelection({ selectedModeKey })
              }
              disabled={isSavingSelection}
            />
            <RecommendationStrip
              title="Recommended gameplay"
              items={payload.recommendations.gameplay}
              selectedId={selectedGameplayId}
              onSelect={(selectedGameplayKey) =>
                void persistSelection({ selectedGameplayKey })
              }
              disabled={isSavingSelection}
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
              This recommendation set is saved and ready for a mocked generation
              run.
            </p>
            <p
              className={`text-sm ${
                selectionError ? "text-rose-300" : "text-slate-500"
              }`}
            >
              {selectionError
                ? selectionError
                : isSavingSelection
                  ? "Saving your current picks..."
                  : "Your latest selection is saved with this recommendation set."}
            </p>
            <button
              type="button"
              onClick={() => void handleStartGeneration()}
              disabled={isSavingSelection || isStartingGeneration}
              className="inline-flex w-fit rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isStartingGeneration ? "Starting generation..." : "Generate result"}
            </button>
            <p
              className={`text-sm ${
                generationError ? "text-rose-300" : "text-slate-500"
              }`}
            >
              {generationError
                ? generationError
                : "We will open a live result page and poll until the mock output is ready."}
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
