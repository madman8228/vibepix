import Link from "next/link";

export default function RecommendPage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-12">
      <div className="mx-auto grid w-full max-w-3xl gap-5 rounded-[2rem] border border-[var(--line)] bg-[var(--panel)] p-8 shadow-[0_18px_60px_rgba(6,18,34,0.08)]">
        <div className="grid gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            兼容入口
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
            玩法已经回到首页
          </h1>
          <p className="text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            现在的正式体验是单页工作台：上传头像、可选裁剪、选玩法、看结果，都在首页完成。
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex w-fit rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
        >
          回到首页继续
        </Link>
      </div>
    </main>
  );
}
