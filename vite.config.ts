import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Web builds use base '/', so assets still load on deep links like /learn/m02-s04.
// The SCORM build (`vite build --mode scorm`) uses './', so every asset path is relative and works inside an LMS.
export default defineConfig(({ mode }) => ({
  base: mode === "scorm" ? "./" : "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          mui: [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
        },
      },
    },
  },
}));
