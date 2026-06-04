export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--ink-soft)]">
        头像日签
      </p>
      <h1 className="font-display mt-5 text-4xl leading-tight text-[var(--ink)] sm:text-5xl lg:text-6xl">
        今天，这张头像
        <br />
        会怎么解读你？
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
        上传一张头像，先看一段轻解读，再从推荐玩法里挑一个继续玩。
        整个过程匿名进行，适合轻松体验，不替你做任何重要决定。
      </p>
    </section>
  );
}
