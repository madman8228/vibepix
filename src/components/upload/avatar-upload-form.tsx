"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadAvatar } from "../../lib/api";

type UploadState = "idle" | "uploading" | "error";

const statusCopy: Record<Exclude<UploadState, "error">, string> = {
  idle: "支持 JPG / PNG。上传后会先做图片合规检查，再生成一段头像小结。",
  uploading: "正在检查图片并生成头像小结，请稍等片刻。",
};

export function AvatarUploadForm() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const uploadInFlightRef = useRef(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;

    if (uploadInFlightRef.current) {
      input.value = "";
      return;
    }

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    uploadInFlightRef.current = true;
    setFileName(file.name);
    setErrorMessage(null);
    setUploadState("uploading");

    try {
      const response = await uploadAvatar(file);
      router.push(`/recommend?uploadSessionId=${encodeURIComponent(response.uploadSessionId)}`);
    } catch (error: unknown) {
      setUploadState("error");
      setFileName(null);
      setErrorMessage(
        error instanceof Error ? error.message : "这张图片暂时无法处理。",
      );
      input.value = "";
    } finally {
      uploadInFlightRef.current = false;
    }
  }

  const helperText =
    uploadState === "error"
      ? errorMessage ?? "这张图片暂时无法处理。"
      : statusCopy[uploadState];

  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,253,249,0.92)] p-6 shadow-[0_20px_70px_rgba(88,67,44,0.08)] backdrop-blur sm:p-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            上传头像
          </p>
          <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            从一张头像开始。
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            你会先得到一句简短解读，再进入推荐玩法页。整个体验偏轻娱乐、轻陪伴，不会输出高风险结论。
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/80 p-5">
          <label
            htmlFor="avatar-upload"
            className="text-sm font-semibold text-[var(--ink)]"
          >
            上传头像
          </label>
          <input
            id="avatar-upload"
            name="avatar-upload"
            type="file"
            accept="image/*"
            aria-label="Avatar upload"
            className="mt-4 block w-full cursor-pointer rounded-[1rem] border border-[var(--line)] bg-[var(--paper-strong)] px-4 py-3 text-sm text-[var(--ink-soft)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            disabled={uploadState === "uploading"}
            onChange={handleFileChange}
          />
          <p
            className={`mt-4 text-sm leading-6 ${
              uploadState === "error" ? "text-[#b2554d]" : "text-[var(--ink-soft)]"
            }`}
          >
            {helperText}
          </p>
          {fileName ? (
            <p className="mt-2 text-sm text-[var(--ink)]">已选择：{fileName}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-soft)]">
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5">
            匿名体验
          </span>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5">
            一次只返回一个结果
          </span>
          <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5">
            可选评分
          </span>
        </div>
      </div>
    </section>
  );
}
