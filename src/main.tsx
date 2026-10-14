import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { Learner } from './engine/store';

// Load saved progress (from the LMS or this browser) before the first render.
Learner.boot();
window.addEventListener('pagehide', () => Learner.flush());

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemeModeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeModeProvider>
  </StrictMode>,
);
