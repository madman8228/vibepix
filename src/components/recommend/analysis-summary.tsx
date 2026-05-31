import type { AvatarAnalysis } from "../../lib/models/provider-types";

export function AnalysisSummary({ analysis }: { analysis: AvatarAnalysis }) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/15 bg-white/5 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            AI analysis
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Character readout
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            {analysis.summary}
          </p>
        </div>

        <div className="flex max-w-xl flex-wrap gap-2">
          {analysis.vibeTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
