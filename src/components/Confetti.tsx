import { Box } from '@mui/material';
import { useMemo } from 'react';

const COLORS = ['#F5B93F', '#4868FF', '#2EBD85', '#A05AFF', '#FF6B6B', '#3CC8E6'];

// A short burst of paper confetti for enrolments and completed courses.
export default function Confetti({ pieces = 90 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.6 + Math.random() * 1.4,
        rot: Math.random() * 720 - 360,
        drift: Math.random() * 160 - 80,
        size: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [pieces],
  );
  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2000, overflow: 'hidden' }}>
      {bits.map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute', top: -20, left: b.left + '%', width: b.size, height: b.round ? b.size : b.size * 0.45,
            borderRadius: b.round ? '50%' : '2px', bgcolor: b.color, opacity: 0,
            '--dx': b.drift + 'px', '--rot': b.rot + 'deg',
            animation: `txconfetti ${b.dur}s cubic-bezier(.25,.6,.4,1) ${b.delay}s forwards`,
          }}
        />
      ))}
    </Box>
  );
}
