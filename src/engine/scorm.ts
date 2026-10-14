// SCORM 1.2 wrapper. Inside an LMS it talks to the real API; anywhere else it saves to localStorage.
import { course } from '../data/courseData';

interface Api {
  LMSInitialize(s: string): string | boolean;
  LMSFinish(s: string): string | boolean;
  LMSGetValue(k: string): string;
  LMSSetValue(k: string, v: string): string | boolean;
  LMSCommit(s: string): string | boolean;
}

const SHIM_KEY = 'takxila_scorm_shim_v1__' + course.id;
let api: Api | null = null;
let initialized = false;
let usingShim = false;
let shimData: Record<string, string> = {};

type WinWithApi = Window & { API?: Api };

function findAPI(start: Window | null): Api | null {
  let win = start as WinWithApi | null;
  let tries = 0;
  while (win && !win.API && win.parent && win.parent !== win && tries < 10) {
    tries++;
    win = win.parent as WinWithApi;
  }
  return win?.API ?? null;
}

function locateAPI(): Api | null {
  try {
    return findAPI(window) ?? (window.opener ? findAPI(window.opener as Window) : null);
  } catch {
    return null; // cross-origin parent: treat as "no LMS"
  }
}

const loadShim = () => {
  try {
    const raw = localStorage.getItem(SHIM_KEY);
    shimData = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    shimData = {};
  }
};
const saveShim = () => {
  try {
    localStorage.setItem(SHIM_KEY, JSON.stringify(shimData));
  } catch {
    /* storage full or blocked: progress just won't persist */
  }
};

const shim: Api = {
  LMSInitialize() {
    loadShim();
    if (!shimData['cmi.core.lesson_status']) shimData['cmi.core.lesson_status'] = 'not attempted';
    return 'true';
  },
  LMSFinish() {
    saveShim();
    return 'true';
  },
  LMSGetValue: (k) => (shimData[k] !== undefined ? shimData[k] : ''),
  LMSSetValue(k, v) {
    shimData[k] = v;
    return 'true';
  },
  LMSCommit() {
    saveShim();
    return 'true';
  },
};

const ok = (r: string | boolean) => r === 'true' || r === true;

export const Scorm = {
  isShim: () => usingShim,
  init(): boolean {
    if (initialized) return true;
    api = locateAPI();
    if (!api) {
      api = shim;
      usingShim = true;
    }
    initialized = ok(api.LMSInitialize(''));
    return initialized;
  },
  terminate() {
    if (!initialized || !api) return;
    this.commit();
    api.LMSFinish('');
    initialized = false;
  },
  get(key: string): string {
    return initialized && api ? api.LMSGetValue(key) : '';
  },
  set(key: string, value: string | number): boolean {
    return initialized && api ? ok(api.LMSSetValue(key, String(value))) : false;
  },
  commit(): boolean {
    return initialized && api ? ok(api.LMSCommit('')) : false;
  },
  getLessonStatus: () => Scorm.get('cmi.core.lesson_status') || 'not attempted',
  setLessonStatus: (status: 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted') =>
    Scorm.set('cmi.core.lesson_status', status),
  getSuspendData: () => Scorm.get('cmi.suspend_data') || '',
  setSuspendData: (s: string) => Scorm.set('cmi.suspend_data', s),
  getLocation: () => Scorm.get('cmi.core.lesson_location') || '',
  setLocation: (s: string) => Scorm.set('cmi.core.lesson_location', s),
};
