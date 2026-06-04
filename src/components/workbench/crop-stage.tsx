export function CropStage(props: {
  visible: boolean;
  onSkip: () => void;
  onApply: () => void;
}) {
  if (!props.visible) {
    return null;
  }

  return (
    <div className="grid gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <p className="text-sm leading-6 text-slate-700">
        拖动头像，调整你想保留的画面范围。
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={props.onSkip}
          className="min-h-11 rounded-full border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700"
        >
          跳过裁剪
        </button>
        <button
          type="button"
          onClick={props.onApply}
          className="min-h-11 rounded-full bg-slate-900 px-5 text-sm font-medium text-white"
        >
          使用裁剪结果
        </button>
      </div>
    </div>
  );
}
