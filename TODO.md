# Aeyron website - open TODO

Tracking the outstanding website tasks. Items 1-5 came out of the pre-ship review;
6 and 7 added 2026-06-27.

## 1. Founder LinkedIn links
Replace the founder **email** links in the footer with **LinkedIn** URLs.
- Needs: the 3 LinkedIn profile URLs (Pingash Vohra, Vansh Jain, Siddharth Kwatra).
- File: `src/sections/Footer.tsx` (the "Company" column) + `src/content/site.ts` (`founders` array - add a `linkedin` field, drop/keep `email`).

## 2. Supabase waitlist
Connect the early-access form (currently `mailto:`) to Supabase.
- Needs: Supabase **Project URL** + **anon public key**.
- Plan: `@supabase/supabase-js`, `src/lib/supabase.ts`, a `waitlist` table (email, audience, created_at) with RLS **insert-only** for anon (no select), env vars `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (in `.env.local` + Vercel), update `src/sections/CTA.tsx` submit with success/duplicate/error states.

## 3. Hardware prototype (North Star)
Make the hardware in the North-Star section **clickable** -> expands / opens a small page showing the hardware prototype and how it works.
- Decide: in-page expanding panel/modal vs a small `/prototype` sub-page.
- Needs: content (a few lines + any renders / images / video, or a link to point to).
- File: `src/sections/NorthStar.tsx` (+ new component/page).

## 4. Mobile / phone transitions
The big pinned + scroll-scrubbed set-pieces are currently **desktop-only** (gated off mobile for battery), so iPhone gets calm static versions and feels less animated.
- Decide: add lighter scroll transitions on mobile (whileInView reveals, light parallax) without the heavy pinned/3D pieces.
- Confirm whether anything is actually broken on device vs just "less motion".

## 5. FDA wording
Footer line currently: "We are on a path to becoming a regulated medical device, and are pursuing FDA clearance." (`src/content/site.ts` -> `disclaimer.regulatory`).
- Change **"pursuing"** -> **"awaiting"** ONLY if a 510(k) / De Novo has actually been filed (otherwise "awaiting FDA clearance" is a false regulatory claim).

## 6. Employee / team page
Add a team / employees page (the people behind Aeyron).
- Decide: dedicated `/team` page vs an on-page section. Needs: names, roles, photos, short bios, links.

## 7. Domain change
Point the real custom domain at the Vercel deployment.
- In Vercel: Project -> Settings -> Domains -> add the domain; update DNS (A / CNAME) at the registrar. Update any hard-coded URLs / OG tags / `index.html` meta if needed.

---
Repo: github.com/VanshJain4/web-aeyron  ·  Deploy: Vercel (auto on push)
