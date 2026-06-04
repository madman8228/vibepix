import type { ReactNode } from "react";

export function UploadStage(props: {
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
  children?: ReactNode;
}) {
  return props.previewUrl ? (
    <section
      aria-label="上传头像"
      className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2">
        <h2 className="text-xl font-semibold text-slate-900">头像预览</h2>
        <p className="text-sm leading-6 text-slate-600">
          先确认头像画面，再决定要不要做一步轻裁剪。
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
        <img
          src={props.previewUrl}
          alt="已上传头像"
          className="block aspect-[4/3] w-full object-cover"
        />
      </div>

      {props.children}
    </section>
  ) : (
    <section
      aria-label="上传头像"
      className="grid gap-4 rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-2">
        <h2 className="text-xl font-semibold text-slate-900">上传头像</h2>
        <p className="text-sm leading-6 text-slate-600">
          先放一张头像，我们会在当前页面里给你预览，再决定是否裁剪。
        </p>
      </div>

      <input
        aria-label="Avatar upload"
        type="file"
        accept="image/*"
        className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];

          if (file) {
            props.onSelectFile(file);
            event.currentTarget.value = "";
          }
        }}
      />
    </section>
  );
}
