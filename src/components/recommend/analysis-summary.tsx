import type { AvatarAnalysis } from "../../lib/types";

export function AnalysisSummary({ analysis }: { analysis: AvatarAnalysis }) {
  return (
    <section className="rounded-[2rem] border border-cyan-300/15 bg-white/5 p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Visible analysis</p>
          <h2 className="text-2xl font-semibold text-white">What your avatar gives off</h2>
          <p className="max-w-3xl text-base leading-7 text-slate-300">{analysis.summary}</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Detected tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100"
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
