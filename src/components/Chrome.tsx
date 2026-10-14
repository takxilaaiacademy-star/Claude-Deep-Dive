import { useState } from 'react';
import type React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, SvgIcon, Tooltip } from '@mui/material';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { useThemeMode } from '../context/ThemeModeContext';
import { LANGUAGES } from '../engine/i18n';

/** Outline crescent moon (shown in light mode: tap to go dark). */
function MoonIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </SvgIcon>
  );
}

/** Outline sun with eight rays (shown in dark mode: tap to go light). */
function SunIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </SvgIcon>
  );
}

/** Plain icon button: moon in light mode, sun in dark mode. The choice is saved in localStorage (key: tx_theme). */
export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const dark = mode === 'dark';
  return (
    <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        role="switch"
        aria-checked={dark}
        aria-label="Toggle dark mode"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          toggleMode({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        }}
        sx={{ flex: 'none', color: dark ? '#FFFFFF' : '#5A5F73', '& svg': { fontSize: 24, transition: 'transform .5s cubic-bezier(.34,1.56,.64,1)' }, '&:hover svg': { transform: 'rotate(20deg)' } }}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
}

export function LanguageMenu({ lang, onPick }: { lang: string; onPick: (code: string) => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Tooltip title="Language">
        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Choose language">
          <TranslateRoundedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { maxHeight: 360, minWidth: 210 } } }}>
        {LANGUAGES.map((l) => (
          <MenuItem key={l.code} selected={l.code === lang} onClick={() => { setAnchor(null); onPick(l.code); }}>
            {l.native}
            <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{l.name}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function ConfirmRestart({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Start over?</DialogTitle>
      <DialogContent>
        <DialogContentText>This clears your progress and quiz results for the whole course.</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Restart course
        </Button>
      </DialogActions>
    </Dialog>
  );
}
