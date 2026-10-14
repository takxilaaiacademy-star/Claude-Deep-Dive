import { useEffect, useState, type ReactNode } from 'react';
import { Box, Button, ButtonBase, Chip, Dialog, IconButton, Typography, type SxProps, type Theme } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { mediaFor } from '../data/courseData';
import { CLAUDE_PATH } from '../utils/claudeMark';
import { stripMarkup } from '../utils/text';
import type { Screen } from '../types';

export const asArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx]);
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const reduced = () => typeof window !== 'undefined' && (document.documentElement.classList.contains('tx-reduce') || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export const TOOL_URL: Record<string, string> = { Claude: 'https://claude.ai' };

/** Frosted card in the Takxila style. */
export function Glass({ children, sx, id }: { children: ReactNode; sx?: SxProps<Theme>; id?: string }) {
  return (
    <Box
      id={id}
      sx={[
        (t) => ({
          position: 'relative', borderRadius: '30px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(22px) saturate(160%)',
          boxShadow: t.palette.mode === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,.14), 0 20px 60px rgba(0,0,0,.25)' : '0 20px 60px rgba(20,32,138,.10)', p: { xs: 2.25, sm: 3.5 },
          transition: 'transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, border-color .3s', '&:hover': { borderColor: t.tx.hl, boxShadow: `0 28px 80px ${t.tx.glow}` },
        }),
        ...asArray(sx),
      ]}
    >
      {children}
    </Box>
  );
}

/** Small outlined label above a heading (same look as the section kickers on the Takxila site). */
export function Kicker({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return <Chip label={children} size="small" variant="outlined" sx={[(t) => ({ fontWeight: 800, letterSpacing: '.1em', borderColor: t.tx.hl, color: 'secondary.main', mb: 1.5 }), ...asArray(sx)]} />;
}

/** Round icon badge with a pulsing ring. */
export function HeroIcon({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ position: 'relative', width: 76, height: 76, mx: 'auto', my: 2.5 }}>
      <Box aria-hidden sx={(t) => ({ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${t.tx.hl}`, animation: 'txring 2.6s ease-out infinite' })} />
      <Box sx={(t) => ({ position: 'absolute', inset: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'primary.contrastText', bgcolor: 'primary.main', boxShadow: `0 12px 36px ${t.tx.glow}`, animation: 'txfloat 5s ease-in-out infinite', '& svg': { fontSize: 34 } })}>
        {children}
      </Box>
    </Box>
  );
}

export function ToolBadge({ name, sx }: { name: string; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="span"
      sx={[
        { display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: 999, bgcolor: '#C96A48', color: '#fff', fontWeight: 800, fontSize: 13, lineHeight: 1.2, verticalAlign: 'middle' },
        ...asArray(sx),
      ]}
    >
      <Box component="svg" viewBox="0 0 640 640" fill="currentColor" aria-hidden sx={{ width: 16, height: 16 }}>
        <path d={CLAUDE_PATH} />
      </Box>
      {name}
    </Box>
  );
}

export function TryButton({ tool }: { tool?: string }) {
  const url = tool ? TOOL_URL[tool] : undefined;
  if (!url) return null;
  return (
    <Button component="a" href={url} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<OpenInNewRoundedIcon />}>
      Let’s try {tool}
    </Button>
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function CopyButton({ text, label = 'Copy Prompt' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(id);
  }, [done]);
  return (
    <Button variant="contained" color="primary" onClick={() => void copyText(text).then((ok) => setDone(ok))} startIcon={done ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}>
      {done ? 'Copied!' : label}
    </Button>
  );
}

/** A prompt the learner can copy into Claude. The text is shown exactly as written, in a monospace face. */
export function PromptCard({ label, text, copyLabel, hideCopy, tool, example }: { label: string; text: string; copyLabel?: string; hideCopy?: boolean; tool?: string; example?: boolean }) {
  return (
    <Box
      sx={(t) => ({
        position: 'relative', overflow: 'hidden', borderRadius: '18px', p: { xs: 2, sm: 2.5 }, my: 2,
        border: `1px ${example ? 'dashed' : 'solid'} ${example ? t.tx.line : t.tx.hl}`,
        background: example ? 'transparent' : t.palette.mode === 'dark' ? 'rgba(10,16,34,.6)' : 'rgba(255,255,255,.8)',
        boxShadow: example ? 'none' : `0 0 0 4px ${t.tx.glow}`,
      })}
    >
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 800, fontSize: 13, color: 'secondary.main', mb: 1 }}>
        {!example && <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
        {label}
      </Typography>
      <Box sx={{ fontFamily: MONO, fontSize: { xs: 13.5, sm: 14.5 }, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'text' }}>{text}</Box>
      {(!hideCopy || tool) && (
        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', mt: 2 }}>
          {!hideCopy && <CopyButton text={text} label={copyLabel} />}
          {tool && !example && <TryButton tool={tool} />}
        </Box>
      )}
    </Box>
  );
}

/** Types `text` out one character at a time, with a blinking cursor. */
export function TypeWriter({ text, speed = 14 }: { text: string; speed?: number }) {
  const [n, setN] = useState(reduced() ? text.length : 0);
  useEffect(() => {
    if (reduced()) return setN(text.length);
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <Box component="span" aria-hidden sx={{ display: 'inline-block', width: 8, height: '1.1em', ml: 0.25, bgcolor: 'secondary.main', verticalAlign: 'text-bottom', animation: 'txcursor .8s steps(1) infinite' }} />}
    </>
  );
}

function Lightbox({ open, onClose, src, video }: { open: boolean; onClose: () => void; src?: string; video?: string }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', border: 0, overflow: 'visible', m: 1 } }}>
      <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', top: -10, right: -10, zIndex: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' } }}>
        <CloseRoundedIcon />
      </IconButton>
      {video ? (
        <Box component="video" src={video} controls autoPlay playsInline sx={{ maxWidth: '92vw', maxHeight: '86vh', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} />
      ) : (
        <Box component="img" src={src} alt="" sx={{ maxWidth: '92vw', maxHeight: '86vh', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} />
      )}
    </Dialog>
  );
}

/**
 * Shown when a screen has no picture yet (or the file could not be loaded).
 * A small "app window" mock-up with a scanning shimmer, so the page never looks empty or broken.
 */
function Placeholder({ screen }: { screen?: Screen }) {
  const title = screen?.heading ? stripMarkup(screen.heading) : screen?.tool || 'Claude';
  return (
    <Box
      sx={(t) => ({
        my: 2.5, position: 'relative', overflow: 'hidden', borderRadius: '22px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(18px)',
        boxShadow: `0 24px 70px ${t.tx.glow}`, transition: 'transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .3s', '&:hover': { transform: 'translateY(-4px) rotate(-.4deg)' },
      })}
    >
      <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 1.25, borderBottom: `1px solid ${t.tx.line}` })}>
        {['#FF6B6B', '#F5B93F', '#2EBD85'].map((c) => (
          <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
        ))}
        <Box sx={(t) => ({ ml: 1.5, flexGrow: 1, height: 20, borderRadius: 99, background: t.tx.line, opacity: 0.6 })} />
      </Box>
      <Box sx={{ position: 'relative', p: { xs: 2.5, sm: 3.5 }, display: 'grid', gap: 1.5, justifyItems: 'center', textAlign: 'center', minHeight: 170 }}>
        <Box aria-hidden sx={(t) => ({ position: 'absolute', left: 0, right: 0, top: 0, height: '35%', background: `linear-gradient(180deg, transparent, ${t.tx.glow}, transparent)`, animation: 'txscan 3.4s linear infinite', pointerEvents: 'none' })} />
        <Box sx={(t) => ({ width: 54, height: 54, borderRadius: '18px', display: 'grid', placeItems: 'center', color: '#fff', background: t.tx.grad, boxShadow: `0 12px 30px ${t.tx.glow}`, animation: 'txbob 4.5s ease-in-out infinite' })}>
          <AutoAwesomeRoundedIcon />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, sm: 18 }, maxWidth: 560 }}>{title}</Typography>
        <Box sx={{ width: '100%', maxWidth: 420, display: 'grid', gap: 0.9 }}>
          {[92, 72, 82].map((w, i) => (
            <Box key={i} sx={(t) => ({ height: 9, width: `${w}%`, mx: 'auto', borderRadius: 99, background: `linear-gradient(90deg, ${t.tx.surface}, ${t.tx.line}, ${t.tx.surface})`, backgroundSize: '400px 100%', animation: `txshimmer 1.6s linear ${i * 0.15}s infinite` })} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/** The screenshot / video area of a screen. Falls back to a placeholder when no file is available. */
export function MediaBlock({ screen }: { screen: Screen }) {
  const media = mediaFor(screen);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<{ src?: string; video?: string } | null>(null);
  if (!media) return <Placeholder screen={screen} />;
  const images = media.images.filter((s) => !failed[s]);
  if (!images.length && !media.video) return <Placeholder screen={screen} />;
  return (
    <Box sx={{ my: 2.5, display: 'grid', gap: 2 }}>
      {media.video && (
        <Box component="video" src={media.video} muted playsInline preload="metadata" onClick={() => setOpen({ video: media.video })} sx={(t) => ({ width: '100%', borderRadius: '16px', border: `1px solid ${t.tx.line}`, cursor: 'zoom-in', display: 'block' })} />
      )}
      {images.map((src) => (
        <Box
          key={src}
          component="button"
          type="button"
          onClick={() => setOpen({ src })}
          aria-label="Enlarge image"
          sx={(t) => ({
            all: 'unset', cursor: 'zoom-in', display: 'block', overflow: 'hidden', borderRadius: '16px', border: `1px solid ${t.tx.line}`, boxShadow: `0 24px 60px ${t.tx.glow}`, minHeight: loaded[src] ? 0 : 160,
            background: loaded[src] ? 'transparent' : `linear-gradient(90deg, ${t.tx.surface}, ${t.tx.line}, ${t.tx.surface})`, backgroundSize: '800px 100%', animation: loaded[src] ? 'none' : 'txshimmer 1.3s linear infinite',
            '&:focus-visible': { outline: `2px solid ${t.tx.hl}`, outlineOffset: 3 }, '&:hover img': { transform: 'scale(1.015)' },
          })}
        >
          <Box
            component="img"
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            onLoad={() => setLoaded((l) => ({ ...l, [src]: true }))}
            onError={() => setFailed((f) => ({ ...f, [src]: true }))}
            sx={{ width: '100%', display: 'block', opacity: loaded[src] ? 1 : 0, transition: 'opacity .4s, transform .6s cubic-bezier(.2,.8,.2,1)' }}
          />
        </Box>
      ))}
      <Lightbox open={!!open} onClose={() => setOpen(null)} src={open?.src} video={open?.video} />
    </Box>
  );
}

/** Quiz answer row: radio or checkbox look, with states for selected / correct / wrong / locked. */
export function OptionRow({ label, kind = 'radio', state, onClick, mono }: { label: string; kind?: 'radio' | 'check'; state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dim'; onClick?: () => void; mono?: boolean }) {
  const on = state === 'selected' || state === 'correct';
  return (
    <ButtonBase
      onClick={onClick}
      disabled={!onClick}
      sx={(t) => {
        const col = state === 'correct' ? '#2EBD85' : state === 'wrong' ? '#FF6B6B' : on ? t.tx.hl : t.tx.line;
        return {
          width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: 1.5, p: '14px 16px', borderRadius: '16px', border: `1.5px solid ${col}`, opacity: state === 'dim' ? 0.45 : 1,
          background: state === 'correct' ? 'rgba(46,189,133,.12)' : state === 'wrong' ? 'rgba(255,107,107,.12)' : on ? t.tx.glow : t.tx.surface,
          transition: 'transform .2s cubic-bezier(.2,.8,.2,1), border-color .2s, background-color .2s, box-shadow .25s, opacity .25s',
          animation: state === 'wrong' ? 'txshake .45s' : 'none',
          '&:hover:not(.Mui-disabled)': { transform: 'translateX(4px)', borderColor: t.tx.hl, boxShadow: `0 10px 30px ${t.tx.glow}` },
          '&:active:not(.Mui-disabled)': { transform: 'scale(.985)' },
          '&.Mui-disabled': { pointerEvents: 'none' },
          '&:focus-visible': { outline: `2px solid ${t.tx.hl}`, outlineOffset: 2 },
        };
      }}
    >
      <Box
        component="span"
        sx={(t) => ({
          flex: 'none', width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: kind === 'radio' ? '50%' : '7px', border: `2px solid ${state === 'correct' ? '#2EBD85' : state === 'wrong' ? '#FF6B6B' : on ? t.tx.hl : t.tx.line}`,
          bgcolor: state === 'correct' ? '#2EBD85' : state === 'wrong' ? '#FF6B6B' : on ? t.tx.hl : 'transparent', color: '#fff', transition: 'all .2s',
          '& svg': { fontSize: 16, animation: 'txcheckpop .35s both' },
        })}
      >
        {state === 'correct' && <CheckRoundedIcon />}
        {state === 'wrong' && <CloseRoundedIcon />}
        {state === 'selected' && <Box sx={{ width: 8, height: 8, borderRadius: kind === 'radio' ? '50%' : '2px', bgcolor: 'primary.contrastText' }} />}
      </Box>
      <Box component="span" sx={{ fontSize: 15.5, lineHeight: 1.55, fontWeight: 500, fontFamily: mono ? MONO : undefined }}>
        {label}
      </Box>
    </ButtonBase>
  );
}

/** Floating "+20 XP" that rises and fades. */
export function XpPop({ amount }: { amount: number }) {
  return (
    <Box aria-hidden sx={(t) => ({ position: 'absolute', right: 20, top: 14, fontWeight: 800, color: t.tx.hl, textShadow: `0 0 16px ${t.tx.glow}`, pointerEvents: 'none', animation: 'txxpfly 1.4s ease-out forwards' })}>
      +{amount} XP
    </Box>
  );
}

