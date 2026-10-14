import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { CssBaseline, GlobalStyles, ThemeProvider, type PaletteMode } from '@mui/material';
import { createAppTheme } from '../theme/theme';

interface ThemeModeValue {
  mode: PaletteMode;
  toggleMode: (origin?: { x: number; y: number }) => void;
}

// Shared keyframes. The first block is Takxila's own set; the second block is new for this course.
// `.tx-reduce` (or the OS "reduce motion" setting) switches all of it off.
const motion = {
  '@keyframes txdrift': {
    '0%,100%': { transform: 'translate(0,0) scale(1)' },
    '33%': { transform: 'translate(80px,-50px) scale(1.15)' },
    '66%': { transform: 'translate(-60px,60px) scale(.9)' },
  },
  '@keyframes txrise': { from: { opacity: 0, transform: 'translateY(28px)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes txfade': { from: { opacity: 0 }, to: { opacity: 1 } },
  '@keyframes txpop': { from: { opacity: 0, transform: 'scale(.92)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes txmarq': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
  '@keyframes txfloat': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
  '@keyframes txshimmer': { from: { backgroundPosition: '-400px 0' }, to: { backgroundPosition: '400px 0' } },
  '@keyframes txpulse': { '0%': { boxShadow: '0 0 0 0 rgba(245,185,63,.55)' }, '100%': { boxShadow: '0 0 0 16px rgba(245,185,63,0)' } },
  '@keyframes txshine': { '0%,60%': { left: '-60%' }, '100%': { left: '130%' } },
  '@keyframes txconfetti': {
    '0%': { opacity: 1, transform: 'translate(0,0) rotate(0)' },
    '100%': { opacity: 0, transform: 'translate(var(--dx), 105vh) rotate(var(--rot))' },
  },
  '@keyframes txspin': { to: { transform: 'rotate(360deg)' } },
  '@keyframes txspotlight': { '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(.5)' }, '100%': { opacity: 1, transform: 'translate(-50%, -40%) scale(1)' } },
  '@keyframes txmeteor': { '0%': { transform: 'rotate(215deg) translateX(0)', opacity: 1 }, '70%': { opacity: 1 }, '100%': { transform: 'rotate(215deg) translateX(-900px)', opacity: 0 } },
  '@keyframes txgradient': { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
  '@keyframes txblurin': { from: { opacity: 0, filter: 'blur(10px)', transform: 'translateY(8px)' }, to: { opacity: 1, filter: 'blur(0)', transform: 'none' } },
  '@keyframes txflip': { from: { opacity: 0, transform: 'translateY(60%) rotateX(-70deg)', filter: 'blur(6px)' }, to: { opacity: 1, transform: 'none', filter: 'blur(0)' } },
  '@keyframes txbeam': { '0%': { strokeDashoffset: 1000 }, '100%': { strokeDashoffset: 0 } },
  '@keyframes txtwinkle': { '0%,100%': { opacity: 0.15, transform: 'scale(.6)' }, '50%': { opacity: 1, transform: 'scale(1)' } },
  '@keyframes txlamp': { from: { opacity: 0.4, width: '30%' }, to: { opacity: 1, width: '70%' } },
  '@keyframes txring': { from: { opacity: 0.7, transform: 'scale(.9)' }, to: { opacity: 0, transform: 'scale(1.35)' } },

  // New for the course player.
  '@keyframes txscreenin': { from: { opacity: 0, transform: 'translateY(18px) scale(.985)', filter: 'blur(6px)' }, to: { opacity: 1, transform: 'none', filter: 'blur(0)' } },
  '@keyframes txshake': { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-8px)' }, '40%': { transform: 'translateX(7px)' }, '60%': { transform: 'translateX(-5px)' }, '80%': { transform: 'translateX(3px)' } },
  '@keyframes txcheckpop': { '0%': { transform: 'scale(0) rotate(-30deg)' }, '60%': { transform: 'scale(1.25) rotate(6deg)' }, '100%': { transform: 'scale(1) rotate(0)' } },
  '@keyframes txtrophy': { '0%': { transform: 'translateY(30px) scale(.4) rotate(-14deg)', opacity: 0 }, '60%': { transform: 'translateY(-8px) scale(1.12) rotate(5deg)', opacity: 1 }, '100%': { transform: 'none', opacity: 1 } },
  '@keyframes txxpfly': { '0%': { opacity: 0, transform: 'translateY(8px) scale(.8)' }, '20%': { opacity: 1, transform: 'translateY(-4px) scale(1.1)' }, '100%': { opacity: 0, transform: 'translateY(-46px) scale(1)' } },
  '@keyframes txstripes': { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '40px 0' } },
  '@keyframes txcursor': { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
  '@keyframes txwave': { '0%,100%': { transform: 'scaleY(.35)' }, '50%': { transform: 'scaleY(1)' } },
  '@keyframes txsweepbar': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(100%)' } },

  // While the theme switches, skip every colour transition so the new theme paints in one go.
  '.tx-theming *, .tx-theming *::before, .tx-theming *::after': { transition: 'none !important' },

  // Gen-Z polish: circular theme reveal, grain, springy focus, custom caret/selection.
  '::view-transition-old(root), ::view-transition-new(root)': { animation: 'none', mixBlendMode: 'normal' },
  '::view-transition-new(root)': { animation: 'txreveal .65s cubic-bezier(.2,.8,.2,1) both' },
  '@keyframes txreveal': { from: { clipPath: 'circle(0 at var(--tx-x, 50%) var(--tx-y, 50%))' }, to: { clipPath: 'circle(150vmax at var(--tx-x, 50%) var(--tx-y, 50%))' } },
  '@keyframes txaurora': { '0%,100%': { transform: 'translate3d(0,0,0) rotate(0deg) scale(1)' }, '50%': { transform: 'translate3d(4%,-3%,0) rotate(8deg) scale(1.12)' } },
  '@keyframes txbob': { '0%,100%': { transform: 'translateY(0) rotate(-2deg)' }, '50%': { transform: 'translateY(-8px) rotate(2deg)' } },
  '@keyframes txscan': { '0%': { transform: 'translateY(-120%)' }, '100%': { transform: 'translateY(420%)' } },
  'html': { scrollBehavior: 'smooth' },
  'button, a, [role="button"]': { WebkitTapHighlightColor: 'transparent' },
  '.tx-reduce *, .tx-reduce *::before, .tx-reduce *::after': { animation: 'none !important', transition: 'none !important' },
};

const themes = { dark: createAppTheme('dark'), light: createAppTheme('light') };
const KEY = 'tx_theme';

// Saved choice wins; first visit follows the device (dark/light) setting.
function readMode(): PaletteMode {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) === 'light' ? 'light' : 'dark';
  } catch {
    /* ignore */
  }
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

const Ctx = createContext<ThemeModeValue>({ mode: 'dark', toggleMode: () => undefined });

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(readMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(KEY, JSON.stringify(mode));
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Keep every open tab in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        setMode(JSON.parse(e.newValue) === 'light' ? 'light' : 'dark');
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleMode = useCallback((origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const flip = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));
    const vt = (document as Document & { startViewTransition?: (cb: () => void) => unknown }).startViewTransition;
    const calm = root.classList.contains('tx-reduce') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof vt === 'function' && !calm) {
      root.style.setProperty('--tx-x', `${origin ? origin.x : window.innerWidth / 2}px`);
      root.style.setProperty('--tx-y', `${origin ? origin.y : 0}px`);
      vt.call(document, () => flushSync(flip));
      return;
    }
    root.classList.add('tx-theming');
    flip();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('tx-theming')));
  }, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);
  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={themes[mode]}>
        <CssBaseline />
        <GlobalStyles styles={motion} />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}

export const useThemeMode = () => useContext(Ctx);
