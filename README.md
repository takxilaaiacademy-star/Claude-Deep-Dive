# Claude Deep Dive (React)

The Takxila "Claude Deep Dive" course rebuilt in React + TypeScript + MUI, using the same theme, animations and scrollbar as the Takxila Demo site.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # optional: full TypeScript check
npm run build      # output in dist/
npm run scorm      # build + rewrite dist/imsmanifest.xml; zip the *contents* of dist/ for your LMS
```

## Where things are
- `src/data/course.json` – the course content (unchanged from the original). Edit it as before.
- `src/theme/theme.ts` – Takxila colours, fonts, gradient scrollbar. `src/context/ThemeModeContext.tsx` – dark/light toggle and all animation keyframes.
- `src/components/fx.tsx`, `Motion.tsx`, `Background.tsx` – Takxila's effects (orbs, meteors, tilt cards, scroll timeline, lamp, marquee...).
- `src/components/screens/` – one component per screen type. `src/pages/Landing.tsx`, `Player.tsx` – the two pages.
- `src/engine/` – progress + SCORM (`store.ts`, `scorm.ts`), narration (`audio.ts`), translation (`i18n.ts`).

## Screenshots
The lesson PNGs in the original zip were Git LFS pointer files, not images. Run `git lfs pull` in the original repo and copy the real files into `public/images/` (same file names, e.g. `m01-s03.png`).
A screen with `"visuals": 1` shows `images/<screen-id>.png` automatically; set `AUTO_SCREEN_IMAGES = false` in `src/data/courseData.ts` to use only `outputImage` / `outputImages` / `outputVideo` from course.json.
