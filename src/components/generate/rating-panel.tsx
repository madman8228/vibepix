"use client";

import { useState } from "react";

const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export function RatingPanel({
  value,
  onRate,
}: {
  value: number | null;
  onRate: (score: number) => Promise<void>;
}) {
  const [pendingScore, setPendingScore] = useState<number | null>(null);
  const [thanksVisible, setThanksVisible] = useState(false);

  async function handleRate(score: number) {
    setPendingScore(score);
    setThanksVisible(false);

    try {
      await onRate(score);
      setThanksVisible(true);
    } finally {
      setPendingScore(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Rate this result</p>
        <h2 className="text-2xl font-semibold text-white">Optional half-star feedback</h2>
        <p className="text-sm text-slate-300">
          Your rating helps us compare prompts and play quality without blocking your next action.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {ratingOptions.map((score) => {
          const isSelected = value === score;
          const isPending = pendingScore === score;

          return (
            <button
              key={score}
              type="button"
              disabled={pendingScore !== null}
              onClick={() => void handleRate(score)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "border-amber-300 bg-amber-300/15 text-amber-100"
                  : "border-white/10 bg-slate-950/40 text-slate-200 hover:border-amber-300/30 hover:bg-white/10"
              } ${pendingScore !== null ? "cursor-not-allowed opacity-70" : ""}`}
              aria-label={`${score} stars`}
            >
              {isPending ? "Saving..." : `${score}★`}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Current rating: <span className="font-semibold text-white">{value ?? "Not rated yet"}</span>
      </p>
      {thanksVisible ? <p className="mt-2 text-sm text-emerald-300">Thanks for rating.</p> : null}
    </section>
  );
}
