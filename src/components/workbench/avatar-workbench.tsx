"use client";

import { useEffect, useState } from "react";

import { CropStage } from "./crop-stage";
import { UploadStage } from "./upload-stage";
import { buildCroppedImageFile } from "../../lib/images/crop-image";

async function loadImageDimensions(file: File) {
  return new Promise<{ width: number; height: number; image: HTMLImageElement }>(
    (resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        resolve({
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          image,
        });
        URL.revokeObjectURL(objectUrl);
      };

      image.onerror = () => {
        reject(new Error("Unable to prepare the avatar crop."));
        URL.revokeObjectURL(objectUrl);
      };

      image.src = objectUrl;
    },
  );
}

export function AvatarWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workingFile, setWorkingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropVisible, setCropVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleSelectFile(file: File) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setWorkingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCropVisible(true);
  }

  function handleSkipCrop() {
    setWorkingFile(selectedFile);
    setCropVisible(false);
  }

  async function handleApplyCrop() {
    if (!selectedFile) {
      return;
    }

    try {
      const { image, width, height } = await loadImageDimensions(selectedFile);
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = width;
      sourceCanvas.height = height;

      const context = sourceCanvas.getContext("2d");
      context?.drawImage(image, 0, 0, width, height);

      const croppedFile = await buildCroppedImageFile({
        sourceCanvas,
        crop: { x: 0, y: 0, width, height },
        fileName: selectedFile.name,
        mimeType: selectedFile.type || "image/png",
      });

      setWorkingFile(croppedFile);
      setCropVisible(false);
    } catch {
      setWorkingFile(selectedFile);
      setCropVisible(false);
    }
  }

  return (
    <main className="workbench-shell">
      <section className="workbench-head">
        <p className="workbench-label">头像工作台</p>
        <h1>设计你的专属头像</h1>
        <p>上传头像、微调画面，再从下方玩法里继续玩。</p>
      </section>

      <UploadStage previewUrl={previewUrl} onSelectFile={handleSelectFile}>
        <CropStage
          visible={cropVisible}
          onSkip={handleSkipCrop}
          onApply={handleApplyCrop}
        />
        {workingFile ? (
          <p className="text-sm text-slate-600">
            当前工作头像：{workingFile.name}
          </p>
        ) : null}
      </UploadStage>

      <section
        aria-label="玩法选择"
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2>玩法选择</h2>
      </section>

      <section
        aria-label="当前结果"
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2>当前结果</h2>
      </section>
    </main>
  );
}
