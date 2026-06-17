# Avatar Daily Sign UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the three main user-facing pages into a warm white daily-sign experience without changing the upload, recommendation, generation, or rating APIs.

**Architecture:** Keep the existing Next.js data flow and API contracts intact. Replace the presentational layer with simpler page composition, lighter copy, and a shared warm visual system in global styles and reusable page sections.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, Playwright

---

### Task 1: Establish the shared visual system

**Files:**
- Modify: `D:\06-project\vibepix\src\app\layout.tsx`
- Modify: `D:\06-project\vibepix\src\app\globals.css`

- [ ] Switch document language/body shell to support the new warm, editorial tone.
- [ ] Replace the current dark default body styles with warm paper background, serif display typography, and shared utility classes.

### Task 2: Rebuild the home page around one upload action

**Files:**
- Modify: `D:\06-project\vibepix\src\app\page.tsx`
- Modify: `D:\06-project\vibepix\src\components\home\hero.tsx`
- Modify: `D:\06-project\vibepix\src\components\upload\avatar-upload-form.tsx`
- Test: `D:\06-project\vibepix\src\components\upload\avatar-upload-form.test.tsx`

- [ ] Remove explanation-heavy panels and keep a single upload-first composition.
- [ ] Rewrite copy into concise Chinese product language.
- [ ] Preserve the upload label and redirect behavior in tests.

### Task 3: Rebuild the play selection page

**Files:**
- Modify: `D:\06-project\vibepix\src\app\recommend\page.tsx`
- Modify: `D:\06-project\vibepix\src\components\recommend\analysis-summary.tsx`
- Modify: `D:\06-project\vibepix\src\components\recommend\recommendation-strip.tsx`
- Optional cleanup: `D:\06-project\vibepix\src\components\recommend\mood-preview-table.tsx`

- [ ] Make the avatar summary the emotional anchor of the page.
- [ ] Simplify recommended/fixed play sections and reduce explanatory chrome.
- [ ] Keep recommended plays easy to scan and fixed plays visually secondary.

### Task 4: Rebuild the result page

**Files:**
- Modify: `D:\06-project\vibepix\src\app\generate\[jobId]\page.tsx`
- Modify: `D:\06-project\vibepix\src\components\generate\job-progress.tsx`
- Modify: `D:\06-project\vibepix\src\components\generate\result-viewer.tsx`
- Modify: `D:\06-project\vibepix\src\components\generate\rating-panel.tsx`

- [ ] Make the single result the visual focus.
- [ ] Reduce system/status language while keeping loading clarity.
- [ ] Keep optional rating lightweight and unobtrusive.

### Task 5: Verification

**Files:**
- Modify if needed: `D:\06-project\vibepix\tests\e2e\home-to-result.spec.ts`

- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Run `npm run test:e2e`
- [ ] Start local dev server and confirm the experience is usable in browser.
