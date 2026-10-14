import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, Button, ButtonBase, Typography } from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { pad2 } from '../../data/courseData';
import { Narrator } from '../../engine/audio';
import { Learner, useLearner } from '../../engine/store';
import type { Module, Option, Screen } from '../../types';
import { inline, Rich } from '../../utils/text';
import Confetti from '../Confetti';
import { Glass, MONO, OptionRow, XpPop } from '../ui';
import { ScreenHead } from './Basics';

/** Confetti that removes itself after a few seconds. */
export function Burst({ pieces }: { pieces: number }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setOn(false), 3200);
    return () => clearTimeout(id);
  }, []);
  return on ? <Confetti pieces={pieces} /> : null;
}

function Feedback({ right, explanation, onRetake, onShow }: { right: boolean; explanation?: string; onRetake?: () => void; onShow?: () => void }) {
  return (
    <Box
      role="status"
      sx={() => ({
        mt: 2.5, p: 2.25, borderRadius: '18px', border: `1.5px solid ${right ? '#2EBD85' : '#FF6B6B'}`, background: right ? 'rgba(46,189,133,.1)' : 'rgba(255,107,107,.1)',
        animation: 'txpop .35s cubic-bezier(.2,.8,.2,1) both',
      })}
    >
      <Typography sx={{ fontWeight: 800, mb: 0.75, color: right ? '#2EBD85' : '#FF6B6B' }}>{right ? 'Correct! Good thinking.' : 'Wrong attempt! Try again.'}</Typography>
      {explanation && <Rich text={explanation} size={15} />}
      {!right && (
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mt: 2 }}>
          <Button variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={onRetake}>
            Retake
          </Button>
          <Button variant="contained" onClick={onShow}>
            Show correct answer and continue
          </Button>
        </Box>
      )}
    </Box>
  );
}

function QuizShell({ s, m, tag, children, justRight }: { s: Screen; m: Module; tag: string; children: ReactNode; justRight: boolean }) {
  return (
    <>
      <ScreenHead kicker={`Module ${pad2(m.number)} check`} title="Knowledge check" screen={s} module={m} size={34} />
      <Glass>
        {justRight && <XpPop amount={20} />}
        {justRight && <Burst pieces={30} />}
        <Box
          sx={(t) => ({
            display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, mb: 2, borderRadius: 999, fontWeight: 800, fontSize: 13,
            color: s.popQuiz ? '#1b1200' : t.tx.hl, background: s.popQuiz ? t.tx.hl : 'transparent', border: `1px solid ${t.tx.hl}`, '& svg': { fontSize: 16 },
          })}
        >
          {s.popQuiz && <BoltRoundedIcon />}
          {s.popQuiz ? 'Surprise pop quiz' : tag}
        </Box>
        {children}
      </Glass>
    </>
  );
}

type St = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';

/** Shared checking flow: records the attempt, then marks the screen correct and plays the cues. */
function useCheck(s: Screen) {
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(false);
  const [justRight, setJustRight] = useState(false);
  const locked = Learner.isCorrect(s.id);
  const submit = (isRight: boolean) => {
    Learner.attempt(s.id);
    setChecked(true);
    setRight(isRight);
    if (isRight) {
      Learner.markCorrect(s.id);
      Narrator.correct();
      setJustRight(true);
    } else {
      Narrator.wrong();
    }
  };
  const reset = () => {
    setChecked(false);
    setRight(false);
  };
  const showAnswer = () => Learner.markCorrect(s.id);
  return { checked, right, locked, justRight, submit, reset, showAnswer, reveal: locked || checked };
}

// ---------------------------------------------------------------- MCQ
export function Mcq({ screen: s, module: m }: { screen: Screen; module: Module }) {
  useLearner();
  const c = useCheck(s);
  const [chosen, setChosen] = useState<string | null>(null);
  const opts = s.options || [];
  const stateOf = (o: Option): St => {
    if (c.reveal) return o.id === s.correct ? 'correct' : o.id === chosen && !c.locked ? 'wrong' : 'dim';
    return chosen === o.id ? 'selected' : 'idle';
  };
  return (
    <QuizShell s={s} m={m} tag="Quick check" justRight={c.justRight}>
      <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, lineHeight: 1.5, mb: 2 }}>{inline(s.question || '')}</Typography>
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        {opts.map((o) => (
          <OptionRow key={o.id} label={o.text} state={stateOf(o)} onClick={c.reveal ? undefined : () => { Narrator.unlock(); setChosen(o.id); }} />
        ))}
      </Box>
      {!c.reveal && (
        <Button variant="contained" size="large" disabled={!chosen} onClick={() => c.submit(chosen === s.correct)} sx={{ mt: 2.5 }}>
          Check answer
        </Button>
      )}
      {c.reveal && <Feedback right={c.locked || c.right} explanation={s.explanation} onRetake={() => { setChosen(null); c.reset(); }} onShow={c.showAnswer} />}
    </QuizShell>
  );
}

// ---------------------------------------------------------------- Multi-select
export function MultiSelect({ screen: s, module: m }: { screen: Screen; module: Module }) {
  useLearner();
  const c = useCheck(s);
  const [sel, setSel] = useState<string[]>([]);
  const correct = (Array.isArray(s.correct) ? s.correct : s.correct ? [s.correct] : []) as string[];
  const stateOf = (o: Option): St => {
    if (c.reveal) return correct.includes(o.id) ? 'correct' : sel.includes(o.id) && !c.locked ? 'wrong' : 'dim';
    return sel.includes(o.id) ? 'selected' : 'idle';
  };
  const check = () => {
    const isRight = sel.length === correct.length && sel.every((id) => correct.includes(id));
    c.submit(isRight);
  };
  return (
    <QuizShell s={s} m={m} tag="Select all that apply" justRight={c.justRight}>
      <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, lineHeight: 1.5, mb: 2 }}>{inline(s.question || '')}</Typography>
      <Box sx={{ display: 'grid', gap: 1.25 }}>
        {(s.options || []).map((o) => (
          <OptionRow
            key={o.id}
            kind="check"
            label={o.text}
            state={stateOf(o)}
            onClick={c.reveal ? undefined : () => { Narrator.unlock(); setSel((v) => (v.includes(o.id) ? v.filter((x) => x !== o.id) : [...v, o.id])); }}
          />
        ))}
      </Box>
      {!c.reveal && (
        <Button variant="contained" size="large" disabled={!sel.length} onClick={check} sx={{ mt: 2.5 }}>
          Check answer
        </Button>
      )}
      {c.reveal && <Feedback right={c.locked || c.right} explanation={s.explanation} onRetake={() => { setSel([]); c.reset(); }} onShow={c.showAnswer} />}
    </QuizShell>
  );
}

// ---------------------------------------------------------------- Build the prompt (several blanks)
export function MultiFillBlank({ screen: s, module: m }: { screen: Screen; module: Module }) {
  useLearner();
  const c = useCheck(s);
  const blanks = s.blanks || [];
  const [filled, setFilled] = useState<Record<number, string>>({});
  const value = (i: number) => (c.locked ? blanks[i].correct : filled[i]);
  const parts = (s.template || '').split(/(\[\[\d+\]\])/);
  const all = blanks.every((_, i) => filled[i]);
  return (
    <QuizShell s={s} m={m} tag="Build the prompt" justRight={c.justRight}>
      {s.heading && <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{inline(s.heading)}</Typography>}
      <Box sx={(t) => ({ p: 2.25, borderRadius: '16px', border: `1px solid ${t.tx.line}`, background: t.palette.mode === 'dark' ? 'rgba(10,16,34,.6)' : 'rgba(255,255,255,.8)', fontFamily: MONO, fontSize: 15, lineHeight: 2.1 })}>
        {parts.map((p, k) => {
          const mm = p.match(/^\[\[(\d+)\]\]$/);
          if (!mm) return <span key={k}>{p}</span>;
          const i = parseInt(mm[1], 10) - 1;
          const v = value(i);
          const ok = c.reveal && v === blanks[i]?.correct;
          const bad = c.reveal && !c.locked && v !== blanks[i]?.correct;
          return (
            <Box
              component="span"
              key={k}
              sx={(t) => ({
                display: 'inline-block', minWidth: 90, textAlign: 'center', px: 1, mx: 0.25, borderRadius: '8px', fontWeight: 700, transition: 'all .25s',
                color: ok ? '#2EBD85' : bad ? '#FF6B6B' : v ? t.tx.hl : 'text.secondary', borderBottom: `2px solid ${ok ? '#2EBD85' : bad ? '#FF6B6B' : t.tx.hl}`, background: v ? t.tx.glow : 'transparent',
              })}
            >
              {v || '______'}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, mt: 2.5 }}>
        {blanks.map((b, i) => (
          <Box key={i}>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: 'secondary.main', mb: 0.75 }}>Blank {i + 1}</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {b.options.map((opt) => {
                let st: St = 'idle';
                if (c.reveal) st = opt === b.correct ? 'correct' : !c.locked && filled[i] === opt ? 'wrong' : 'dim';
                else if (filled[i] === opt) st = 'selected';
                return <OptionRow key={opt} mono label={opt} state={st} onClick={c.reveal ? undefined : () => { Narrator.unlock(); setFilled((f) => ({ ...f, [i]: opt })); }} />;
              })}
            </Box>
          </Box>
        ))}
      </Box>
      {!c.reveal && (
        <Button variant="contained" size="large" disabled={!all} onClick={() => c.submit(blanks.every((b, i) => filled[i] === b.correct))} sx={{ mt: 2.5 }}>
          Check answer
        </Button>
      )}
      {c.reveal && <Feedback right={c.locked || c.right} explanation={s.explanation} onRetake={() => { setFilled({}); c.reset(); }} onShow={c.showAnswer} />}
    </QuizShell>
  );
}

// ---------------------------------------------------------------- Reorder
function shuffledDifferent(ids: string[], correct: string[]): string[] {
  const copy = ids.slice();
  let tries = 0;
  do {
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    tries++;
  } while (copy.join() === correct.join() && tries < 8);
  return copy;
}

export function Reorder({ screen: s, module: m }: { screen: Screen; module: Module }) {
  useLearner();
  const c = useCheck(s);
  const items = useMemo(() => (s.items || []) as Option[], [s.items]);
  const correctOrder = s.correctOrder || [];
  const [order, setOrder] = useState<string[]>(() => shuffledDifferent(items.map((i) => i.id), correctOrder));
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const shown = c.locked ? correctOrder : order;
  const textOf = (id: string) => items.find((i) => i.id === id)?.text ?? id;
  const frozen = c.reveal;

  const move = (id: string, dir: -1 | 1) =>
    setOrder((o) => {
      const i = o.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= o.length) return o;
      const copy = o.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const drop = (targetId: string) => {
    setOver(null);
    if (!dragId || dragId === targetId) return;
    setOrder((o) => {
      const copy = o.slice();
      copy.splice(copy.indexOf(dragId), 1);
      copy.splice(copy.indexOf(targetId), 0, dragId);
      return copy;
    });
  };

  return (
    <QuizShell s={s} m={m} tag="Rearrange in order" justRight={c.justRight}>
      <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.55, mb: 2 }}>{inline(s.instruction || '')}</Typography>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
        {shown.map((id, i) => {
          const pos = frozen ? (shown[i] === correctOrder[i] ? 'ok' : 'bad') : null;
          return (
            <Box
              component="li"
              key={id}
              draggable={!frozen}
              onDragStart={() => setDragId(id)}
              onDragEnd={() => { setDragId(null); setOver(null); }}
              onDragOver={(e) => { e.preventDefault(); if (over !== id) setOver(id); }}
              onDragLeave={() => setOver((o) => (o === id ? null : o))}
              onDrop={(e) => { e.preventDefault(); drop(id); }}
              sx={(t) => ({
                display: 'flex', alignItems: 'center', gap: 1.25, p: '10px 12px', borderRadius: '16px', transition: 'transform .25s cubic-bezier(.2,.8,.2,1), border-color .2s, background-color .2s, opacity .2s',
                border: `1.5px solid ${pos === 'ok' ? '#2EBD85' : pos === 'bad' ? '#FF6B6B' : over === id ? t.tx.hl : t.tx.line}`,
                background: pos === 'ok' ? 'rgba(46,189,133,.12)' : pos === 'bad' ? 'rgba(255,107,107,.12)' : over === id ? t.tx.glow : t.tx.surface,
                opacity: dragId === id ? 0.45 : 1, cursor: frozen ? 'default' : 'grab', animation: pos === 'bad' ? 'txshake .45s' : 'none',
                '&:active': { cursor: frozen ? 'default' : 'grabbing' },
              })}
            >
              {!frozen && <DragIndicatorRoundedIcon sx={{ color: 'text.secondary', flex: 'none' }} />}
              <Box component="span" sx={(t) => ({ flex: 'none', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: `0 0 0 3px ${t.tx.glow}` })}>
                {i + 1}
              </Box>
              <Box component="span" sx={{ flexGrow: 1, fontSize: 15.5, lineHeight: 1.5 }}>
                {textOf(id)}
              </Box>
              {!frozen && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 'none' }}>
                  <ButtonBase aria-label="Move up" disabled={i === 0} onClick={() => move(id, -1)} sx={{ borderRadius: '8px', opacity: i === 0 ? 0.3 : 1, '&:hover': { color: 'secondary.main' } }}>
                    <KeyboardArrowUpRoundedIcon />
                  </ButtonBase>
                  <ButtonBase aria-label="Move down" disabled={i === shown.length - 1} onClick={() => move(id, 1)} sx={{ borderRadius: '8px', opacity: i === shown.length - 1 ? 0.3 : 1, '&:hover': { color: 'secondary.main' } }}>
                    <KeyboardArrowDownRoundedIcon />
                  </ButtonBase>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {!c.reveal && (
        <Button variant="contained" size="large" onClick={() => { Narrator.unlock(); c.submit(order.join() === correctOrder.join()); }} sx={{ mt: 2.5 }}>
          Check order
        </Button>
      )}
      {c.reveal && (
        <Feedback right={c.locked || c.right} explanation={s.explanation} onRetake={() => { setOrder(shuffledDifferent(items.map((i) => i.id), correctOrder)); c.reset(); }} onShow={c.showAnswer} />
      )}
    </QuizShell>
  );
}

