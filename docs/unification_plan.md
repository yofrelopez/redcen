# Documentation: Audio & Video Robot Architecture (2025)

## 1. Context & Current Situation
As of **January 9, 2026**, the Redcen project operates with two distinct automated robots:

### Robot A: "The Web Audio Robot" (Original)
*   **Purpose:** Generates audio news, updates the `redcen.com` database (Prisma), publishes to web.
*   **Location:** Running in production on **Vercel** (`main` branch).
*   **Script:** `scripts/audio-news-worker/index.ts` (Original Version).
*   **Dependencies:** Heavy (Next.js, Prisma, NextAuth).

### Robot B: "The Social Video Robot" (New)
*   **Purpose:** Generates a 4-minute video reel, publishes DIRECTLY to Facebook.
*   **Location:** Running in cloud on **GitHub Actions** (`feature/audio-video-reels` branch).
*   **Script:** `scripts/audio-news-worker/index.ts` (Refactored Version).
*   **Dependencies:** Lightweight (`axios`, `remotion`, `facebook-client.ts`), detached from DB.
*   **Status:** **operational** (Verified 4-min video generation).

---

## 2. The Implementation Gap
The new Robot B works perfectly, BUT it lives in a feature branch.
**Critical Consequence:** GitHub Actions Scheduled Triggers (`cron: '0 10 * * *'`) **DO NOT RUN** on non-default branches. The daily alarm is currently dormant.

To wake it up, code must merge to `main`.
**The Conflict:** Both robots share the same filename: `index.ts`. Merging now would create a conflict or overwrite Robot A.

---

## 3. Unification Plan (Roadmap)

To enable automatic scheduling without breaking the website, follow these steps:

### Step 1: Rename the Video Robot
Move the new logic to a dedicated file so both robots can coexist.
*   **Current:** `scripts/audio-news-worker/index.ts` (Video Logic)
*   **Target:** `scripts/audio-news-worker/video-robot.ts`

### Step 2: Restore the Audio Robot
Revert `index.ts` in the feature branch to match `main` (so the Web Robot stays intact).

### Step 3: Update Workflow
Point the GitHub Action (`daily-reel.yml`) to execute `tsx video-robot.ts` instead of `index.ts`.

### Step 4: Merge to Main
Once file conflicts are resolved:
1.  Merge `feature/audio-video-reels` -> `main`.
2.  GitHub will detect the `.yml` in `main` and register the Cron Schedule.
3.  **Result:**
    *   Vercel runs Web Robot (`index.ts` - triggered via Cron Job or Webhook).
    *   GitHub runs Video Robot (`video-robot.ts` - triggered via Action Schedule).

---

## 4. Key Configurations (For Reference)

### Facebook Client (`lib/facebook-client.ts`)
*   **Host:** `graph-video.facebook.com` (Robust uploads).
*   **Endpoint:** `/videos` (Supports >90s content).
*   **API Version:** `v19.0`.
*   **Auth:** Requires `FB_PAGE_ACCESS_TOKEN` with `pages_manage_posts` & `pages_show_list`.

### GitHub Actions (`daily-reel.yml`)
*   **Timeout:** `60 minutes` (CRITICAL for safe rendering).
*   **Concurrency:** Limited to 1 job at a time.
*   **Secrets Required:**
    *   `OPENAI_API_KEY`
    *   `CLOUDINARY_*`
    *   `FB_PAGE_*`
    *   `R2_*` (Cloudflare)
