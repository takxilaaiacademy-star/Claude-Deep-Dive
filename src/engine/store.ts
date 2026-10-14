// Learner progress: same state shape and suspend_data format as the original engine, exposed as a React store.
import { useSyncExternalStore } from 'react';
import { course, flat, isInteractive, modules, realScreens } from '../data/courseData';
import type { Module, Screen } from '../types';
import { Scorm } from './scorm';

interface State {
  c: string | null; // current screen id
  done: string[]; // visited screens
  correct: Record<string, true>; // interactive screens answered correctly
  attempts: Record<string, number>;
  modDone: string[];
  courseComplete: boolean;
}

const empty = (): State => ({ c: null, done: [], correct: {}, attempts: {}, modDone: [], courseComplete: false });
let state: State = empty();
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};

function serialize(s: State): string {
  const attempts = Object.keys(s.attempts).map((k) => k + ':' + s.attempts[k]).join(',');
  return [course.id, s.c || '', s.done.join(','), Object.keys(s.correct).join(','), attempts, s.modDone.join(','), s.courseComplete ? '1' : '0'].join('|');
}

function deserialize(str: string): State {
  const s = empty();
  if (!str) return s;
  const parts = str.split('|');
  const stamped = parts[0] === course.id;
  if (!stamped && parts.length < 6) return s;
  const o = stamped ? 1 : 0;
  const list = (v?: string) => (v ? v.split(',').filter(Boolean) : []);
  s.c = parts[o] || null;
  s.done = list(parts[o + 1]);
  list(parts[o + 2]).forEach((id) => (s.correct[id] = true));
  list(parts[o + 3]).forEach((pair) => {
    const [k, n] = pair.split(':');
    s.attempts[k] = parseInt(n, 10) || 0;
  });
  s.modDone = list(parts[o + 4]);
  s.courseComplete = parts[o + 5] === '1';
  return s;
}

const persist = () => {
  Scorm.setSuspendData(serialize(state));
  if (state.c) Scorm.setLocation(state.c);
  Scorm.commit();
};

// ---- Progress rules (same as the original): interactive screens need a correct answer, others need a visit.
const met = (s: Screen) => (isInteractive(s) ? !!state.correct[s.id] : state.done.includes(s.id));
const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

export const Progress = {
  isInteractive,
  canAdvance: (s: Screen) => (s.type === 'module_complete' || s.type === 'course_complete' ? true : met(s)),
  moduleProgress: (m: Module) => pct(m.screens.filter(met).length, m.screens.length),
  isModuleDone: (m: Module) => m.screens.every(met),
  courseProgress: () => pct(realScreens.filter((e) => met(e.screen)).length, realScreens.length),
  isCourseDone: () => realScreens.every((e) => met(e.screen)),
};

/** A light "XP" score for the progress pill: 5 per screen seen, 20 more for each correct answer. */
export const xp = () => state.done.length * 5 + Object.keys(state.correct).length * 20;

export const Learner = {
  boot() {
    Scorm.init();
    state = deserialize(Scorm.getSuspendData());
    const loc = Scorm.getLocation();
    if (loc && !state.c) state.c = loc;
    emit();
  },
  current: () => state.c,
  hasProgress: () => !!(state.c && flat.some((e) => e.screen.id === state.c)),
  visit(id: string) {
    if (!state.done.includes(id)) state.done = [...state.done, id];
    state = { ...state, c: id };
    persist();
    emit();
    // Safety net from the original: report SCORM completion once the learner reaches the end.
    const idx = flat.findIndex((e) => e.screen.id === id);
    if (idx >= flat.length - 2 && Scorm.getLessonStatus() !== 'completed') {
      Scorm.setLessonStatus('completed');
      Scorm.commit();
    }
  },
  isCorrect: (id: string) => !!state.correct[id],
  attempt(id: string) {
    state = { ...state, attempts: { ...state.attempts, [id]: (state.attempts[id] || 0) + 1 } };
    persist();
    emit();
  },
  markCorrect(id: string) {
    state = {
      ...state,
      correct: { ...state.correct, [id]: true },
      done: state.done.includes(id) ? state.done : [...state.done, id],
    };
    persist();
    emit();
  },
  markModuleDone(id: string) {
    if (state.modDone.includes(id)) return;
    state = { ...state, modDone: [...state.modDone, id] };
    persist();
    emit();
  },
  completeCourse() {
    if (state.courseComplete) return;
    state = { ...state, courseComplete: true };
    Scorm.setLessonStatus('completed');
    persist();
    emit();
  },
  reset() {
    state = empty();
    Scorm.setSuspendData('');
    Scorm.setLocation('');
    Scorm.setLessonStatus('incomplete');
    Scorm.commit();
    emit();
  },
  flush() {
    persist();
  },
};

/** Re-renders the component whenever learner progress changes. Returns a version number. */
export function useLearner(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}

export const allModules = modules;
