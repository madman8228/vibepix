import type { GenerationResult } from "../../lib/schemas/generate";

type ResultViewerProps = {
  result: GenerationResult;
};

export function ResultViewer({ result }: ResultViewerProps) {
  return (
    <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Result package
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Your mocked generation output
          </h2>
          <p className="max-w-3xl text-base text-slate-300">{result.summary}</p>
        </div>
        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
          <p>
            Style: <span className="font-semibold text-white">{result.selection.styleTitle ?? "Unknown"}</span>
          </p>
          <p>
            Mode: <span className="font-semibold text-white">{result.selection.modeTitle ?? "Unknown"}</span>
          </p>
          <p>
            Gameplay: <span className="font-semibold text-white">{result.selection.gameplayTitle ?? "Unknown"}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {result.assets.map((asset) => (
          <article
            key={asset.id}
            className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40"
          >
            <img
              src={asset.imageUrl}
              alt={asset.altText}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                {asset.panelIndex === null
                  ? "Generated asset"
                  : `Panel ${asset.panelIndex + 1}`}
              </p>
              <h3 className="text-xl font-semibold text-white">{asset.title}</h3>
              <p className="text-sm text-slate-300">{asset.altText}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
