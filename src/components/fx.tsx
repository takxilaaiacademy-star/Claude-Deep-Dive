// Motion effects in the style of Aceternity UI (spotlight, text generate, flip words,
// moving border, 3D tilt cards, infinite cards, scroll timeline, lamp, meteors, sparkles),
// rebuilt with MUI + CSS so the app needs no Tailwind or animation library.
import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Box, ButtonBase, Typography, type SxProps, type Theme } from '@mui/material';

const reduced = () =>
  typeof window !== 'undefined' &&
  (document.documentElement.classList.contains('tx-reduce') || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const asArray = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx]);

/** True once the element has scrolled into view (and stays true). */
export function useInView<T extends HTMLElement>(margin = '0px 0px -10% 0px') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin, seen]);
  return [ref, seen] as const;
}

/** Scroll progress (0 to 1) of an element through the viewport, throttled to animation frames. */
export function useScrollProgress<T extends HTMLElement>(start = 0.85, end = 0.25) {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start;
      const to = vh * end - r.height;
      setP(Math.min(1, Math.max(0, (from - r.top) / (from - to))));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, [start, end]);
  return [ref, p] as const;
}

/** A soft beam of light that sweeps in from the top left. */
export function Spotlight({ color = 'white', sx }: { color?: string; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 3787 2842"
      fill="none"
      sx={[
        { position: 'absolute', pointerEvents: 'none', zIndex: 0, width: { xs: '160%', md: '90%' }, height: 'auto', top: { xs: -60, md: -80 }, left: { xs: '-10%', md: '10%' }, animation: 'txspotlight 2s .6s ease both' },
        ...asArray(sx),
      ]}
    >
      <g filter="url(#txsl)">
        <ellipse cx="1924.71" cy="273.501" rx="1924.71" ry="273.501" transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" fill={color} fillOpacity="0.21" />
      </g>
      <defs>
        <filter id="txsl" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </Box>
  );
}

/** Fine grid lines that fade out towards the edges. */
export function GridBackdrop({ size = 56, sx }: { size?: number; sx?: SxProps<Theme> }) {
  return (
    <Box
      aria-hidden
      sx={[
        (t) => ({
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `linear-gradient(${t.tx.line} 1px, transparent 1px), linear-gradient(90deg, ${t.tx.line} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%)',
          opacity: 0.55,
        }),
        ...asArray(sx),
      ]}
    />
  );
}

/** Shooting stars. Positions are fixed so the layout never shifts. */
export const Meteors = memo(function Meteors({ n = 14 }: { n?: number }) {
  const list = useMemo(() => Array.from({ length: n }, (_, i) => ({ left: (i * 73) % 100, delay: ((i * 37) % 50) / 10, dur: 4 + ((i * 13) % 6) })), [n]);
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {list.map((m, i) => (
        <Box
          key={i}
          sx={(t) => ({
            position: 'absolute', top: -10, left: m.left + '%', width: 2, height: 2, borderRadius: '50%', bgcolor: t.tx.hl,
            boxShadow: `0 0 0 1px rgba(255,255,255,.08)`, animation: `txmeteor ${m.dur}s linear ${m.delay}s infinite`,
            '&::before': { content: '""', position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 70, height: 1, background: `linear-gradient(90deg, ${t.tx.hl}, transparent)` },
          })}
        />
      ))}
    </Box>
  );
});

/** Twinkling dots, drawn with CSS only. */
export const Sparkles = memo(function Sparkles({ n = 36, color }: { n?: number; color?: string }) {
  const dots = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ x: (i * 61) % 100, y: (i * 47) % 100, s: 1 + ((i * 7) % 3), d: ((i * 29) % 40) / 10, t: 2 + ((i * 11) % 4) })),
    [n],
  );
  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {dots.map((p, i) => (
        <Box
          key={i}
          sx={(t) => ({ position: 'absolute', left: p.x + '%', top: p.y + '%', width: p.s * 2, height: p.s * 2, borderRadius: '50%', bgcolor: color || t.tx.hl, animation: `txtwinkle ${p.t}s ease-in-out ${p.d}s infinite` })}
        />
      ))}
    </Box>
  );
});

/** Words fade in from a blur, one after another (Aceternity "text generate effect"). */
export function TextGenerate({ text, hl = [], delay = 0, step = 70, sx }: { text: string; hl?: string[]; delay?: number; step?: number; sx?: SxProps<Theme> }) {
  return (
    <Box component="span" sx={[{ display: 'inline' }, ...asArray(sx)]}>
      {text.split(' ').map((w, i) => (
        <Box
          component="span"
          key={i}
          sx={{ display: 'inline-block', whiteSpace: 'pre', animation: `txblurin .6s cubic-bezier(.2,.8,.2,1) ${delay + i * step}ms both`, color: hl.includes(w.replace(/[.,!?]/g, '')) ? 'secondary.main' : undefined }}
        >
          {w + ' '}
        </Box>
      ))}
    </Box>
  );
}

/** Cycles through words with a flip (Aceternity "flip words"). */
export function FlipWords({ words, ms = 2600, sx }: { words: string[]; ms?: number; sx?: SxProps<Theme> }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced()) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), ms);
    return () => clearInterval(id);
  }, [words.length, ms]);
  return (
    <Box component="span" sx={[{ display: 'inline-block', perspective: 600, position: 'relative' }, ...asArray(sx)]}>
      <Box component="span" key={i} sx={{ display: 'inline-block', transformOrigin: '50% 100%', animation: 'txflip .6s cubic-bezier(.2,.8,.2,1) both' }}>
        {words[i]}
      </Box>
    </Box>
  );
}

/** A button whose border has a light running around it (Aceternity "moving border"). */
export function MovingBorderButton({ children, onClick, filled = false, sx }: { children: ReactNode; onClick?: () => void; filled?: boolean; sx?: SxProps<Theme> }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={[
        (t) => ({
          position: 'relative', borderRadius: 999, p: '2px', overflow: 'hidden', isolation: 'isolate',
          transition: 'transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 18px 44px ${t.tx.glow}` },
          '&:active': { transform: 'scale(.96)' },
          '&::before': {
            content: '""', position: 'absolute', inset: '-150%', zIndex: -1,
            background: `conic-gradient(from 0deg, transparent 0 70%, ${t.tx.hl} 80%, #fff 85%, ${t.tx.hl} 90%, transparent 100%)`,
            animation: 'txspin 3.2s linear infinite',
          },
          '&::after': { content: '""', position: 'absolute', inset: 0, zIndex: -2, borderRadius: 999, border: `1px solid ${t.tx.line}` },
        }),
        ...asArray(sx),
      ]}
    >
      <Box
        component="span"
        sx={(t) => ({
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 1, px: { xs: 3, sm: 3.5 }, py: 1.6, borderRadius: 999, fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap',
          bgcolor: filled ? 'primary.main' : t.palette.mode === 'dark' ? 'rgba(10,16,34,.92)' : 'rgba(255,255,255,.95)',
          color: filled ? 'primary.contrastText' : 'text.primary', backdropFilter: 'blur(12px)',
        })}
      >
        {children}
      </Box>
    </ButtonBase>
  );
}

/** Card that tilts in 3D towards the pointer, with a glow that follows it. */
export function TiltCard({ children, max = 9, sx, onClick }: { children: ReactNode; max?: number; sx?: SxProps<Theme>; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', ((0.5 - y) * max).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((x - 0.5) * max).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <Box sx={{ perspective: 1000, height: '100%' }}>
      <Box
        ref={ref}
        onMouseMove={move}
        onMouseLeave={leave}
        onClick={onClick}
        sx={[
          (t) => ({
            position: 'relative', height: '100%', borderRadius: '22px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(18px)',
            transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))', transformStyle: 'preserve-3d', transition: 'transform .35s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s',
            cursor: onClick ? 'pointer' : undefined, overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0, transition: 'opacity .3s',
              background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${t.tx.glow}, transparent 45%)`,
            },
            '&:hover': { borderColor: t.tx.hl, boxShadow: `0 30px 60px ${t.tx.glow}` },
            '&:hover::before': { opacity: 1 },
          }),
          ...asArray(sx),
        ]}
      >
        {children}
      </Box>
    </Box>
  );
}

/** A row that scrolls forever and pauses on hover (Aceternity "infinite moving cards"). */
export function InfiniteRow({ children, seconds = 40, reverse = false, gap = 16 }: { children: ReactNode[]; seconds?: number; reverse?: boolean; gap?: number }) {
  return (
    <Box
      sx={{
        overflow: 'hidden', py: 1,
        maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        '&:hover > div': { animationPlayState: 'paused' },
      }}
    >
      <Box sx={{ display: 'flex', gap: gap / 8, width: 'max-content', animation: `txmarq ${seconds}s linear infinite ${reverse ? 'reverse' : 'normal'}`, pr: gap / 8 }}>
        {children}
        {children.map((c, i) => (
          <Box key={'dup' + i} aria-hidden sx={{ display: 'contents' }}>
            {c}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** Vertical timeline whose line fills in as you scroll (Aceternity "timeline"). */
export function ScrollTimeline({ items }: { items: { title: string; body: ReactNode; icon?: ReactNode }[] }) {
  const [ref, p] = useScrollProgress<HTMLDivElement>(0.75, 0.55);
  return (
    <Box ref={ref} sx={{ position: 'relative', pl: { xs: 5, md: 0 } }}>
      <Box sx={(t) => ({ position: 'absolute', top: 0, bottom: 0, left: { xs: 18, md: '50%' }, width: 2, bgcolor: t.tx.line, borderRadius: 2 })} />
      <Box
        sx={(t) => ({
          position: 'absolute', top: 0, left: { xs: 18, md: '50%' }, width: 2, borderRadius: 2, height: `${p * 100}%`,
          background: `linear-gradient(180deg, transparent, ${t.tx.hl} 10%, ${t.tx.orb2.replace(/[\d.]+\)$/, '1)')})`, boxShadow: `0 0 18px ${t.tx.hl}`,
        })}
      />
      {items.map((it, i) => {
        const on = p * items.length > i + 0.15;
        const left = i % 2 === 0;
        return (
          <Box key={it.title} sx={{ position: 'relative', display: 'flex', justifyContent: { md: left ? 'flex-start' : 'flex-end' }, mb: { xs: 4, md: 6 } }}>
            <Box
              sx={(t) => ({
                position: 'absolute', left: { xs: -40, md: 'calc(50% - 17px)' }, top: 6, width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
                bgcolor: on ? 'primary.main' : t.palette.background.paper, color: on ? 'primary.contrastText' : 'text.secondary',
                border: `2px solid ${on ? t.tx.hl : t.tx.line}`, transition: 'all .4s', boxShadow: on ? `0 0 0 6px ${t.tx.glow}` : 'none', zIndex: 1, fontWeight: 800,
              })}
            >
              {it.icon ?? i + 1}
            </Box>
            <Box
              sx={{
                width: { xs: '100%', md: 'calc(50% - 48px)' }, opacity: on ? 1 : 0.35, transform: on ? 'none' : `translateX(${left ? -16 : 16}px)`,
                transition: 'opacity .5s, transform .6s cubic-bezier(.2,.8,.2,1)',
              }}
            >
              <Typography variant="h5" sx={{ mb: 0.75 }}>
                {it.title}
              </Typography>
              <Box sx={{ color: 'text.secondary' }}>{it.body}</Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** Glowing lamp light above a heading (Aceternity "lamp effect"). */
export function Lamp({ children }: { children: ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Box ref={ref} sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 14, md: 18 }, pb: { xs: 6, md: 8 }, textAlign: 'center', isolation: 'isolate' }}>
      <Box
        aria-hidden
        sx={(t) => ({
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: seen ? '70%' : '30%', maxWidth: 820, height: 220, zIndex: -1,
          background: `conic-gradient(from 90deg at 50% 0%, transparent 25%, ${t.tx.hl} 50%, transparent 75%)`, opacity: seen ? 0.55 : 0.2,
          filter: 'blur(28px)', transition: 'width 1.2s cubic-bezier(.2,.8,.2,1), opacity 1.2s',
        })}
      />
      <Box
        aria-hidden
        sx={(t) => ({ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', height: 3, borderRadius: 3, width: seen ? '46%' : '16%', maxWidth: 520, bgcolor: t.tx.hl, boxShadow: `0 0 30px 6px ${t.tx.hl}`, transition: 'width 1.2s cubic-bezier(.2,.8,.2,1)' })}
      />
      {children}
    </Box>
  );
}

/** Text with a slowly moving gradient fill. */
export function GradientText({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      component="span"
      sx={[
        (t) => ({
          background: `linear-gradient(90deg, ${t.tx.hl}, ${t.palette.mode === 'dark' ? '#8EA2FF' : '#7B5CFF'}, ${t.tx.hl})`, backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'txgradient 6s ease infinite',
        }),
        ...asArray(sx),
      ]}
    >
      {children}
    </Box>
  );
}

/** Tilts a block back in 3D and straightens it as it scrolls into view (Aceternity "container scroll"). */
export function ScrollTilt({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const [ref, p] = useScrollProgress<HTMLDivElement>(1, 0.6);
  const e = 1 - Math.pow(1 - p, 2);
  return (
    <Box ref={ref} sx={{ perspective: 1200 }} style={style}>
      <Box style={{ transform: `rotateX(${(1 - e) * 24}deg) scale(${0.9 + e * 0.1})`, transformOrigin: '50% 0%', willChange: 'transform' }}>{children}</Box>
    </Box>
  );
}

