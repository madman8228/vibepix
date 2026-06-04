import { RatingPanel } from "../generate/rating-panel";
import type { PlayJobResponse } from "../../lib/schemas/generate";

export function InlineResultPanel(props: {
  job: PlayJobResponse | null;
  isRunning: boolean;
  errorMessage: string | null;
  onRate: (score: number) => Promise<void>;
}) {
  return (
    <section
      aria-label="当前结果"
      className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(6,18,34,0.08)] sm:p-6"
    >
      <div className="grid gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          当前结果
        </p>
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.55rem]">
          结果会在这里展开
        </h2>
      </div>

      {props.errorMessage ? (
        <div className="rounded-[1.5rem] border border-[rgba(255,109,109,0.18)] bg-[rgba(255,109,109,0.06)] p-4 text-sm leading-6 text-[var(--ink)]">
          {props.errorMessage}
        </div>
      ) : null}

      {!props.job && !props.isRunning ? (
        <div className="grid gap-2 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--panel-strong)] p-6">
          <p className="text-base font-medium text-[var(--ink)]">
            先在上面选一个玩法。
          </p>
          <p className="text-sm leading-6 text-[var(--ink-soft)]">
            文字玩法会给你一张轻解读卡，生成玩法会在这里直接展开单张结果图。
          </p>
        </div>
      ) : null}

      {props.job?.status === "RUNNING" || props.isRunning ? (
        <div className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {props.job?.progress.label ?? "Preparing"}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                {props.job?.progress.message ?? "正在为这张头像准备结果。"}
              </p>
            </div>
            <p className="text-sm font-medium text-[var(--ink-soft)]">
              {props.job?.progress.percent ?? 12}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-[width] duration-300"
              style={{ width: `${props.job?.progress.percent ?? 12}%` }}
            />
          </div>
        </div>
      ) : null}

      {props.job?.status === "SUCCEEDED" && props.job.result?.kind === "text" ? (
        <div className="grid gap-5 rounded-[1.65rem] border border-[var(--line)] bg-white p-5 sm:p-6">
          <div className="grid gap-2">
            <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
              {props.job.result.title}
            </p>
            <p className="text-[1.35rem] leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-[1.7rem]">
              {props.job.result.summary}
            </p>
          </div>

          <ul className="grid gap-3">
            {props.job.result.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--panel-strong)] px-4 py-3 text-sm leading-6 text-[var(--ink)]"
              >
                {highlight}
              </li>
            ))}
          </ul>

          <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--chip)] px-4 py-4">
            <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
              小建议
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
              {props.job.result.suggestion}
            </p>
          </div>

          <p className="text-xs leading-6 text-[var(--ink-soft)]">
            {props.job.result.disclaimer}
          </p>
        </div>
      ) : null}

      {props.job?.status === "SUCCEEDED" && props.job.result?.kind === "image" ? (
        <div className="grid gap-4 rounded-[1.65rem] border border-[var(--line)] bg-white p-4 sm:p-5">
          <div className="grid gap-2">
            <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
              {props.job.result.title}
            </p>
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              {props.job.result.summary}
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[#0a1323]">
            <img
              src={props.job.result.imageUrl}
              alt={props.job.result.altText}
              className="block aspect-square w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {props.job?.status === "SUCCEEDED" ? (
        <RatingPanel value={props.job.rating.score} onRate={props.onRate} />
      ) : null}
    </section>
  );
}
