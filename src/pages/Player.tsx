import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Collapse, Drawer, IconButton, LinearProgress, Snackbar, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Background from '../components/Background';
import { ConfirmRestart, LanguageMenu, ThemeToggle } from '../components/Chrome';
import Logo from '../components/Logo';
import ScrollUI from '../components/ScrollUI';
import { moduleIcon } from '../components/icons';
import { narrationFor, ScreenView } from '../components/screens';
import { flat, indexById, isSynthetic, modules, pad2 } from '../data/courseData';
import { Narrator, useNarration } from '../engine/audio';
import { actuallyTranslated, fetchTranslatedScreen, getLangPref, langName, setLangPref, translateModule } from '../engine/i18n';
import { Learner, Progress, useLearner, xp } from '../engine/store';
import type { Module, Screen } from '../types';
import { stripMarkup } from '../utils/text';

const SIDEBAR_W = 328;

/** Short label for a screen in the sidebar. */
function navLabel(s: Screen): string {
  if (s.type === 'tool_intro') return s.tool || 'Tool';
  if (s.type === 'prompt_and_output' || s.type === 'practice_task') return stripMarkup(s.promptLabel || s.heading || 'Practice');
  if (s.type === 'key_takeaways') return 'Key takeaways';
  if (s.type === 'mcq' || s.type === 'multi_select' || s.type === 'multi_fill_blank' || s.type === 'reorder') return 'Knowledge check';
  if (s.type === 'module_intro') return 'Overview';
  return stripMarkup(s.heading || 'Lesson');
}

function Sidebar({ currentId, moduleId, onPick }: { currentId: string; moduleId: string; onPick: (id: string) => void }) {
  useLearner();
  const [openId, setOpenId] = useState(moduleId);
  useEffect(() => setOpenId(moduleId), [moduleId]);
  // Keep the current lesson visible inside the sidebar's own scroll area.
  useEffect(() => {
    const id = window.setTimeout(() => document.querySelector('nav[aria-label="Course contents"] [aria-current="page"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 350);
    return () => window.clearTimeout(id);
  }, [currentId]);
  return (
    <Box component="nav" aria-label="Course contents" sx={{ display: 'grid', gap: 1, p: 1.5 }}>
      {modules.map((m) => {
        const pct = Progress.moduleProgress(m);
        const open = openId === m.id;
        return (
          <Box key={m.id} sx={(t) => ({ borderRadius: '20px', border: `1px solid ${m.id === moduleId ? t.tx.hl : t.tx.line}`, background: t.tx.surface, overflow: 'hidden', boxShadow: m.id === moduleId ? `0 10px 30px ${t.tx.glow}` : 'none', transition: 'border-color .25s, box-shadow .3s' })}>
            <Box component="button" type="button" onClick={() => setOpenId(open ? '' : m.id)} aria-expanded={open}
              sx={{ all: 'unset', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'secondary.main', outlineOffset: -2 } }}>
              <Box sx={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: pct === 100 ? '#2EBD85' : 'primary.main', color: 'primary.contrastText', '& svg': { fontSize: 19 } }}>
                {pct === 100 ? <CheckRoundedIcon /> : moduleIcon(m.number)}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
                  {pad2(m.number)} · {m.title}
                </Typography>
                <LinearProgress variant="determinate" value={pct} sx={{ mt: 0.75, height: 4, borderRadius: 4 }} />
              </Box>
              <ExpandMoreRoundedIcon sx={{ flex: 'none', transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </Box>
            <Collapse in={open} unmountOnExit>
              <Box sx={{ display: 'grid', pb: 1, px: 0.75 }}>
                {m.screens.map((s) => {
                  const here = s.id === currentId;
                  const done = Progress.isInteractive(s) ? Learner.isCorrect(s.id) : false;
                  return (
                    <Box key={s.id} component="button" type="button" onClick={() => onPick(s.id)} aria-current={here ? 'page' : undefined}
                      sx={(t) => ({ all: 'unset', boxSizing: 'border-box', display: 'flex', gap: 1, alignItems: 'center', p: '7px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: 13.5, lineHeight: 1.35, background: here ? t.tx.glow : 'transparent', fontWeight: here ? 700 : 500, 'transition': 'background .2s, transform .3s cubic-bezier(.34,1.56,.64,1)', '&:hover': { background: t.tx.glow, transform: 'translateX(4px)' }, '&:focus-visible': { outline: `2px solid ${t.tx.hl}` } })}>
                      <Box component="span" sx={(t) => ({ flex: 'none', width: 8, height: 8, borderRadius: '50%', bgcolor: done ? '#2EBD85' : here ? t.tx.hl : t.tx.line })} />
                      <span>{navLabel(s)}</span>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}

function PathTrack({ moduleId, onPick }: { moduleId: string; onPick: (id: string) => void }) {
  useLearner();
  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', px: 3, pb: 1.25 }}>
      {modules.map((m, i) => {
        const here = m.id === moduleId;
        const pct = Progress.moduleProgress(m);
        return (
          <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', flex: i === modules.length - 1 ? '0 0 auto' : 1 }}>
            <Tooltip title={`${pad2(m.number)} · ${m.title}`}>
              <Box component="button" type="button" aria-label={`Go to module ${m.number}`} onClick={() => onPick(m.screens[0].id)}
                sx={(t) => ({ all: 'unset', cursor: 'pointer', flex: 'none', width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, boxSizing: 'border-box',
                  border: `2px solid ${pct === 100 ? '#2EBD85' : here ? t.tx.hl : t.tx.line}`, bgcolor: pct === 100 ? '#2EBD85' : here ? t.tx.glow : 'transparent', color: pct === 100 ? '#fff' : 'text.primary',
                  transition: 'transform .25s, border-color .25s', animation: here ? 'txpulse 2s infinite' : 'none', '&:hover': { transform: 'scale(1.2)' }, '&:focus-visible': { outline: `2px solid ${t.tx.hl}`, outlineOffset: 2 } })}>
                {pct === 100 ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : m.number}
              </Box>
            </Tooltip>
            {i < modules.length - 1 && (
              <Box sx={(t) => ({ flex: 1, height: 3, mx: 0.5, borderRadius: 3, background: t.tx.line, overflow: 'hidden' })}>
                <Box sx={(t) => ({ height: '100%', width: `${pct}%`, background: t.tx.hl, transition: 'width .6s cubic-bezier(.2,.8,.2,1)' })} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function useTranslated(screen: Screen, module: Module, lang: string) {
  const [state, setState] = useState<{ key: string; screen: Screen; module: Module; status: 'ready' | 'loading' | 'failed' }>({ key: '', screen, module, status: 'ready' });
  useEffect(() => {
    const key = `${screen.id}::${lang}`;
    if (lang === 'en') {
      setState({ key, screen, module, status: 'ready' });
      return;
    }
    let live = true;
    setState({ key, screen, module, status: 'loading' });
    Promise.all([fetchTranslatedScreen(screen, lang), translateModule(module, lang)])
      .then(([s, m]) => live && setState({ key, screen: s, module: m, status: actuallyTranslated(screen, s) ? 'ready' : 'failed' }))
      .catch(() => live && setState({ key, screen, module, status: 'failed' }));
    return () => {
      live = false;
    };
  }, [screen, module, lang]);
  // Until the effect catches up with a navigation, show the English original.
  return state.key === `${screen.id}::${lang}` ? state : { key: '', screen, module, status: (lang === 'en' ? 'ready' : 'loading') as 'ready' | 'loading' };
}

export default function Player() {
  const { screenId = '' } = useParams();
  const nav = useNavigate();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('lg'));
  useLearner();
  const narr = useNarration();
  const [lang, setLang] = useState(getLangPref);
  const [drawer, setDrawer] = useState(false);
  const [side, setSide] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState('');

  const idx = indexById[screenId];
  const entry = flat[idx ?? 0];
  const tr = useTranslated(entry.screen, entry.module, lang);
  const screen = tr.screen;
  const synthetic = isSynthetic(entry.screen);

  const go = (id: string) => nav(`/learn/${id}`);
  const next = flat[(idx ?? 0) + 1];
  const prev = flat[(idx ?? 0) - 1];

  useEffect(() => {
    if (idx === undefined) return;
    Learner.visit(screenId);
    window.scrollTo({ top: 0 });
  }, [screenId, idx]);

  useEffect(() => {
    Narrator.onUnavailable((l) => setToast(`No ${langName(l)} voice is installed on this device, so narration uses the default voice.`));
  }, []);

  const narrationText = useMemo(() => narrationFor(screen, tr.module), [screen, tr.module]);
  useEffect(() => {
    if (idx === undefined || tr.status === 'loading') return;
    if (!narrationText) {
      Narrator.stop();
      return;
    }
    Narrator.play(narrationText, lang);
    return () => Narrator.stop();
  }, [screenId, lang, tr.status, narrationText, idx]);

  if (idx === undefined) return <Navigate to="/" replace />;

  const canNext = Progress.canAdvance(entry.screen);
  const pct = Progress.courseProgress();
  const real = !synthetic ? flat.filter((e) => !isSynthetic(e.screen)) : [];
  const step = real.findIndex((e) => e.screen.id === screenId) + 1;
  const pickLang = (code: string) => {
    setLang(code);
    setLangPref(code);
  };
  const restart = () => {
    setConfirm(false);
    Narrator.stop();
    Learner.reset();
    nav('/', { replace: true });
  };
  const actions = { onNext: () => next && go(next.screen.id), onRestart: () => setConfirm(true), onGoTo: go };

  const sidebar = <Sidebar currentId={screenId} moduleId={entry.module.id} onPick={(id) => { setDrawer(false); go(id); }} />;

  return (
    <Box sx={{ minHeight: '100dvh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Background />
      <ScrollUI bottom={96} />

      <Box component="header" sx={(t) => ({ position: 'sticky', top: 0, zIndex: 1100, borderBottom: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(22px) saturate(160%)' })}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: { xs: 1.5, md: 3 }, py: 1 }}>
          <IconButton aria-label="Contents" onClick={() => (wide ? setSide((v) => !v) : setDrawer(true))}>
            <MenuRoundedIcon />
          </IconButton>
          <Box component="button" type="button" onClick={() => nav('/')} aria-label="Home" sx={{ all: 'unset', cursor: 'pointer', display: 'flex' }}>
            <Logo size={34} withText={wide} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
              {pad2(entry.module.number)} · {tr.module.title}
            </Typography>
            {!synthetic && (
              <Typography noWrap variant="caption" color="text.secondary">
                Step {step} of {real.length}
              </Typography>
            )}
          </Box>
          <Box sx={{ flexGrow: { xs: 1, sm: 0 } }} />
          <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: 999, fontWeight: 800, fontSize: 13, border: `1px solid ${t.tx.hl}`, color: t.tx.hl, background: t.tx.glow, '& svg': { fontSize: 17, animation: 'txbob 2.4s ease-in-out infinite' } })}>
            <LocalFireDepartmentRoundedIcon />
            {xp()} XP
          </Box>
          <Tooltip title={narr.muted ? 'Unmute narration' : 'Mute narration'}>
            <IconButton aria-label="Toggle sound" onClick={() => { Narrator.unlock(); Narrator.setMuted(!narr.muted); if (narr.muted) Narrator.restart(); }}>
              {narr.muted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
            </IconButton>
          </Tooltip>
          <LanguageMenu lang={lang} onPick={pickLang} />
          <ThemeToggle />
          <Tooltip title="Restart course">
            <IconButton aria-label="Restart course" onClick={() => setConfirm(true)} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              <RestartAltRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <PathTrack moduleId={entry.module.id} onPick={go} />
      </Box>

      <Box sx={{ display: 'flex', position: 'relative', zIndex: 1, flexGrow: 1 }}>
        {wide ? (
          <Box component="aside" sx={{ flex: 'none', width: side ? SIDEBAR_W : 0, transition: 'width .35s cubic-bezier(.2,.8,.2,1)', overflow: 'hidden' }}>
            <Box className="tx-scroll" sx={{ position: 'sticky', top: 100, width: SIDEBAR_W, height: 'calc(100dvh - 100px)', overflowY: 'auto', overscrollBehavior: 'contain', pb: 12, scrollbarGutter: 'stable', maskImage: 'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 40px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 40px), transparent 100%)' }}>{sidebar}</Box>
          </Box>
        ) : (
          <Drawer open={drawer} onClose={() => setDrawer(false)} PaperProps={{ sx: { width: SIDEBAR_W, maxWidth: '88vw' } }}>
            <Box sx={{ p: 2, pb: 0 }}>
              <Logo size={34} />
            </Box>
            {sidebar}
          </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, px: { xs: 1.5, sm: 3 }, pt: { xs: 3, sm: 5 }, pb: 16 }}>
          <Box sx={{ maxWidth: 820, mx: 'auto' }}>
            {!synthetic && narrationText && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mb: 1 }}>
                <Tooltip title={narr.speaking ? 'Pause narration' : 'Play narration'}>
                  <span>
                    <IconButton size="small" disabled={narr.muted} aria-label="Play or pause" onClick={() => { Narrator.unlock(); if (narr.speaking) Narrator.pause(); else Narrator.resume(); }}>
                      {narr.speaking ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Restart narration">
                  <span>
                    <IconButton size="small" disabled={narr.muted} aria-label="Restart narration" onClick={() => { Narrator.unlock(); Narrator.restart(); }}>
                      <ReplayRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
            {tr.status === 'loading' && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}
            {tr.status === 'failed' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Could not translate this screen right now, so it is shown in English.
              </Alert>
            )}
            <Box key={screenId} sx={{ animation: 'txscreenin .55s cubic-bezier(.2,.8,.2,1) both', opacity: tr.status === 'loading' ? 0.6 : 1 }}>
              <ScreenView screen={screen} module={tr.module} actions={actions} />
            </Box>
          </Box>
        </Box>
      </Box>

      {!synthetic && (
        <Box component="footer" sx={(t) => ({ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1100, borderTop: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(22px) saturate(160%)', pl: { lg: side ? `${SIDEBAR_W}px` : 0 }, transition: 'padding-left .35s cubic-bezier(.2,.8,.2,1)' })}>
          <Box sx={{ maxWidth: 820, mx: 'auto', display: 'flex', alignItems: 'center', gap: 2, px: { xs: 1.5, sm: 3 }, py: 1.25 }}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} disabled={!prev} onClick={() => prev && go(prev.screen.id)}>
              Back
            </Button>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={(t) => ({ height: 8, borderRadius: 8, background: t.tx.line, overflow: 'hidden' })}>
                <Box sx={(t) => ({ height: '100%', width: `${pct}%`, borderRadius: 8, transition: 'width .6s cubic-bezier(.2,.8,.2,1)', backgroundColor: t.tx.hl, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,.35) 25%, transparent 25% 50%, rgba(255,255,255,.35) 50% 75%, transparent 75%)', backgroundSize: '20px 20px', animation: 'txstripes 1s linear infinite' })} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                {pct}% of the course
              </Typography>
            </Box>
            <Tooltip title={canNext ? '' : 'Answer this check correctly to continue'}>
              <span>
                <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} disabled={!canNext || !next} onClick={() => next && go(next.screen.id)}>
                  Continue
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      )}

      <ConfirmRestart open={confirm} onClose={() => setConfirm(false)} onConfirm={restart} />
      <Snackbar open={!!toast} autoHideDuration={6000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
