"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { uploadAvatar } from "../../lib/api";

type UploadState = "idle" | "uploading" | "error";

const statusCopy: Record<Exclude<UploadState, "error">, string> = {
  idle: "Upload a JPG or PNG to get AI recommendation starters.",
  uploading: "Uploading avatar...",
};

export function AvatarUploadForm() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setErrorMessage(null);
    setUploadState("uploading");

    try {
      const response = await uploadAvatar(file);

      router.push(
        `/recommend?uploadSessionId=${encodeURIComponent(
          response.uploadSessionId,
        )}&tierKey=free`,
      );
    } catch (error: unknown) {
      setUploadState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not process this upload.",
      );
      event.target.value = "";
    }
  }

  const helperText =
    uploadState === "error"
      ? errorMessage ?? "We could not process this upload."
      : statusCopy[uploadState];

  return (
    <section className="grid gap-6 rounded-[2rem] border border-slate-800 bg-white p-6 text-slate-950 shadow-2xl shadow-slate-950/10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Upload
          </p>
          <h2 className="text-3xl font-semibold text-slate-950">
            Drop in an avatar and we will route you to a recommendation set.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            This MVP uses the existing upload and recommendation APIs to prove
            the first consumer flow. Selecting a file starts immediately.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
          <label
            htmlFor="avatar-upload"
            className="block text-sm font-semibold text-slate-900"
          >
            Avatar upload
          </label>
          <input
            id="avatar-upload"
            name="avatar-upload"
            type="file"
            accept="image/*"
            className="mt-3 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={handleFileChange}
          />
          <p
            className={`mt-3 text-sm ${
              uploadState === "error" ? "text-rose-600" : "text-slate-600"
            }`}
          >
            {helperText}
          </p>
          {fileName ? (
            <p className="mt-2 text-sm font-medium text-slate-900">
              Selected file: {fileName}
            </p>
          ) : null}
        </div>
      </div>

      <aside className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
          Flow states
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li>
            <span className="font-semibold text-white">Idle:</span> waiting for
            an avatar.
          </li>
          <li>
            <span className="font-semibold text-white">Uploading:</span>{" "}
            sending the JSON upload payload.
          </li>
          <li>
            <span className="font-semibold text-white">Error:</span> recover
            inline and let the user retry.
          </li>
        </ul>
      </aside>
    </section>
  );
}
