const sampleStories = [
  {
    title: "Campus pastel",
    blurb: "Gentle portraits matched to warm classroom scenes and soft pacing.",
  },
  {
    title: "Daily-life energy",
    blurb: "Brighter framing for playful slice-of-life moments and easy hooks.",
  },
  {
    title: "Heroic contrast",
    blurb: "Sharper silhouettes and more dramatic story beats for bolder moods.",
  },
];

export function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.25),_transparent_35%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#172554)] px-6 py-8 shadow-2xl shadow-slate-950/40 lg:px-10 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
            Story Avatar Generator
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white lg:text-6xl">
              Start with one avatar and get a first-pass story direction.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 lg:text-lg">
              Upload a character photo and we will translate its mood into a
              compact recommendation set: style, narrative mode, and gameplay
              arc.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {sampleStories.map((story) => (
            <article
              key={story.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                Sample lane
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {story.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {story.blurb}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
