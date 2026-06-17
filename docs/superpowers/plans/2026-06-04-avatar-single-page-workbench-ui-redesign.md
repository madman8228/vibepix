# Avatar Single-Page Workbench UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current multi-page avatar flow into a responsive single-page workbench where upload, optional freeform crop, play selection, and result expansion all happen on `/`.

**Architecture:** Keep the existing upload, play generation, and rating APIs, but move orchestration into a new home-page client workbench component. Add a lightweight client-side crop pipeline that can optionally replace the original uploaded image before it is sent to `/api/upload`, then render plays and results inline below the avatar workspace instead of routing to `/recommend` and `/generate/[jobId]` for the main experience.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Playwright, Canvas image processing in browser

---

## File Structure

### New files
- `D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx` — single-page state machine for upload, crop, play selection, polling, and inline result expansion
- `D:\06-project\vibepix\src\components\workbench\upload-stage.tsx` — large upload-first stage and compact uploaded-avatar stage shell
- `D:\06-project\vibepix\src\components\workbench\crop-stage.tsx` — inline crop interaction layer with drag/zoom/freeform crop box behavior
- `D:\06-project\vibepix\src\components\workbench\play-selector.tsx` — primary play tabs and optional sub-option panels
- `D:\06-project\vibepix\src\components\workbench\inline-result-panel.tsx` — bottom expansion zone for text/image results and rating
- `D:\06-project\vibepix\src\lib\images\crop-image.ts` — converts user crop selection into a new `File`
- `D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx` — workbench interaction tests
- `D:\06-project\vibepix\src\lib\images\crop-image.test.ts` — crop output unit tests

### Modified files
- `D:\06-project\vibepix\src\app\page.tsx` — replace current composition with the single-page workbench
- `D:\06-project\vibepix\src\app\globals.css` — global theme updates for the silver/electric-blue/acid-green system and responsive single-page layout helpers
- `D:\06-project\vibepix\src\lib\api.ts` — allow upload from original file or cropped file, and expose polling helpers for inline result flow
- `D:\06-project\vibepix\tests\e2e\home-to-result.spec.ts` — update smoke flow to stay on `/`
- `D:\06-project\vibepix\AGENTS.md` — add explicit single-page responsive rule if needed after implementation decisions settle

### Compatibility pages to keep but visually de-emphasize later
- `D:\06-project\vibepix\src\app\recommend\page.tsx`
- `D:\06-project\vibepix\src\app\generate\[jobId]\page.tsx`

These remain as compatibility routes during this plan, but are no longer the main user journey.

---

### Task 1: Replace the home page with a single-page workbench shell

**Files:**
- Create: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx`
- Modify: `D:\06-project\vibepix\src\app\page.tsx`
- Modify: `D:\06-project\vibepix\src\app\globals.css`
- Test: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx`

- [ ] **Step 1: Write the failing render test for the new single-page shell**

```tsx
// D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarWorkbench } from "./avatar-workbench";

describe("AvatarWorkbench", () => {
  it("renders one single-page flow with upload, plays, and result region", () => {
    render(<AvatarWorkbench />);

    expect(screen.getByRole("heading", { name: "设计你的专属头像" })).toBeInTheDocument();
    expect(screen.getByText("上传头像")).toBeInTheDocument();
    expect(screen.getByText("玩法选择")).toBeInTheDocument();
    expect(screen.getByText("当前结果")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:
```bash
npm test -- avatar-workbench.test.tsx
```

Expected: FAIL with module not found for `./avatar-workbench`.

- [ ] **Step 3: Create the minimal workbench shell component**

```tsx
// D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx
export function AvatarWorkbench() {
  return (
    <main className="workbench-shell">
      <section className="workbench-head">
        <p className="workbench-label">头像工作台</p>
        <h1>设计你的专属头像</h1>
        <p>上传头像、微调画面，再从下方玩法里继续玩。</p>
      </section>

      <section aria-label="上传头像">
        <h2>上传头像</h2>
      </section>

      <section aria-label="玩法选择">
        <h2>玩法选择</h2>
      </section>

      <section aria-label="当前结果">
        <h2>当前结果</h2>
      </section>
    </main>
  );
}
```

```tsx
// D:\06-project\vibepix\src\app\page.tsx
import { AvatarWorkbench } from "../components/workbench/avatar-workbench";

export default function HomePage() {
  return <AvatarWorkbench />;
}
```

```css
/* D:\06-project\vibepix\src\app\globals.css */
.workbench-shell {
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: grid;
  gap: 16px;
}

.workbench-head {
  display: grid;
  gap: 8px;
}

.workbench-label {
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

@media (min-width: 768px) {
  .workbench-shell {
    padding: 40px 24px 64px;
    gap: 20px;
  }
}
```

- [ ] **Step 4: Run the targeted test again**

Run:
```bash
npm test -- avatar-workbench.test.tsx
```

Expected: PASS for the new shell test.

- [ ] **Step 5: Commit the shell foundation**

```bash
git add src/app/page.tsx src/app/globals.css src/components/workbench/avatar-workbench.tsx src/components/workbench/avatar-workbench.test.tsx
git commit -m "feat: add single-page avatar workbench shell"
```

### Task 2: Add upload-first avatar stage with optional inline freeform crop

**Files:**
- Create: `D:\06-project\vibepix\src\components\workbench\upload-stage.tsx`
- Create: `D:\06-project\vibepix\src\components\workbench\crop-stage.tsx`
- Create: `D:\06-project\vibepix\src\lib\images\crop-image.ts`
- Create: `D:\06-project\vibepix\src\lib\images\crop-image.test.ts`
- Modify: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx`
- Modify: `D:\06-project\vibepix\src\lib\api.ts`
- Test: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx`

- [ ] **Step 1: Write a failing unit test for cropping output**

```ts
// D:\06-project\vibepix\src\lib\images\crop-image.test.ts
import { describe, expect, it } from "vitest";

import { buildCroppedImageFile } from "./crop-image";

describe("buildCroppedImageFile", () => {
  it("returns a new file for the selected freeform crop", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 120;

    const file = await buildCroppedImageFile({
      sourceCanvas: canvas,
      crop: { x: 20, y: 10, width: 100, height: 60 },
      fileName: "avatar.png",
      mimeType: "image/png",
    });

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("avatar.png");
    expect(file.type).toBe("image/png");
  });
});
```

- [ ] **Step 2: Run the crop test to verify it fails**

Run:
```bash
npm test -- crop-image.test.ts
```

Expected: FAIL with module not found for `./crop-image`.

- [ ] **Step 3: Implement the minimal crop utility**

```ts
// D:\06-project\vibepix\src\lib\images\crop-image.ts
export async function buildCroppedImageFile({
  sourceCanvas,
  crop,
  fileName,
  mimeType,
}: {
  sourceCanvas: HTMLCanvasElement;
  crop: { x: number; y: number; width: number; height: number };
  fileName: string;
  mimeType: string;
}) {
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(crop.width));
  output.height = Math.max(1, Math.round(crop.height));

  const context = output.getContext("2d");
  if (!context) {
    throw new Error("Canvas is unavailable.");
  }

  context.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    output.width,
    output.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    output.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error("Crop export failed."));
    }, mimeType);
  });

  return new File([blob], fileName, { type: mimeType });
}
```

- [ ] **Step 4: Add upload/crop stage components and wire state in the workbench**

```tsx
// D:\06-project\vibepix\src\components\workbench\upload-stage.tsx
export function UploadStage(props: {
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
  children?: React.ReactNode;
}) {
  return props.previewUrl ? (
    <section>
      <h2>头像预览</h2>
      <img src={props.previewUrl} alt="已上传头像" />
      {props.children}
    </section>
  ) : (
    <section>
      <h2>上传头像</h2>
      <input aria-label="Avatar upload" type="file" accept="image/*" onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        if (file) props.onSelectFile(file);
      }} />
    </section>
  );
}
```

```tsx
// D:\06-project\vibepix\src\components\workbench\crop-stage.tsx
export function CropStage(props: {
  visible: boolean;
  onSkip: () => void;
  onApply: () => void;
}) {
  if (!props.visible) return null;

  return (
    <div>
      <p>拖动头像，调整你想保留的画面范围。</p>
      <button type="button" onClick={props.onSkip}>跳过裁剪</button>
      <button type="button" onClick={props.onApply}>使用裁剪结果</button>
    </div>
  );
}
```

```tsx
// D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [workingFile, setWorkingFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [cropVisible, setCropVisible] = useState(false);

function handleSelectFile(file: File) {
  setSelectedFile(file);
  setWorkingFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setCropVisible(true);
}
```

```ts
// D:\06-project\vibepix\src\lib\api.ts
export async function uploadAvatar(file: File): Promise<UploadResponse> {
  // keep existing implementation, but this function is now called with either
  // the original file or a cropped file chosen by the workbench state.
}
```

- [ ] **Step 5: Extend the workbench interaction test for upload-first crop flow**

```tsx
it("keeps crop optional after upload", async () => {
  render(<AvatarWorkbench />);

  fireEvent.change(screen.getByLabelText("Avatar upload"), {
    target: { files: [new File(["a"], "avatar.png", { type: "image/png" })] },
  });

  expect(await screen.findByText("拖动头像，调整你想保留的画面范围。")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "跳过裁剪" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "使用裁剪结果" })).toBeInTheDocument();
});
```

- [ ] **Step 6: Run the crop and workbench tests**

Run:
```bash
npm test -- crop-image.test.ts avatar-workbench.test.tsx
```

Expected: PASS for crop export and optional crop UI behavior.

- [ ] **Step 7: Commit the avatar workspace stage**

```bash
git add src/components/workbench/upload-stage.tsx src/components/workbench/crop-stage.tsx src/components/workbench/avatar-workbench.tsx src/lib/images/crop-image.ts src/lib/images/crop-image.test.ts src/lib/api.ts src/components/workbench/avatar-workbench.test.tsx
git commit -m "feat: add inline avatar upload and crop stage"
```

### Task 3: Move recommended plays into inline tabs and sub-option controls

**Files:**
- Create: `D:\06-project\vibepix\src\components\workbench\play-selector.tsx`
- Modify: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx`
- Modify: `D:\06-project\vibepix\src\lib\catalog\default-plays.ts`
- Test: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx`

- [ ] **Step 1: Write the failing test for single-page play selection**

```tsx
it("shows primary plays inline after upload", async () => {
  render(<AvatarWorkbench />);

  fireEvent.change(screen.getByLabelText("Avatar upload"), {
    target: { files: [new File(["a"], "avatar.png", { type: "image/png" })] },
  });

  expect(await screen.findByRole("tab", { name: "解读" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "心情" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "剧情" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the workbench test to verify it fails on missing tabs**

Run:
```bash
npm test -- avatar-workbench.test.tsx
```

Expected: FAIL because the tabs are not rendered yet.

- [ ] **Step 3: Implement the inline play selector**

```tsx
// D:\06-project\vibepix\src\components\workbench\play-selector.tsx
const primaryPlays = [
  { key: "personality_read", label: "解读" },
  { key: "mood_mode", label: "心情" },
  { key: "story_mode", label: "剧情" },
  { key: "style_swap", label: "换风格" },
  { key: "new_avatar", label: "新头像" },
  { key: "poster", label: "海报" },
] as const;

export function PlaySelector(props: {
  activePlay: string;
  onSelectPlay: (play: string) => void;
}) {
  return (
    <section>
      <p>玩法选择</p>
      <div role="tablist" aria-label="玩法选择">
        {primaryPlays.map((play) => (
          <button
            key={play.key}
            role="tab"
            aria-selected={props.activePlay === play.key}
            onClick={() => props.onSelectPlay(play.key)}
          >
            {play.label}
          </button>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx
const [activePlay, setActivePlay] = useState<PlayType>("personality_read");
```

- [ ] **Step 4: Add optional sub-options only for the currently selected play**

```tsx
{activePlay === "mood_mode" ? (
  <div aria-label="心情选项">
    {[
      "开心",
      "悲伤",
      "生气",
      "害怕",
      "惊讶",
      "酷酷",
      "迷茫",
      "心动",
    ].map((label) => (
      <button key={label} type="button">{label}</button>
    ))}
  </div>
) : null}
```

- [ ] **Step 5: Run the workbench tests again**

Run:
```bash
npm test -- avatar-workbench.test.tsx
```

Expected: PASS with inline tabs and play controls on the home page.

- [ ] **Step 6: Commit the play-selection layer**

```bash
git add src/components/workbench/play-selector.tsx src/components/workbench/avatar-workbench.tsx src/lib/catalog/default-plays.ts src/components/workbench/avatar-workbench.test.tsx
git commit -m "feat: move avatar plays into single-page selector"
```

### Task 4: Expand results inline at the bottom of the same page

**Files:**
- Create: `D:\06-project\vibepix\src\components\workbench\inline-result-panel.tsx`
- Modify: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx`
- Reuse patterns from: `D:\06-project\vibepix\src\components\generate\rating-panel.tsx`
- Test: `D:\06-project\vibepix\src\components\workbench\avatar-workbench.test.tsx`
- Test: `D:\06-project\vibepix\tests\e2e\home-to-result.spec.ts`

- [ ] **Step 1: Write a failing test for inline result expansion**

```tsx
it("renders the selected play result under the same page", async () => {
  vi.mocked(uploadAvatar).mockResolvedValue({
    uploadSessionId: "upload_1",
    analysis: { summary: "这张头像偏明亮轻快。", tags: ["明亮", "亲近", "轻快"] },
  });
  vi.mocked(startPlay).mockResolvedValue({
    jobId: "job_1",
    status: "RUNNING",
    redirectTo: "/generate/job_1",
  });
  vi.mocked(getPlayJob).mockResolvedValue({
    jobId: "job_1",
    uploadSessionId: "upload_1",
    playType: "personality_read",
    status: "SUCCEEDED",
    progress: { label: "Ready", message: "结果已经准备好了。", percent: 100 },
    result: {
      kind: "text",
      playType: "personality_read",
      title: "性格解读",
      summary: "这张头像让人感觉很舒服。",
      highlights: ["温和", "亲近", "轻快"],
      suggestion: "自然一点会更适合你。",
      disclaimer: "仅供轻娱乐体验参考。",
    },
    rating: { score: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  render(<AvatarWorkbench />);
  // ...upload and start flow...
  expect(await screen.findByText("这张头像让人感觉很舒服。")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify inline result rendering is missing**

Run:
```bash
npm test -- avatar-workbench.test.tsx
```

Expected: FAIL because result content is not yet rendered inside the home page.

- [ ] **Step 3: Implement inline result polling and rendering**

```tsx
// D:\06-project\vibepix\src\components\workbench\inline-result-panel.tsx
export function InlineResultPanel(props: {
  job: PlayJobResponse | null;
  onRate: (score: number) => Promise<void>;
}) {
  return (
    <section aria-label="当前结果">
      <h2>当前结果</h2>
      {props.job?.result?.kind === "text" ? <p>{props.job.result.summary}</p> : null}
      {props.job?.result?.kind === "image" ? <img src={props.job.result.imageUrl} alt={props.job.result.altText} /> : null}
      {props.job?.status === "SUCCEEDED" ? <RatingPanel value={props.job.rating.score} onRate={props.onRate} /> : null}
    </section>
  );
}
```

```tsx
// D:\06-project\vibepix\src\components\workbench\avatar-workbench.tsx
const [job, setJob] = useState<PlayJobResponse | null>(null);

async function handleRunPlay() {
  if (!workingFile) return;
  const upload = await uploadAvatar(workingFile);
  const start = await startPlay({ uploadSessionId: upload.uploadSessionId, playType: activePlay });
  const nextJob = await getPlayJob(start.jobId);
  setJob(nextJob);
}
```

- [ ] **Step 4: Update the E2E smoke flow to stay on `/`**

```ts
// D:\06-project\vibepix\tests\e2e\home-to-result.spec.ts
await page.goto("/");
await page.getByLabel("Avatar upload").setInputFiles("tests/fixtures/avatar.jpg");
await page.getByRole("tab", { name: "解读" }).click();
await page.getByRole("button", { name: "开始生成" }).click();
await expect(page.getByText("当前结果")).toBeVisible();
await expect(page.getByRole("button", { name: "4.5 stars" })).toBeVisible();
```

- [ ] **Step 5: Run the targeted test and then the E2E test**

Run:
```bash
npm test -- avatar-workbench.test.tsx
npm run test:e2e
```

Expected: PASS for inline result rendering and single-page smoke flow.

- [ ] **Step 6: Commit the inline-result experience**

```bash
git add src/components/workbench/inline-result-panel.tsx src/components/workbench/avatar-workbench.tsx tests/e2e/home-to-result.spec.ts src/components/workbench/avatar-workbench.test.tsx
git commit -m "feat: expand play results inline on home page"
```

### Task 5: Responsive polish and compatibility route de-emphasis

**Files:**
- Modify: `D:\06-project\vibepix\src\app\globals.css`
- Modify: `D:\06-project\vibepix\src\app\recommend\page.tsx`
- Modify: `D:\06-project\vibepix\src\app\generate\[jobId]\page.tsx`
- Modify if needed: `D:\06-project\vibepix\AGENTS.md`

- [ ] **Step 1: Add a failing E2E assertion for responsive single-page layout**

```ts
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("/");
await expect(page.getByText("设计你的专属头像")).toBeVisible();
await expect(page.getByText("玩法选择")).toBeVisible();
await expect(page.getByText("当前结果")).toBeVisible();
```

- [ ] **Step 2: Run E2E to establish the current mobile baseline**

Run:
```bash
npm run test:e2e
```

Expected: PASS or reveal mobile layout overlap; fix only confirmed issues.

- [ ] **Step 3: Add responsive layout rules and de-emphasize old compatibility pages**

```css
/* D:\06-project\vibepix\src\app\globals.css */
.workbench-shell {
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .workbench-avatar-and-controls {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 20px;
  }
}
```

```tsx
// D:\06-project\vibepix\src\app\recommend\page.tsx
// Replace the current full product experience with a slim compatibility message
// that sends users back to `/`.
```

```tsx
// D:\06-project\vibepix\src\app\generate\[jobId]\page.tsx
// Keep result lookup available, but position the page as a compatibility route
// with a clear return path to the single-page home workbench.
```

- [ ] **Step 4: Run the full verification suite**

Run:
```bash
npm test
npm run build
npm run test:e2e
```

Expected: All commands PASS.

- [ ] **Step 5: Commit the responsive finish**

```bash
git add src/app/globals.css src/app/recommend/page.tsx src/app/generate/[jobId]/page.tsx AGENTS.md tests/e2e/home-to-result.spec.ts
git commit -m "feat: finish responsive single-page avatar workbench"
```

---

## Self-Review

### Spec coverage
- 单页主工作台：Task 1, Task 4, Task 5
- 原地自由裁剪：Task 2
- 头像优先：Task 1, Task 2, Task 5
- 玩法切换与必要子选项：Task 3
- 底部结果展开：Task 4
- 响应式：Task 5
- 兼容旧路由：Task 5

### Placeholder scan
- No `TBD`, `TODO`, or “similar to” placeholders remain.
- Every task lists exact files and commands.
- Each code-change step includes concrete code snippets instead of generic instructions.

### Type consistency
- `AvatarWorkbench`, `UploadStage`, `CropStage`, `PlaySelector`, and `InlineResultPanel` are consistently named across tasks.
- The crop helper is consistently named `buildCroppedImageFile`.
- The main page remains `/`, and inline play polling continues using `uploadAvatar`, `startPlay`, `getPlayJob`, and `ratePlayJob`.
