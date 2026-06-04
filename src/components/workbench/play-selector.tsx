import type { PlayDescriptor, PlayType } from "../../lib/types";

type PrimaryPlayKey =
  | "read"
  | "mood_mode"
  | "story_mode"
  | "style_swap"
  | "new_avatar"
  | "poster";

export type VariantOption = {
  key: string;
  label: string;
  emoji?: string;
  description?: string;
};

export const moodVariantOptions: VariantOption[] = [
  { key: "happy", label: "开心", emoji: "😊", description: "快乐愉悦" },
  { key: "sad", label: "悲伤", emoji: "😢", description: "伤心难过" },
  { key: "angry", label: "生气", emoji: "😠", description: "愤怒不满" },
  { key: "fear", label: "害怕", emoji: "😨", description: "恐惧不安" },
  { key: "surprised", label: "惊讶", emoji: "😲", description: "震惊意外" },
  { key: "cool", label: "酷酷", emoji: "😎", description: "帅气自信" },
  { key: "lost", label: "迷茫", emoji: "😕", description: "困惑思考" },
  { key: "regret", label: "后悔", emoji: "😔", description: "失落遗憾" },
  { key: "sleepy", label: "困倦", emoji: "🥱", description: "疲惫慵懒" },
  { key: "excited", label: "兴奋", emoji: "🤩", description: "激动期待" },
  { key: "in-love", label: "恋爱", emoji: "🥰", description: "甜蜜温馨" },
  { key: "proud", label: "骄傲", emoji: "🫡", description: "自信自豪" },
] as const;

export const storyVariantOptions: VariantOption[] = [
  { key: "midnight-city", label: "夜色主角", description: "像电影开场一样有故事感" },
  { key: "campus-light", label: "午后校园", description: "轻松明亮，像青春片定格" },
  { key: "street-neon", label: "街头霓光", description: "更潮一点，也更有张力" },
  { key: "rain-scene", label: "雨天镜头", description: "氛围更安静，像一帧剧情截图" },
] as const;

const primaryTabs: Array<{
  key: PrimaryPlayKey;
  label: string;
  description: string;
}> = [
  { key: "read", label: "解读", description: "先读一眼这张头像给人的感觉。" },
  { key: "mood_mode", label: "心情", description: "把当前情绪变成一张单图。" },
  { key: "story_mode", label: "剧情", description: "把头像放进一个更有故事感的画面里。" },
  { key: "style_swap", label: "换风格", description: "保留你本身，再换一个新气质。" },
  { key: "new_avatar", label: "新头像", description: "从原头像出发，生成新的头像版本。" },
  { key: "poster", label: "海报", description: "更像一张完整作品，更适合展示。" },
] as const;

const readOptions: Array<{
  playType: PlayType;
  label: string;
}> = [
  { playType: "personality_read", label: "性格解读" },
  { playType: "daily_fortune", label: "今日运势" },
  { playType: "social_aura", label: "社交气场" },
] as const;

function getPrimaryPlayKey(playType: PlayType): PrimaryPlayKey {
  if (
    playType === "personality_read" ||
    playType === "daily_fortune" ||
    playType === "social_aura"
  ) {
    return "read";
  }

  return playType;
}

function getPlayDescriptor(playType: PlayType, availablePlays: PlayDescriptor[]) {
  return availablePlays.find((play) => play.playType === playType) ?? null;
}

export function PlaySelector(props: {
  availablePlays: PlayDescriptor[];
  recommendedPlays: PlayDescriptor[];
  activePlay: PlayType;
  onSelectPlay: (playType: PlayType) => void;
  moodVariant: string;
  onSelectMoodVariant: (key: string) => void;
  storyVariant: string;
  onSelectStoryVariant: (key: string) => void;
  onRunPlay: () => void;
  isRunning: boolean;
}) {
  const activePrimaryKey = getPrimaryPlayKey(props.activePlay);
  const activeDescriptor = getPlayDescriptor(props.activePlay, props.availablePlays);
  const recommendedKeys = new Set(
    props.recommendedPlays.map((play) => getPrimaryPlayKey(play.playType)),
  );

  return (
    <section
      aria-label="玩法选择"
      className="grid gap-5 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(6,18,34,0.08)] sm:p-6"
    >
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            玩法选择
          </p>
          {props.recommendedPlays.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {props.recommendedPlays.map((play) => (
                <span
                  key={play.playType}
                  className="rounded-full border border-[var(--line-strong)] bg-[var(--chip)] px-3 py-1 text-xs text-[var(--ink-soft)]"
                >
                  推荐 · {play.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.55rem]">
          今天适合先玩哪个？
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          先选一个方向，再在下方继续细化。整个过程都留在这一页里完成。
        </p>
      </div>

      <div
        role="tablist"
        aria-label="玩法选择"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
      >
        {primaryTabs.map((tab) => {
          const isActive = activePrimaryKey === tab.key;
          const isRecommended = recommendedKeys.has(tab.key);

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (tab.key === "read") {
                  props.onSelectPlay("personality_read");
                  return;
                }

                props.onSelectPlay(tab.key);
              }}
              className={`group grid min-h-16 gap-1 rounded-[1.4rem] border px-4 py-3 text-left transition ${
                isActive
                  ? "border-[var(--accent)] bg-[linear-gradient(135deg,rgba(95,118,255,0.16),rgba(130,255,185,0.16))] text-[var(--ink)] shadow-[0_12px_30px_rgba(95,118,255,0.14)]"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-strong)]"
              }`}
            >
              <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span>{tab.label}</span>
                {isRecommended ? (
                  <span className="rounded-full bg-[var(--chip)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    推荐
                  </span>
                ) : null}
              </span>
              <span className="text-xs leading-5 text-[var(--ink-soft)]">
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {activePrimaryKey === "read" ? (
        <div className="grid gap-3">
          <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
            先选一张你想看的解读卡
          </p>
          <div className="flex flex-wrap gap-2">
            {readOptions.map((option) => {
              const isActive = props.activePlay === option.playType;

              return (
                <button
                  key={option.playType}
                  type="button"
                  onClick={() => props.onSelectPlay(option.playType)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--ink)] text-white"
                      : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--panel-strong)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {activePrimaryKey === "mood_mode" ? (
        <div className="grid gap-3">
          <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
            选一个现在最接近的心情
          </p>
          <div
            aria-label="心情选项"
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6"
          >
            {moodVariantOptions.map((option) => {
              const isActive = props.moodVariant === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => props.onSelectMoodVariant(option.key)}
                  className={`grid min-h-24 place-items-center gap-1 rounded-[1.35rem] border px-3 py-4 text-center transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[linear-gradient(135deg,rgba(95,118,255,0.16),rgba(130,255,185,0.16))] shadow-[0_12px_30px_rgba(95,118,255,0.12)]"
                      : "border-[var(--line)] bg-white hover:bg-[var(--panel-strong)]"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium text-[var(--ink)]">{option.label}</span>
                  <span className="text-[11px] leading-5 text-[var(--ink-soft)]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {activePrimaryKey === "story_mode" ? (
        <div className="grid gap-3">
          <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
            选一个你更想进入的剧情画面
          </p>
          <div
            aria-label="剧情选项"
            className="grid gap-3 sm:grid-cols-2"
          >
            {storyVariantOptions.map((option) => {
              const isActive = props.storyVariant === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => props.onSelectStoryVariant(option.key)}
                  className={`grid gap-1 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-[var(--accent)] bg-[linear-gradient(135deg,rgba(95,118,255,0.16),rgba(130,255,185,0.16))] shadow-[0_12px_30px_rgba(95,118,255,0.12)]"
                      : "border-[var(--line)] bg-white hover:bg-[var(--panel-strong)]"
                  }`}
                >
                  <span className="text-sm font-semibold text-[var(--ink)]">{option.label}</span>
                  <span className="text-xs leading-6 text-[var(--ink-soft)]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-2">
          <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
            当前玩法
          </p>
          <h3 className="text-lg font-semibold text-[var(--ink)]">
            {activeDescriptor?.title ?? "准备开始"}
          </h3>
          <p className="text-sm leading-6 text-[var(--ink-soft)]">
            {activeDescriptor?.description ?? "上传头像后，就可以从这里开始。"}
          </p>
        </div>

        <button
          type="button"
          onClick={props.onRunPlay}
          disabled={props.isRunning}
          className="min-h-12 rounded-full bg-[var(--ink)] px-6 text-sm font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.isRunning ? "正在生成" : `开始${activeDescriptor?.title ?? "玩法"}`}
        </button>
      </div>
    </section>
  );
}
