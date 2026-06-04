import type { AvatarAnalysis } from "../../lib/types";

export function AnalysisSummary({ analysis }: { analysis: AvatarAnalysis }) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,249,0.92)] p-5 shadow-[0_18px_60px_rgba(88,67,44,0.06)] sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)] lg:items-start">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            头像小结
          </p>
          <h2 className="font-display mt-3 text-[2rem] leading-tight text-[var(--ink)] sm:text-[2.35rem]">
            这张头像给人的第一感觉
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-8 text-[var(--ink-soft)] sm:text-base">
            {analysis.summary}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/68 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            更接近的气质
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--line)] bg-[var(--paper-strong)] px-3 py-1.5 text-sm text-[var(--ink-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
