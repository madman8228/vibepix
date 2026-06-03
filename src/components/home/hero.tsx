const sampleHighlights = [
  { title: "先理解你", body: "上传后先做头像摘要，不让玩法像盲选菜单。" },
  { title: "再推荐玩法", body: "推荐区优先给你 1 个解读 + 4 个出图方向。" },
  { title: "一次一个结果", body: "保持轻量，单次只返回一张图或一张解读卡。" },
];

export function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.2),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] px-6 py-8 shadow-2xl shadow-slate-950/40 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Avatar Play MVP</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white lg:text-6xl">
              上传头像，先看解读，再玩图。
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
              产品先用一段轻量头像解读建立“AI 懂你”的感觉，再把你送进一个简洁的玩法大厅：可以看性格、看今日运势，也可以快速生成新头像、海报和情绪图。
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {sampleHighlights.map((highlight) => (
            <article key={highlight.title} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">{highlight.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-100">{highlight.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
