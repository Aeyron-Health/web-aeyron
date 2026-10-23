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
The North Star and Roadmap sections were removed from the public site in the wellness-copy pass (App Store review), because they described future monitoring and an FDA path. If a hardware page comes back, it needs wellness-only wording first.

## 4. Mobile / phone transitions
The big pinned + scroll-scrubbed set-pieces are currently **desktop-only** (gated off mobile for battery), so iPhone gets calm static versions and feels less animated.
- Decide: add lighter scroll transitions on mobile (whileInView reveals, light parallax) without the heavy pinned/3D pieces.
- Confirm whether anything is actually broken on device vs just "less motion".

## 5. FDA wording
Done: the regulatory line ("on a path to becoming a regulated medical device... pursuing FDA clearance") and the FDA / 510(k) / De Novo roadmap were removed from the public site. The app is positioned as a wellness companion, not a medical device. Do not reintroduce regulatory-path claims on the public site.

## 6. Employee / team page
Add a team / employees page (the people behind Aeyron).
- Decide: dedicated `/team` page vs an on-page section. Needs: names, roles, photos, short bios, links.

## 7. Domain change
Point the real custom domain at the Vercel deployment.
- In Vercel: Project -> Settings -> Domains -> add the domain; update DNS (A / CNAME) at the registrar. Update any hard-coded URLs / OG tags / `index.html` meta if needed.

---
Repo: github.com/VanshJain4/web-aeyron  ·  Deploy: Vercel (auto on push)
