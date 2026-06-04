"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CropStage } from "./crop-stage";
import { InlineResultPanel } from "./inline-result-panel";
import {
  moodVariantOptions,
  PlaySelector,
  storyVariantOptions,
} from "./play-selector";
import { UploadStage } from "./upload-stage";
import {
  getPlayJob,
  getPlayLobby,
  ratePlayJob,
  startPlay,
  uploadAvatar,
} from "../../lib/api";
import { buildCroppedImageFile, type CropRect } from "../../lib/images/crop-image";
import type { PlayJobResponse } from "../../lib/schemas/generate";
import type { AvatarAnalysis, PlayDescriptor, PlayType } from "../../lib/types";

type ImageMeta = {
  width: number;
  height: number;
};

const initialCrop: CropRect = {
  x: 0.1,
  y: 0.08,
  width: 0.8,
  height: 0.84,
};

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function loadImageDimensions(file: File) {
  return new Promise<ImageMeta>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      reject(new Error("Unable to prepare the avatar crop."));
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });
}

async function fileToCanvas(file: File) {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => {
      resolve();
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      reject(new Error("Unable to render the avatar crop."));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const context = sourceCanvas.getContext("2d");
  context?.drawImage(image, 0, 0, width, height);

  return { sourceCanvas, width, height };
}

function getInitialPlay(recommendedPlays: PlayDescriptor[]) {
  return recommendedPlays[0]?.playType ?? "personality_read";
}

function getVariantPayload(playType: PlayType, moodVariant: string, storyVariant: string) {
  if (playType === "mood_mode") {
    const selected = moodVariantOptions.find((option) => option.key === moodVariant);
    return {
      variantKey: moodVariant,
      variantLabel: selected?.label ?? "开心",
    };
  }

  if (playType === "story_mode") {
    const selected = storyVariantOptions.find((option) => option.key === storyVariant);
    return {
      variantKey: storyVariant,
      variantLabel: selected?.label ?? "夜色主角",
    };
  }

  return {};
}

export function AvatarWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workingFile, setWorkingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropVisible, setCropVisible] = useState(false);
  const [crop, setCrop] = useState<CropRect>(initialCrop);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AvatarAnalysis | null>(null);
  const [recommendedPlays, setRecommendedPlays] = useState<PlayDescriptor[]>([]);
  const [availablePlays, setAvailablePlays] = useState<PlayDescriptor[]>([]);
  const [activePlay, setActivePlay] = useState<PlayType>("personality_read");
  const [moodVariant, setMoodVariant] = useState(moodVariantOptions[0].key);
  const [storyVariant, setStoryVariant] = useState(storyVariantOptions[0].key);
  const [job, setJob] = useState<PlayJobResponse | null>(null);
  const [isPreparingLobby, setIsPreparingLobby] = useState(false);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [isRunningPlay, setIsRunningPlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultErrorMessage, setResultErrorMessage] = useState<string | null>(null);
  const pollingRunRef = useRef(0);

  const canShowPlaySelector =
    !cropVisible &&
    !!workingFile &&
    !!uploadSessionId &&
    availablePlays.length > 0 &&
    !isPreparingLobby;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetFlowForNewAvatar() {
    pollingRunRef.current += 1;
    setUploadSessionId(null);
    setAnalysis(null);
    setRecommendedPlays([]);
    setAvailablePlays([]);
    setActivePlay("personality_read");
    setMoodVariant(moodVariantOptions[0].key);
    setStoryVariant(storyVariantOptions[0].key);
    setJob(null);
    setErrorMessage(null);
    setResultErrorMessage(null);
    setIsPreparingLobby(false);
    setIsRunningPlay(false);
  }

  async function finalizeAvatar(nextWorkingFile: File) {
    setWorkingFile(nextWorkingFile);
    setIsPreparingLobby(true);
    setErrorMessage(null);
    setResultErrorMessage(null);
    setJob(null);

    try {
      const upload = await uploadAvatar(nextWorkingFile);
      const lobby = await getPlayLobby(upload.uploadSessionId);

      setUploadSessionId(upload.uploadSessionId);
      setAnalysis(upload.analysis);
      setRecommendedPlays(lobby.recommendedPlays);
      setAvailablePlays(lobby.availablePlays);
      setActivePlay(getInitialPlay(lobby.recommendedPlays));
    } catch (error: unknown) {
      setUploadSessionId(null);
      setAnalysis(null);
      setRecommendedPlays([]);
      setAvailablePlays([]);
      setErrorMessage(
        error instanceof Error ? error.message : "暂时没法准备这张头像，请换一张试试。",
      );
    } finally {
      setIsPreparingLobby(false);
    }
  }

  async function handleSelectFile(file: File) {
    resetFlowForNewAvatar();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setWorkingFile(file);
    setPreviewUrl(nextPreviewUrl);
    setCrop(initialCrop);
    setCropVisible(true);

    try {
      const nextImageMeta = await loadImageDimensions(file);
      setImageMeta(nextImageMeta);
    } catch {
      setImageMeta(null);
    }
  }

  async function handleSkipCrop() {
    if (!selectedFile) {
      return;
    }

    setCropVisible(false);
    await finalizeAvatar(selectedFile);
  }

  async function handleApplyCrop() {
    if (!selectedFile || !imageMeta) {
      await handleSkipCrop();
      return;
    }

    setIsApplyingCrop(true);

    try {
      const { sourceCanvas } = await fileToCanvas(selectedFile);
      const croppedFile = await buildCroppedImageFile({
        sourceCanvas,
        crop: {
          x: crop.x * imageMeta.width,
          y: crop.y * imageMeta.height,
          width: crop.width * imageMeta.width,
          height: crop.height * imageMeta.height,
        },
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "image/png",
      });

      setCropVisible(false);
      await finalizeAvatar(croppedFile);
    } catch {
      setCropVisible(false);
      await finalizeAvatar(selectedFile);
    } finally {
      setIsApplyingCrop(false);
    }
  }

  async function handleRunPlay() {
    if (!uploadSessionId) {
      setResultErrorMessage("请先完成头像上传。");
      return;
    }

    pollingRunRef.current += 1;
    const currentRun = pollingRunRef.current;
    setIsRunningPlay(true);
    setResultErrorMessage(null);
    setJob(null);

    try {
      const started = await startPlay({
        uploadSessionId,
        playType: activePlay,
        ...getVariantPayload(activePlay, moodVariant, storyVariant),
      });

      while (currentRun === pollingRunRef.current) {
        const nextJob = await getPlayJob(started.jobId);
        setJob(nextJob);

        if (nextJob.status === "SUCCEEDED" || nextJob.status === "FAILED") {
          break;
        }

        await delay(500);
      }
    } catch (error: unknown) {
      setResultErrorMessage(
        error instanceof Error ? error.message : "这个玩法暂时没有顺利开始。",
      );
    } finally {
      if (currentRun === pollingRunRef.current) {
        setIsRunningPlay(false);
      }
    }
  }

  async function handleRate(score: number) {
    if (!job) {
      return;
    }

    const rating = await ratePlayJob(job.jobId, score);
    setJob({
      ...job,
      rating: rating.rating,
    });
  }

  const selectedPlayDescriptor = useMemo(
    () => availablePlays.find((play) => play.playType === activePlay) ?? null,
    [activePlay, availablePlays],
  );

  return (
    <main className="workbench-shell">
      <UploadStage
        previewUrl={previewUrl}
        analysis={analysis}
        isPreparing={isPreparingLobby}
        errorMessage={errorMessage}
        onSelectFile={(file) => {
          void handleSelectFile(file);
        }}
        onReselect={resetFlowForNewAvatar}
        onEditCrop={() => setCropVisible(true)}
      >
        <CropStage
          visible={cropVisible}
          imageUrl={previewUrl}
          crop={crop}
          onChangeCrop={setCrop}
          onSkip={() => {
            void handleSkipCrop();
          }}
          onApply={() => {
            void handleApplyCrop();
          }}
          isApplying={isApplyingCrop}
        />

        {!cropVisible && selectedPlayDescriptor ? (
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4">
            <p className="text-xs font-medium tracking-[0.08em] text-[var(--ink-soft)]">
              当前默认玩法
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink)]">
              {selectedPlayDescriptor.title} · {selectedPlayDescriptor.reason}
            </p>
          </div>
        ) : null}
      </UploadStage>

      {canShowPlaySelector ? (
        <PlaySelector
          availablePlays={availablePlays}
          recommendedPlays={recommendedPlays}
          activePlay={activePlay}
          onSelectPlay={setActivePlay}
          moodVariant={moodVariant}
          onSelectMoodVariant={setMoodVariant}
          storyVariant={storyVariant}
          onSelectStoryVariant={setStoryVariant}
          onRunPlay={() => {
            void handleRunPlay();
          }}
          isRunning={isRunningPlay}
        />
      ) : (
        <section
          aria-label="玩法选择"
          className="rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_18px_60px_rgba(6,18,34,0.08)] sm:p-6"
        >
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.55rem]">
            玩法选择
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            {previewUrl
              ? cropVisible
                ? "先决定要不要裁剪，再继续下面的玩法。"
                : "正在根据这张头像准备推荐玩法。"
              : "先上传一张头像，玩法区就会出现在这里。"}
          </p>
        </section>
      )}

      <InlineResultPanel
        job={job}
        isRunning={isRunningPlay}
        errorMessage={resultErrorMessage}
        onRate={handleRate}
      />
    </main>
  );
}
