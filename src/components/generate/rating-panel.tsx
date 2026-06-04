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
    <section className="rounded-[1.8rem] border border-[var(--line)] bg-white/78 p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          可选评分
        </p>
        <h2 className="font-display text-3xl text-[var(--ink)]">这次结果你喜欢吗？</h2>
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          不想评分也没关系，你可以直接回去继续玩别的玩法。
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
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isSelected
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
              } ${pendingScore !== null ? "cursor-not-allowed opacity-60" : ""}`}
              aria-label={`${score} stars`}
            >
              {isPending ? "保存中" : `${score}★`}
            </button>
          );
        })}
      </div>

      {thanksVisible ? (
        <p className="mt-4 text-sm text-[var(--ink-soft)]">谢谢反馈。</p>
      ) : null}
    </section>
  );
}
