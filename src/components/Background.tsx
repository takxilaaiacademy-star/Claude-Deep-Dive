import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Tiny SVG noise tile, used as film grain on top of the gradients.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Aurora blobs + dot grid + film grain + a soft glow that follows the cursor. */
export default function Background() {
  const { tx, palette } = useTheme();
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glow.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    const paint = () => {
      raf = 0;
      el.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const orb = (color: string) => ({
    position: "fixed",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
    willChange: "transform",
    filter: "blur(18px)",
    background: `radial-gradient(circle at center, ${color} 0%, transparent 68%)`,
  });
  const dark = palette.mode === "dark";
  return (
    <>
      <Box aria-hidden sx={{ ...orb(tx.orb1), width: 720, height: 720, left: -240, top: -40, animation: "txdrift 18s ease-in-out infinite" }} />
      <Box aria-hidden sx={{ ...orb(tx.orb2), width: 820, height: 820, right: -260, top: 280, animation: "txdrift 24s ease-in-out -8s infinite reverse" }} />
      <Box aria-hidden sx={{ ...orb(tx.orb3), width: 680, height: 680, left: "28%", bottom: -300, animation: "txdrift 30s ease-in-out -14s infinite" }} />

      {/* conic aurora */}
      <Box
        aria-hidden
        sx={{
          position: "fixed", inset: "-20%", zIndex: 0, pointerEvents: "none", opacity: dark ? 0.22 : 0.3,
          background: `conic-gradient(from 90deg at 50% 50%, ${tx.orb1}, ${tx.orb2}, ${tx.orb3}, ${tx.orb1})`,
          filter: "blur(90px)", animation: "txaurora 26s ease-in-out infinite",
        }}
      />

      {/* dot grid that fades out toward the edges */}
      <Box
        aria-hidden
        sx={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: dark ? 0.35 : 0.5,
          backgroundImage: `radial-gradient(${tx.line} 1px, transparent 1.4px)`, backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%)",
        }}
      />

      {/* cursor glow */}
      <Box
        ref={glow}
        aria-hidden
        sx={{
          position: "fixed", top: 0, left: 0, width: 520, height: 520, zIndex: 0, pointerEvents: "none", borderRadius: "50%",
          background: `radial-gradient(circle, ${tx.glow} 0%, transparent 65%)`, transition: "transform .18s ease-out", display: { xs: "none", md: "block" },
        }}
      />

      {/* film grain */}
      <Box
        aria-hidden
        sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: GRAIN, opacity: dark ? 0.07 : 0.1, mixBlendMode: dark ? "overlay" : "multiply" }}
      />
    </>
  );
}
