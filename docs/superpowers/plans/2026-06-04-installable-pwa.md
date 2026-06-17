# Installable PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app installable to desktop as a minimal PWA without adding offline support.

**Architecture:** Add a standards-based manifest, required icons, and a minimal service worker registration layer. Surface install affordance through a small client component while preserving the existing product flow and visual direction.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Web App Manifest, Service Worker, Vitest

---

### Task 1: PWA metadata foundation

**Files:**
- Create: `D:\06-project\vibepix\src\app\manifest.ts`
- Modify: `D:\06-project\vibepix\src\app\layout.tsx`
- Create: `D:\06-project\vibepix\public\icons\icon-192.png`
- Create: `D:\06-project\vibepix\public\icons\icon-512.png`

- [ ] Add installable manifest metadata with standalone display, start URL, theme colors, and desktop install icons.
- [ ] Expose matching viewport/theme metadata from the root layout.

### Task 2: Minimal service worker plumbing

**Files:**
- Create: `D:\06-project\vibepix\public\sw.js`
- Create: `D:\06-project\vibepix\src\components\pwa\service-worker-registrar.tsx`
- Modify: `D:\06-project\vibepix\src\app\layout.tsx`

- [ ] Register a minimal service worker without cache logic.
- [ ] Keep behavior limited to install support, not offline features.

### Task 3: Install entry UI

**Files:**
- Create: `D:\06-project\vibepix\src\components\pwa\install-app-card.tsx`
- Modify: `D:\06-project\vibepix\src\app\page.tsx`

- [ ] Listen for install availability and show a lightweight install call-to-action.
- [ ] Hide install UI when already installed or unsupported.
- [ ] Keep copy user-facing and non-technical.

### Task 4: Verification

**Files:**
- Create: `D:\06-project\vibepix\src\app\manifest.test.ts`

- [ ] Verify manifest shape in unit tests.
- [ ] Run `npm test`
- [ ] Run `npm run build`
- [ ] Start local dev server and confirm manifest and home page load.
