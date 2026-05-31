import type { RecommendationGroup } from "../../lib/types";

type RecommendationStripProps = {
  title: string;
  items: RecommendationGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function RecommendationStrip({
  title,
  items,
  selectedId,
  onSelect,
}: RecommendationStripProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Recommendation set
        </p>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const isSelected = item.key === selectedId;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(item.key)}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300/10 shadow-lg shadow-cyan-950/20"
                  : "border-white/10 bg-slate-950/40 hover:border-cyan-300/40 hover:bg-white/10"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                {isSelected ? "Selected" : "Available"}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
              <p className="mt-4 text-sm font-medium text-amber-200">
                {item.reason}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
