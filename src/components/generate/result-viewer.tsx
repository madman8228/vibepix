import type { PlayJobResponse } from "../../lib/schemas/generate";

export function ResultViewer({ job }: { job: PlayJobResponse }) {
  if (!job.result) {
    return null;
  }

  if (job.result.kind === "text") {
    return (
      <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,249,0.96)] p-6 shadow-[0_20px_70px_rgba(88,67,44,0.08)] sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          这次的解读
        </p>
        <h2 className="font-display mt-4 text-4xl leading-tight text-[var(--ink)]">
          {job.result.title}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          {job.result.summary}
        </p>

        <div className="mt-8 space-y-3">
          {job.result.highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="rounded-[1.4rem] border border-[var(--line)] bg-white/82 px-5 py-4 text-sm leading-7 text-[var(--ink)]"
            >
              <span className="mr-3 text-[var(--ink-soft)]">0{index + 1}</span>
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.6rem] bg-[var(--accent-soft)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            一句建议
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{job.result.suggestion}</p>
        </div>

        <p className="mt-6 text-xs leading-6 text-[var(--ink-soft)]">{job.result.disclaimer}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,249,0.96)] p-5 shadow-[0_20px_70px_rgba(88,67,44,0.08)] sm:p-6">
      <div className="px-1 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          这次的结果
        </p>
        <h2 className="font-display mt-4 text-4xl leading-tight text-[var(--ink)]">
          {job.result.title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          {job.result.summary}
        </p>
      </div>

      <article className="overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-white">
        <img src={job.result.imageUrl} alt={job.result.altText} className="aspect-square w-full object-cover" />
      </article>

      <p className="mt-4 px-1 text-sm leading-7 text-[var(--ink-soft)]">{job.result.altText}</p>
    </section>
  );
}
