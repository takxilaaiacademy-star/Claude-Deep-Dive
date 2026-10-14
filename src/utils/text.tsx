import { Fragment, type ReactNode } from 'react';
import { Box, Link, Typography } from '@mui/material';

/** `**bold**` and `==highlight==` markers removed (used for narration and plain-text copies). */
export const stripMarkup = (t: string) => t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/==(.+?)==/g, '$1');

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|ai|io|dev|app|co|org|net|edu|gov)(?:\/[^\s<>"]*)?)\b/gi;

/** Turns web addresses in plain text into links. */
function linkify(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    let shown = m[0];
    let trail = '';
    const t = shown.match(/[.,;:!?)]+$/);
    if (t) {
      trail = t[0];
      shown = shown.slice(0, -trail.length);
    }
    if (start > last) out.push(text.slice(last, start));
    const href = /^https?:\/\//i.test(shown) ? shown : 'https://' + shown;
    out.push(
      <Link key={`${key}-u${n++}`} href={href} target="_blank" rel="noopener noreferrer" sx={{ color: 'secondary.main', fontWeight: 600, wordBreak: 'break-word' }}>
        {shown}
      </Link>,
    );
    if (trail) out.push(trail);
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Inline formatting: **bold**, ==gold highlight==, and links. Never injects HTML. */
export function inline(text: string, key = 'i'): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|==(.+?)==/g;
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > last) parts.push(<Fragment key={`${key}-t${n}`}>{linkify(text.slice(last, start), `${key}-l${n}`)}</Fragment>);
    if (m[1] !== undefined) {
      parts.push(<strong key={`${key}-b${n}`}>{linkify(m[1], `${key}-bl${n}`)}</strong>);
    } else {
      parts.push(
        <Box component="span" key={`${key}-h${n}`} sx={(t) => ({ color: t.tx.hl, fontWeight: 700, background: t.tx.glow, px: 0.5, borderRadius: '6px' })}>
          {m[2]}
        </Box>,
      );
    }
    last = start + m[0].length;
    n++;
  }
  if (last < text.length) parts.push(<Fragment key={`${key}-end`}>{linkify(text.slice(last), `${key}-le`)}</Fragment>);
  return parts;
}

const LABEL_RE = /(^|\. )([A-Z][A-Za-z &']{1,28}):\s/g;

/**
 * A paragraph that reads "Label: text. Other label: text." is shown as a tidy list (formatting only, wording is unchanged).
 * Anything else is a normal paragraph.
 */
export function Rich({ text, size = 16 }: { text: string; size?: number }) {
  const hits = [...text.matchAll(LABEL_RE)].map((m) => ({ start: m.index ?? 0, sep: m[1].length, label: m[2] }));
  const p = { fontSize: size, lineHeight: 1.75, color: 'text.primary' } as const;
  if (hits.length < 2) return <Typography sx={p}>{inline(text)}</Typography>;
  const lead = text.slice(0, hits[0].start + (hits[0].sep === 2 ? 1 : 0)).trim();
  return (
    <Box>
      {lead && <Typography sx={{ ...p, mb: 1 }}>{inline(lead)}</Typography>}
      <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
        {hits.map((h, i) => {
          const from = h.start + h.sep + h.label.length + 2;
          const to = i + 1 < hits.length ? hits[i + 1].start + (hits[i + 1].sep === 2 ? 1 : 0) : text.length;
          return (
            <Box component="li" key={h.label + i} sx={{ ...p, display: 'flex', gap: 1.25, alignItems: 'baseline' }}>
              <Box component="span" aria-hidden sx={(t) => ({ flex: 'none', width: 7, height: 7, borderRadius: '50%', bgcolor: t.tx.hl, transform: 'translateY(-2px)' })} />
              <span>
                <strong>{h.label}:</strong> {inline(text.slice(from, to).trim(), `r${i}`)}
              </span>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
