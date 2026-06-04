import type { PlayJobProgress, PlayJobStatus } from "../../lib/schemas/generate";

type JobProgressProps = {
  status: PlayJobStatus;
  progress: PlayJobProgress;
};

export function JobProgress({ status, progress }: JobProgressProps) {
  return (
    <section className="rounded-[1.8rem] border border-[var(--line)] bg-[rgba(255,253,249,0.88)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            {progress.label}
          </p>
          <h2 className="font-display mt-3 text-3xl text-[var(--ink)]">
            {status === "SUCCEEDED" ? "结果已经准备好了" : "正在生成这次结果"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{progress.message}</p>
        </div>
        <div className="text-sm text-[var(--ink-soft)]">{progress.percent}%</div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(92,78,66,0.08)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#d7b28a_0%,#c88f68_100%)] transition-[width] duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </section>
  );
}
