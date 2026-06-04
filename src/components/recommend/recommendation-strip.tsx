import type { PlayDescriptor, PlayType } from "../../lib/types";

type RecommendationStripProps = {
  title: string;
  subtitle: string;
  items: PlayDescriptor[];
  onStart: (playType: PlayType) => void;
  disabled?: boolean;
  variant?: "recommended" | "catalog";
};

export function RecommendationStrip({
  title,
  subtitle,
  items,
  onStart,
  disabled = false,
  variant = "recommended",
}: RecommendationStripProps) {
  const isCatalog = variant === "catalog";

  return (
    <section
      className={`rounded-[2rem] border border-[var(--line)] ${
        isCatalog ? "bg-white/65" : "bg-[rgba(255,253,249,0.94)]"
      } p-5 shadow-[0_18px_60px_rgba(88,67,44,0.05)] sm:p-6`}
    >
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          {isCatalog ? "全部玩法" : "推荐玩法"}
        </p>
        <h2 className="font-display text-[2rem] leading-tight text-[var(--ink)] sm:text-[2.25rem]">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-[15px]">
          {subtitle}
        </p>
      </div>

      <div
        className={`mt-6 grid gap-4 ${
          isCatalog ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 xl:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <article
            key={item.playType}
            className={`flex h-full flex-col justify-between rounded-[1.5rem] border border-[var(--line)] ${
              isCatalog
                ? "bg-white/78"
                : item.category === "text"
                  ? "bg-[linear-gradient(180deg,rgba(255,248,239,0.96),rgba(255,255,255,0.98))]"
                  : "bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(247,239,232,0.92))]"
            } p-4 sm:p-5`}
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                {item.category === "text" ? "解读" : "出图"}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
              {!isCatalog ? (
                <div className="mt-4 rounded-[1.1rem] border border-[var(--line)] bg-white/64 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                    为什么先推荐它
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--ink)]">{item.reason}</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onStart(item.playType)}
              aria-label={`开始${item.title}`}
              className={`mt-5 inline-flex w-fit rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                isCatalog
                  ? "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
                  : "border-transparent bg-[var(--ink)] text-white hover:opacity-90"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isCatalog ? "开始" : "试试这个"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
