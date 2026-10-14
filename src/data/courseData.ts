import raw from './course.json';
import type { Course, FlatEntry, Module, Screen } from '../types';

export const course = raw.course as unknown as Course;
export const modules = raw.modules as unknown as Module[];

export const INTERACTIVE = ['mcq', 'multi_select', 'multi_fill_blank', 'reorder'] as const;
export const isInteractive = (s: Screen) => (INTERACTIVE as readonly string[]).includes(s.type);
export const isSynthetic = (s: Screen) => s.type === 'module_complete' || s.type === 'course_complete';

/**
 * Every screen in reading order. Each module is followed by a "module complete" screen and the course ends
 * with a "course complete" screen. Those two are celebration screens: they never count towards progress.
 */
export const flat: FlatEntry[] = [];
export const indexById: Record<string, number> = {};

modules.forEach((m, mi) => {
  const push = (screen: Screen) => {
    indexById[screen.id] = flat.length;
    flat.push({ screen, module: m, index: flat.length });
  };
  m.screens.forEach(push);
  push({ id: `${m.id}-complete`, type: 'module_complete' });
  if (mi === modules.length - 1) push({ id: 'course-complete', type: 'course_complete' });
});

export const realScreens: FlatEntry[] = flat.filter((e) => !isSynthetic(e.screen));
export const totalActivities = realScreens.filter((e) => isInteractive(e.screen)).length;

/** Tools mentioned anywhere in the course (for the badges on the landing page). */
export const toolNames: string[] = Array.from(
  new Set(realScreens.map((e) => e.screen.tool).filter((t): t is string => !!t)),
);

export const moduleOf = (id: string) => modules.find((m) => m.id === id);
export const pad2 = (n: number) => (n < 10 ? '0' + n : String(n));

/** Where screenshots and videos live. `assets/images/x.png` in course.json maps to `images/x.png` in /public. */
export const AUTO_SCREEN_IMAGES = true; // true: a screen with "visuals": 1 shows images/<screenId>.png if that file exists
export const assetUrl = (path: string) =>
  import.meta.env.BASE_URL +
  path
    .trim()
    .replace(/^\/+/, '')
    .replace(/^public\//, '')
    .replace(/^assets\/images\//, 'images/')
    .replace(/^assets\/videos\//, 'videos/');

/** A video for a screen: either a YouTube embed or a file in /public/videos. */
export type VideoSource = { kind: 'youtube'; id: string; embed: string; watch: string } | { kind: 'file'; src: string };

/** Pulls the 11-character video id out of any common YouTube link (watch, youtu.be, embed, shorts, live). */
function youTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    /* not an absolute URL: treat it as a local file */
  }
  return null;
}

export function videoSource(url: string): VideoSource {
  const id = youTubeId(url);
  if (id) return { kind: 'youtube', id, embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`, watch: `https://www.youtube.com/watch?v=${id}` };
  // Any other absolute URL (CDN, etc.) is used as is; everything else is a path inside /public.
  return { kind: 'file', src: /^https?:\/\//i.test(url) ? url : assetUrl(url) };
}

/** Image/video sources for a screen, or null to show the placeholder. */
export function mediaFor(s: Screen): { images: string[]; video?: VideoSource } | null {
  const video = s.outputVideo ? videoSource(s.outputVideo) : undefined;
  // A screen with an output video always shows it, even when "visuals" is not 1.
  if (s.visuals !== 1 && !video) return null;
  const listed = s.outputImages?.length ? s.outputImages : s.outputImage ? [s.outputImage] : [];
  if (listed.length) return { images: listed.map(assetUrl), video };
  if (AUTO_SCREEN_IMAGES && s.visuals === 1) return { images: [assetUrl(`images/${s.id}.png`)], video };
  return video ? { images: [], video } : null;
}
