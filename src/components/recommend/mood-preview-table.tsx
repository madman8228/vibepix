export const moodRows = [
  { mood: "开心", icon: "🙂", detail: "快乐愉悦" },
  { mood: "悲伤", icon: "🥲", detail: "伤心难过" },
  { mood: "生气", icon: "😠", detail: "愤怒不满" },
  { mood: "害怕", icon: "😨", detail: "恐惧不安" },
  { mood: "惊讶", icon: "😮", detail: "震惊意外" },
  { mood: "酷酷", icon: "😎", detail: "帅气自信" },
  { mood: "迷茫", icon: "🥺", detail: "困惑思考" },
  { mood: "心动", icon: "😍", detail: "甜蜜温馨" },
] as const;

export function MoodPreviewTable() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white text-slate-900 shadow-2xl shadow-slate-950/10">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Mood mode quick map</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">心情模式参考</h3>
        <p className="mt-1 text-sm text-slate-500">参考你给的表格风格，先用简洁版本告诉用户“情绪会把图往哪里带”。</p>
      </div>

      <div className="px-5 py-4">
        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">心情</th>
                <th className="px-4 py-3 text-left font-semibold">图标</th>
                <th className="px-4 py-3 text-left font-semibold">描述</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {moodRows.map((row) => (
                <tr key={row.mood}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.mood}</td>
                  <td className="px-4 py-3 text-xl">{row.icon}</td>
                  <td className="px-4 py-3 text-slate-600">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
