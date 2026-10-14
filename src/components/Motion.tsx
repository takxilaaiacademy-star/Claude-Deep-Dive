import { useEffect, useState, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

/** Fades its children in once when the page opens. Content is never hidden by scrolling. */
export function Reveal({ children, delay = 0, sx }: { children: ReactNode; delay?: number; sx?: SxProps<Theme> }) {
  // Content is always visible; it only fades in once when the page opens (no hiding while scrolling).
  return <Box sx={[{ animation: `txfade .5s ease ${delay}ms both` }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Box>;
}

/** Counts up to `value` once on mount (numbers in stat tiles). */
export function CountUp({ value, prefix = '', suffix = '', ms = 900 }: { value: number; prefix?: string; suffix?: string; ms?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (document.documentElement.classList.contains('tx-reduce') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setN(value);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return (
    <>
      {prefix}
      {n}
      {suffix}
    </>
  );
}
