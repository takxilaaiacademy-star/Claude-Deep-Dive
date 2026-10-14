// Language choice and live translation. Prompts meant to be pasted into Claude are never translated.
import { course } from '../data/courseData';
import type { Course, Module, Paragraph, Screen } from '../types';

export interface Lang {
  code: string;
  name: string;
  native: string;
}

export const LANGUAGES: Lang[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fil', name: 'Filipino', native: 'Filipino' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
];

const LANG_KEY = 'takxila_lang_pref__' + course.id;
export const getLangPref = (): string => {
  try {
    return localStorage.getItem(LANG_KEY) || 'en';
  } catch {
    return 'en';
  }
};
export const setLangPref = (code: string) => {
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch {
    /* ignore */
  }
};
export const langName = (code: string) => LANGUAGES.find((l) => l.code === code)?.name ?? code;

// Brand and product names that machine translation must not touch.
const PROTECTED = ['Claude', 'ChatGPT', 'Canva', 'AutoCAD', 'SolidWorks', 'Jira', 'Dip Singh', 'Gabi', 'Takxila'].sort((a, b) => b.length - a.length);

function protect(text: string) {
  const map: string[] = [];
  let out = text;
  PROTECTED.forEach((term) => {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    out = out.replace(re, () => {
      map.push(term);
      return `__PROTECT${map.length - 1}__`;
    });
  });
  return { text: out, map };
}
const restore = (text: string, map: string[]) =>
  map.reduce((acc, term, i) => acc.replace(new RegExp(`__\\s*PROTECT\\s*${i}\\s*__`, 'gi'), term), text);

async function viaGoogle(text: string, lang: string): Promise<string> {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + encodeURIComponent(lang) + '&dt=t&q=' + encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Translate returned ' + res.status);
  const data = (await res.json()) as [Array<[string]>];
  const out = data[0].map((c) => c[0]).join('');
  if (!out.trim()) throw new Error('Empty translation');
  return out;
}

async function viaMyMemory(text: string, lang: string): Promise<string> {
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|' + encodeURIComponent(lang);
  const res = await fetch(url);
  if (!res.ok) throw new Error('MyMemory returned ' + res.status);
  const data = (await res.json()) as { responseData?: { translatedText?: string } };
  const out = data.responseData?.translatedText;
  if (!out || !out.trim()) throw new Error('Empty translation');
  return out;
}

/** Throws when both providers fail, so callers can say honestly that a translation did not happen. */
export async function translateText(text: string, lang: string): Promise<string> {
  if (!text || lang === 'en') return text;
  const p = protect(text);
  let out: string;
  try {
    out = await viaGoogle(p.text, lang);
  } catch {
    out = await viaMyMemory(p.text, lang);
  }
  return p.map.length ? restore(out, p.map) : out;
}

const safe = (text: string, lang: string) => translateText(text, lang).catch(() => text);

const moduleCache: Record<string, Module> = {};
export async function translateModule(m: Module, lang: string): Promise<Module> {
  const key = m.id + '::' + lang;
  if (moduleCache[key]) return moduleCache[key];
  const [title, outcomes] = await Promise.all([safe(m.title, lang), Promise.all((m.outcomes || []).map((o) => safe(o, lang)))]);
  return (moduleCache[key] = { ...m, title, outcomes });
}

const courseCache: Record<string, Course> = {};
export async function translateCourseMeta(c: Course, lang: string): Promise<Course> {
  if (courseCache[lang]) return courseCache[lang];
  const [title, subtitle, description, whoFor] = await Promise.all([safe(c.title, lang), safe(c.subtitle, lang), safe(c.description, lang), safe(c.whoFor, lang)]);
  return (courseCache[lang] = { ...c, title, subtitle, description, whoFor });
}

type StrField = 'heading' | 'description' | 'promptLabel' | 'outputLabel' | 'explanation' | 'question' | 'instruction' | 'template' | 'note';

async function translateScreen(s: Screen, lang: string): Promise<Screen> {
  const c: Screen = JSON.parse(JSON.stringify(s));
  const jobs: Promise<unknown>[] = [];
  const field = (k: StrField) => {
    const v = s[k];
    if (v) jobs.push(safe(v, lang).then((t) => void (c[k] = t)));
  };

  switch (s.type) {
    case 'text':
      field('heading');
      if (s.body) {
        jobs.push(
          Promise.all(
            s.body.map(async (p: Paragraph): Promise<Paragraph> => {
              if (typeof p === 'string') return safe(p, lang);
              if ('list' in p) {
                const list = await Promise.all(p.list.map(async (it) => ({ label: await safe(it.label, lang), text: await safe(it.text, lang) })));
                return { list };
              }
              return p; // inline prompts stay in English so they paste correctly
            }),
          ).then((b) => void (c.body = b)),
        );
      }
      break;
    case 'mcq':
    case 'multi_select':
      field('question');
      field('explanation');
      if (s.options) {
        const opts = s.options;
        jobs.push(Promise.all(opts.map((o) => safe(o.text, lang))).then((t) => void (c.options = opts.map((o, i) => ({ ...o, text: t[i] })))));
      }
      break;
    case 'key_takeaways':
      if (s.items) {
        const items = s.items as string[];
        jobs.push(Promise.all(items.map((i) => safe(i, lang))).then((t) => void (c.items = t)));
      }
      break;
    case 'tool_intro':
      field('description');
      if (s.steps) jobs.push(Promise.all(s.steps.map((x) => safe(x, lang))).then((t) => void (c.steps = t)));
      break;
    case 'prompt_and_output':
      field('promptLabel');
      field('outputLabel');
      field('explanation');
      break;
    case 'practice_task':
      field('heading');
      field('note');
      break;
    case 'multi_fill_blank':
      field('heading');
      field('template');
      field('explanation');
      if (s.blanks) {
        const blanks = s.blanks;
        const nb = blanks.map((b) => ({ options: b.options.slice(), correct: b.correct }));
        c.blanks = nb;
        blanks.forEach((b, bi) =>
          b.options.forEach((opt, oi) =>
            jobs.push(
              safe(opt, lang).then((t) => {
                nb[bi].options[oi] = t;
                if (opt === b.correct) nb[bi].correct = t; // keep the right answer in sync with its translated label
              }),
            ),
          ),
        );
      }
      break;
    case 'reorder':
      field('instruction');
      field('explanation');
      if (s.items) {
        const items = s.items as Array<{ id: string; text: string }>;
        jobs.push(Promise.all(items.map((i) => safe(i.text, lang))).then((t) => void (c.items = items.map((i, k) => ({ ...i, text: t[k] })))));
      }
      break;
    default:
      break;
  }
  await Promise.all(jobs);
  return c;
}

const screenCache: Record<string, Screen> = {};
const inFlight: Record<string, Promise<Screen>> = {};
export function fetchTranslatedScreen(s: Screen, lang: string): Promise<Screen> {
  const key = s.id + '::' + lang;
  if (screenCache[key]) return Promise.resolve(screenCache[key]);
  if (!inFlight[key]) {
    inFlight[key] = translateScreen(s, lang)
      .then((t) => (screenCache[key] = t))
      .finally(() => {
        delete inFlight[key];
      });
  }
  return inFlight[key];
}
export const isScreenCached = (id: string, lang: string) => !!screenCache[id + '::' + lang];

/** True if translation changed anything (otherwise every field fell back to English). */
export const actuallyTranslated = (orig: Screen, t: Screen) => JSON.stringify(orig) !== JSON.stringify(t);
