# Loopin frontend

The frontend for **Loopin** — a social hangout built for teenagers. Stories
that expire, colorful expressive posts, gradient-squircle avatars, and a
profile that's actually *yours*. Dark-mode-first, motion-polished, and wired
directly to the Loopin Spring Boot backend.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**, dark mode via the `class` strategy
- Fonts via `next/font/google`: Space Grotesk (display), Inter (body), JetBrains Mono (handles, timestamps, tags)
- `lucide-react` icons, no external UI kit

## Quick start

```bash
npm install
cp .env.example .env.local   # set your API URL
npm run dev
```

The only variable you need:

| Variable | Default | What it is |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Base URL of the API gateway |

## Scripts

```bash
npm run dev    # dev server
npm run build  # production build
npm start      # serve the production build
npm run lint   # next lint
```

## Project structure

```
app/
  layout.tsx            fonts, metadata, providers
  providers.tsx         ThemeProvider + AuthProvider
  globals.css           design tokens (CSS vars, light+dark), utilities, motion
  (app)/                route group — everything inside the authenticated shell
    layout.tsx          AppShell (auth gate, sidebar, mobile header)
    page.tsx            home feed: stories, composer, Recents/Popular tabs, right rail
    profile/page.tsx    your own profile
    profile/[username]/ someone else's profile
    friends/page.tsx    browse + search people to follow
    notifications/      New vs Earlier, mark-all-read
    messages/           honest "coming soon" empty state (no messaging backend)
    settings/           theme, account, about, logout
components/             Avatar, PostCard, StoryRow, Composer, Onboarding, etc.
lib/                    api client, auth context, theme context, types (mirrors backend DTOs)
```

## Backend contract notes (important)

All types in `lib/types.ts` mirror the live Java DTOs **exactly** — field
names were copied, not invented (`name`, not `displayName`; `gradeLabel` is a
strict 4-value enum; `likedByCurrentUser`, `followedByCurrentUser`, …).

Known backend limitations the UI is honest about:

- **No image upload anywhere.** Stories take a pasted, already-hosted image
  URL (with live preview). The UI says this plainly instead of showing a
  broken file picker. Posts use the decorative "color card" system instead of
  photos (same gradient-picker component as avatars).
- **No follower/following list endpoint** — only counts. Counts are tappable
  and open a "coming soon" sheet that uses `/users/suggestions` as a "people
  you may know" stand-in. No fake follower data is fabricated.
- **No messaging backend at all** — `/messages` is a designed empty state.
- **Tokens are long-lived (7 days) with no refresh flow**, stored in
  `localStorage` (accepted XSS tradeoff for this build — noted in Settings).
- The backend creates **one notification row per like** (no aggregation); the
  UI groups by New (unread) vs Earlier (read), straight from the `read` flag.
- **"Popular" tab** is a client-side sort by `likeCount` — the backend has no
  sort parameter (the UI labels it as such).

## Design system

Colors are CSS custom properties (`--violet`, `--card`, `--line`, …) with a
`.dark` override, exposed to Tailwind as theme colors — so light/dark flips
everywhere including gradient stops. Cards are `rounded-[26px]` with a 1px
`line` border. Avatars are **never photos**: a gradient squircle
(`32% 28% 30% 34%/34% 30% 32% 28%`) with white bold initials.

### Avatar builder (beta)

The layered face picker (face shape, eyes, mouth, hair, accessory) composites
one inline SVG over the gradient. The backend only has a single
`VARCHAR(60)` gradient column today, so the face **recipe** (one serializable
JSON object) is stored in `localStorage` per device, with a note in the UI —
it's structured to drop straight into a future `avatar_config` column without
redesigning the picker.

## Motion

Everything eases with `cubic-bezier(.22,1,.36,1)`: staggered fade-up card
entrances, a "pop" like animation, pulsing gradient story rings, tactile
button presses, shimmer skeletons (never spinners, never a blank flash).
`prefers-reduced-motion` disables all of it.
