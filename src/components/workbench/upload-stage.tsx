import type { ReactNode } from "react";

import type { AvatarAnalysis } from "../../lib/types";

export function UploadStage(props: {
  previewUrl: string | null;
  analysis: AvatarAnalysis | null;
  isPreparing: boolean;
  errorMessage: string | null;
  onSelectFile: (file: File) => void;
  onReselect: () => void;
  onEditCrop: () => void;
  children?: ReactNode;
}) {
  return props.previewUrl ? (
    <section
      aria-label="上传头像"
      className="grid gap-5 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(6,18,34,0.08)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            头像区域
          </p>
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.55rem]">
            先看看这张头像
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            头像会先留在这里。你可以轻裁剪一下画面，再继续下面的玩法。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={props.onEditCrop}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--panel-strong)]"
          >
            裁剪头像
          </button>
          <label className="cursor-pointer rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--panel-strong)]">
            重新上传
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];

                if (file) {
                  props.onReselect();
                  props.onSelectFile(file);
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[#dfe8fb]">
            <img
              src={props.previewUrl}
              alt="已上传头像"
              className="block aspect-[4/5] w-full object-cover"
            />
          </div>

          {props.analysis ? (
            <div className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4">
              <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
                头像小结
              </p>
              <p className="text-base leading-8 tracking-[-0.02em] text-[var(--ink)] sm:text-[1.05rem]">
                {props.analysis.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {props.analysis.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--line)] bg-[var(--chip)] px-3 py-1 text-xs text-[var(--ink-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : props.isPreparing ? (
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 text-sm leading-6 text-[var(--ink-soft)]">
              正在读取这张头像的气质和推荐玩法。
            </div>
          ) : null}

          {props.errorMessage ? (
            <div className="rounded-[1.5rem] border border-[rgba(255,109,109,0.18)] bg-[rgba(255,109,109,0.06)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
              {props.errorMessage}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">{props.children}</div>
      </div>
    </section>
  ) : (
    <section
      aria-label="上传头像"
      className="grid gap-5 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(6,18,34,0.08)] sm:p-6"
    >
      <div className="grid gap-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
          头像玩法
        </p>
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-[2.35rem]">
          设计你的专属头像
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
          先上传一张头像。你可以在当前页面里轻裁剪，再直接继续解读或出图玩法。
        </p>
      </div>

      <label className="grid min-h-[24rem] cursor-pointer place-items-center rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(239,244,255,0.92))] p-6 text-center transition hover:border-[var(--accent)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(232,240,255,0.96))] sm:min-h-[28rem]">
        <input
          aria-label="Avatar upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];

            if (file) {
              props.onSelectFile(file);
              event.currentTarget.value = "";
            }
          }}
        />

        <div className="grid gap-4">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(95,118,255,0.18),rgba(130,255,185,0.2))] text-3xl text-[var(--ink)] shadow-[0_18px_50px_rgba(95,118,255,0.18)]">
            ↗
          </div>
          <div className="grid gap-2">
            <p className="text-base font-medium text-[var(--ink)] sm:text-lg">点击上传图片</p>
            <p className="text-sm text-[var(--ink-soft)]">支持 JPG、PNG 格式</p>
          </div>
        </div>
      </label>
    </section>
  );
}
