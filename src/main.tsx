import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { Learner } from './engine/store';

Learner.boot();
const Router = import.meta.env.MODE === 'scorm' ? HashRouter : BrowserRouter;
window.addEventListener('pagehide', () => Learner.flush());

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ThemeModeProvider>
      <Router>
        <App />
      </Router>
    </ThemeModeProvider>
  </StrictMode>,
);
