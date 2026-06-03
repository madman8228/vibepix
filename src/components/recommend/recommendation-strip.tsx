import type { PlayDescriptor, PlayType } from "../../lib/types";

type RecommendationStripProps = {
  title: string;
  subtitle: string;
  items: PlayDescriptor[];
  onStart: (playType: PlayType) => void;
  disabled?: boolean;
};

function toneClasses(category: PlayDescriptor["category"]) {
  return category === "text"
    ? {
        badge: "bg-amber-300/15 text-amber-200 border-amber-300/20",
        button: "bg-amber-300 text-slate-950 hover:bg-amber-200",
      }
    : {
        badge: "bg-cyan-300/15 text-cyan-200 border-cyan-300/20",
        button: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
      };
}

export function RecommendationStrip({
  title,
  subtitle,
  items,
  onStart,
  disabled = false,
}: RecommendationStripProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Recommended plays</p>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const tone = toneClasses(item.category);

          return (
            <article
              key={item.playType}
              className="group flex h-full flex-col justify-between rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.badge}`}>
                      {item.category === "text" ? "Text play" : "Image play"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Single result
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-200">{item.reason}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onStart(item.playType)}
                className={`mt-6 inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${tone.button}`}
              >
                Start {item.title}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
