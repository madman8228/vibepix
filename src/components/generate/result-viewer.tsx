import type { PlayJobResponse } from "../../lib/schemas/generate";

export function ResultViewer({ job }: { job: PlayJobResponse }) {
  if (!job.result) {
    return null;
  }

  if (job.result.kind === "text") {
    return (
      <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Play result
          </p>
          <h2 className="text-3xl font-semibold text-white">{job.result.title}</h2>
          <p className="max-w-3xl text-base text-slate-300">{job.result.summary}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {job.result.highlights.map((highlight) => (
            <article
              key={highlight}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-200"
            >
              {highlight}
            </article>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-5 text-amber-50">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">Suggestion</p>
          <p className="mt-2 text-sm leading-6">{job.result.suggestion}</p>
        </div>

        <p className="text-sm text-slate-400">{job.result.disclaimer}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Play result</p>
        <h2 className="text-3xl font-semibold text-white">{job.result.title}</h2>
        <p className="max-w-3xl text-base text-slate-300">{job.result.summary}</p>
      </div>

      <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40">
        <img src={job.result.imageUrl} alt={job.result.altText} className="aspect-square w-full object-cover" />
        <div className="space-y-2 p-5">
          <p className="text-sm text-slate-300">{job.result.altText}</p>
        </div>
      </article>
    </section>
  );
}
