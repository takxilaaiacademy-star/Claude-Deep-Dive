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

/** Where screenshots live. `assets/images/x.png` in course.json maps to `images/x.png` in /public. */
export const AUTO_SCREEN_IMAGES = true; // true: a screen with "visuals": 1 shows images/<screenId>.png if that file exists
export const assetUrl = (path: string) =>
  import.meta.env.BASE_URL + path.replace(/^\/+/, '').replace(/^assets\/images\//, 'images/');

/** Image/video sources for a screen, or null to show the placeholder. */
export function mediaFor(s: Screen): { images: string[]; video?: string } | null {
  if (s.visuals !== 1) return null;
  const images = s.outputImages?.length ? s.outputImages : s.outputImage ? [s.outputImage] : [];
  if (images.length || s.outputVideo) return { images: images.map(assetUrl), video: s.outputVideo ? assetUrl(s.outputVideo) : undefined };
  return AUTO_SCREEN_IMAGES ? { images: [assetUrl(`images/${s.id}.png`)] } : null;
}
