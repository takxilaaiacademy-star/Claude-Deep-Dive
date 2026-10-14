import { useEffect, useState } from 'react';
import { Box, Fab, Zoom } from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

/** Thin gold bar at the very top that fills as you scroll, plus a back-to-top button. */
export default function ScrollUI({ bottom = 24 }: { bottom?: number | Record<string, number> }) {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setShow(window.scrollY > 600);
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
  }, []);
  return (
    <>
      <Box aria-hidden sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1500, pointerEvents: 'none' }}>
        <Box sx={(t) => ({ height: '100%', width: `${p * 100}%`, background: `linear-gradient(90deg, ${t.tx.hl}, #8EA2FF)`, boxShadow: `0 0 14px ${t.tx.hl}`, borderRadius: '0 3px 3px 0', transition: 'width .12s linear' })} />
      </Box>
      <Zoom in={show}>
        <Fab size="medium" color="primary" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ position: 'fixed', right: 20, bottom, zIndex: 1200 }}>
          <KeyboardArrowUpRoundedIcon />
        </Fab>
      </Zoom>
    </>
  );
}
