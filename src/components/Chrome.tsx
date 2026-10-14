import { useState } from 'react';
import type React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { useThemeMode } from '../context/ThemeModeContext';
import { LANGUAGES } from '../engine/i18n';

/** Pill switch with a sliding sun/moon knob. The choice is saved in localStorage (key: tx_theme). */
export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const dark = mode === 'dark';
  return (
    <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Box
        component="button"
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Toggle dark mode"
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          toggleMode({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
        }}
        sx={(t) => ({
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer', position: 'relative', flex: 'none', width: 62, height: 34, borderRadius: 999,
          border: `1.5px solid ${t.tx.line}`, background: dark ? 'linear-gradient(135deg,#1B2350,#2A1F5C)' : 'linear-gradient(135deg,#BFE9FF,#FFE6A8)',
          boxShadow: `inset 0 2px 6px rgba(0,0,0,.18), 0 6px 20px ${t.tx.glow}`, transition: 'background .5s, transform .3s cubic-bezier(.34,1.56,.64,1)',
          '&:hover': { transform: 'scale(1.06)' }, '&:active': { transform: 'scale(.94)' }, '&:focus-visible': { outline: `2px solid ${t.tx.hl}`, outlineOffset: 3 },
        })}
      >
        <Box aria-hidden sx={{ position: 'absolute', top: 5, left: dark ? 7 : 'auto', right: dark ? 'auto' : 9, fontSize: 11, opacity: dark ? 0.9 : 0, transition: 'opacity .4s' }}>✦ ·</Box>
        <Box
          sx={{
            position: 'absolute', top: 3, left: 3, width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff',
            background: dark ? 'linear-gradient(135deg,#7C8CFF,#B26BFF)' : 'linear-gradient(135deg,#FFB020,#FF7A59)', boxShadow: '0 4px 12px rgba(0,0,0,.3)',
            transform: dark ? 'translateX(0) rotate(0deg)' : 'translateX(28px) rotate(360deg)', transition: 'transform .55s cubic-bezier(.34,1.56,.64,1), background .4s',
            '& svg': { fontSize: 16 },
          }}
        >
          {dark ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </Box>
      </Box>
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
