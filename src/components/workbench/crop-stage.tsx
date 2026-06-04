"use client";

import { useEffect, useRef } from "react";

import type { CropRect } from "../../lib/images/crop-image";

type ResizeHandle = "nw" | "ne" | "se" | "sw";

type NormalizedCropRect = CropRect;

type InteractionState =
  | {
      mode: "drag";
      startX: number;
      startY: number;
      startCrop: NormalizedCropRect;
    }
  | {
      mode: "resize";
      handle: ResizeHandle;
      startX: number;
      startY: number;
      startCrop: NormalizedCropRect;
    };

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function nextDragCrop(
  crop: NormalizedCropRect,
  dx: number,
  dy: number,
): NormalizedCropRect {
  return {
    ...crop,
    x: clampValue(crop.x + dx, 0, 1 - crop.width),
    y: clampValue(crop.y + dy, 0, 1 - crop.height),
  };
}

function nextResizeCrop(
  crop: NormalizedCropRect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
): NormalizedCropRect {
  const minimumSize = 0.16;
  let { x, y, width, height } = crop;

  if (handle.includes("w")) {
    const nextX = clampValue(crop.x + dx, 0, crop.x + crop.width - minimumSize);
    width = crop.width + (crop.x - nextX);
    x = nextX;
  }

  if (handle.includes("e")) {
    width = clampValue(crop.width + dx, minimumSize, 1 - crop.x);
  }

  if (handle.includes("n")) {
    const nextY = clampValue(crop.y + dy, 0, crop.y + crop.height - minimumSize);
    height = crop.height + (crop.y - nextY);
    y = nextY;
  }

  if (handle.includes("s")) {
    height = clampValue(crop.height + dy, minimumSize, 1 - crop.y);
  }

  return { x, y, width, height };
}

export function CropStage(props: {
  visible: boolean;
  imageUrl: string | null;
  crop: NormalizedCropRect;
  onChangeCrop: (crop: NormalizedCropRect) => void;
  onSkip: () => void;
  onApply: () => void;
  isApplying: boolean;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<InteractionState | null>(null);

  useEffect(() => {
    if (!props.visible) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const frame = frameRef.current;
      const interaction = interactionRef.current;

      if (!frame || !interaction) {
        return;
      }

      const bounds = frame.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        return;
      }

      const dx = (event.clientX - interaction.startX) / bounds.width;
      const dy = (event.clientY - interaction.startY) / bounds.height;

      const nextCrop =
        interaction.mode === "drag"
          ? nextDragCrop(interaction.startCrop, dx, dy)
          : nextResizeCrop(interaction.startCrop, interaction.handle, dx, dy);

      props.onChangeCrop(nextCrop);
    }

    function handlePointerUp() {
      interactionRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [props]);

  if (!props.visible || !props.imageUrl) {
    return null;
  }

  const cropStyle = {
    left: `${props.crop.x * 100}%`,
    top: `${props.crop.y * 100}%`,
    width: `${props.crop.width * 100}%`,
    height: `${props.crop.height * 100}%`,
  };

  return (
    <div className="grid gap-4 rounded-[1.6rem] border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
            自由裁剪
          </p>
          <p className="text-sm leading-6 text-[var(--ink-soft)]">
            拖动裁剪框或四角控制点，保留你想让模型重点看到的画面。也可以直接跳过。
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-strong)] p-3 sm:p-4">
        <div
          ref={frameRef}
          className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[#dbe6fb]"
        >
          <img
            src={props.imageUrl}
            alt="裁剪预览"
            className="block w-full select-none"
            draggable={false}
          />

          <div className="pointer-events-none absolute inset-0 bg-[rgba(6,18,34,0.24)]" />

          <div
            className="absolute border-2 border-[var(--accent)] bg-transparent shadow-[0_0_0_9999px_rgba(6,18,34,0.18)]"
            style={cropStyle}
          >
            <button
              type="button"
              aria-label="拖动裁剪框"
              onPointerDown={(event) => {
                event.preventDefault();
                interactionRef.current = {
                  mode: "drag",
                  startX: event.clientX,
                  startY: event.clientY,
                  startCrop: props.crop,
                };
              }}
              className="absolute inset-0 cursor-move"
            />

            {(["nw", "ne", "se", "sw"] as ResizeHandle[]).map((handle) => {
              const handleClasses: Record<ResizeHandle, string> = {
                nw: "-left-2 -top-2 cursor-nwse-resize",
                ne: "-right-2 -top-2 cursor-nesw-resize",
                se: "-bottom-2 -right-2 cursor-nwse-resize",
                sw: "-bottom-2 -left-2 cursor-nesw-resize",
              };

              return (
                <button
                  key={handle}
                  type="button"
                  aria-label={`调整裁剪框 ${handle}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    interactionRef.current = {
                      mode: "resize",
                      handle,
                      startX: event.clientX,
                      startY: event.clientY,
                      startCrop: props.crop,
                    };
                  }}
                  className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[var(--accent)] shadow ${handleClasses[handle]}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={props.onSkip}
          disabled={props.isApplying}
          className="min-h-11 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--panel-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          跳过裁剪
        </button>
        <button
          type="button"
          onClick={props.onApply}
          disabled={props.isApplying}
          className="min-h-11 rounded-full bg-[var(--ink)] px-5 text-sm font-medium text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.isApplying ? "正在应用裁剪" : "使用裁剪结果"}
        </button>
      </div>
    </div>
  );
}
