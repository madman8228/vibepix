import type { PlayJobProgress, PlayJobStatus } from "../../lib/schemas/generate";

type JobProgressProps = {
  status: PlayJobStatus;
  progress: PlayJobProgress;
};

export function JobProgress({ status, progress }: JobProgressProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {progress.label}
          </p>
          <h2 className="text-3xl font-semibold text-white">
            {status === "SUCCEEDED" ? "Play result ready" : "Building your selected play"}
          </h2>
          <p className="max-w-2xl text-base text-slate-300">{progress.message}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
          Status: <span className="font-semibold text-white">{status}</span>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 transition-[width] duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">{progress.percent}% complete</p>
      </div>
    </section>
  );
}
