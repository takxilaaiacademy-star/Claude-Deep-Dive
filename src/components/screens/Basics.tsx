import { Box, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { modules, pad2 } from '../../data/courseData';
import type { Module, Paragraph, Screen } from '../../types';
import { inline, Rich } from '../../utils/text';
import { TextGenerate } from '../fx';
import { screenIcon } from '../icons';
import { Glass, HeroIcon, Kicker, MediaBlock, MONO, PromptCard, ToolBadge, TryButton, TypeWriter } from '../ui';

/** Heading + round icon, shared by every screen. */
export function ScreenHead({ kicker, title, screen, module, size = 40, badge }: { kicker: string; title: string; screen: Screen; module: Module; size?: number; badge?: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Kicker>{kicker}</Kicker>
      <Typography variant="h1" sx={{ fontSize: { xs: Math.round(size * 0.68), sm: size }, lineHeight: 1.12 }}>
        {title.length < 90 ? <TextGenerate key={title} text={title} step={45} /> : title}
        {badge && <ToolBadge name={badge} sx={{ ml: 1.5, fontSize: 14 }} />}
      </Typography>
      <HeroIcon>{screenIcon(screen, module)}</HeroIcon>
    </Box>
  );
}

const stagger = (i: number) => ({ animation: `txblurin .6s cubic-bezier(.2,.8,.2,1) ${Math.min(i, 8) * 80 + 150}ms both` });

function Paragraphs({ items }: { items: Paragraph[] }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {items.map((p, i) => {
        if (typeof p === 'string') {
          return (
            <Box key={i} sx={stagger(i)}>
              <Rich text={p} />
            </Box>
          );
        }
        if ('list' in p) {
          return (
            <Box key={i} component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25, ...stagger(i) }}>
              {p.list.map((it, k) => (
                <Box component="li" key={k} sx={(t) => ({ display: 'flex', gap: 1.5, alignItems: 'baseline', p: 1.5, borderRadius: '14px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, fontSize: 16, lineHeight: 1.7 })}>
                  <Box component="span" aria-hidden sx={(t) => ({ flex: 'none', width: 8, height: 8, borderRadius: '50%', bgcolor: t.tx.hl, boxShadow: `0 0 10px ${t.tx.hl}` })} />
                  <span>
                    <strong>{it.label}:</strong> {inline(it.text, `l${i}-${k}`)}
                  </span>
                </Box>
              ))}
            </Box>
          );
        }
        return (
          <Box key={i} sx={stagger(i)}>
            <PromptCard label="Prompt" text={p.prompt} />
          </Box>
        );
      })}
    </Box>
  );
}

export function ModuleIntro({ module: m }: { screen: Screen; module: Module }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Kicker>
        Module {pad2(m.number)} of {modules.length}
      </Kicker>
      <Typography variant="h1" sx={{ fontSize: { xs: 30, sm: 46 } }}>
        <TextGenerate key={m.title} text={m.title} step={60} />
      </Typography>
      <Typography sx={{ mt: 1.5, color: 'text.secondary', fontWeight: 600 }}>Estimated time: {m.estTime}</Typography>
      <Glass sx={{ mt: 4, textAlign: 'left', maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          In this module you will
        </Typography>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
          {m.outcomes.map((o, i) => (
            <Box component="li" key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', fontSize: 16, lineHeight: 1.65, animation: `txblurin .6s cubic-bezier(.2,.8,.2,1) ${300 + i * 140}ms both` }}>
              <Box component="span" sx={{ flex: 'none', mt: 0.35, width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', '& svg': { fontSize: 16 } }}>
                <CheckRoundedIcon />
              </Box>
              <span>{inline(o, `o${i}`)}</span>
            </Box>
          ))}
        </Box>
      </Glass>
    </Box>
  );
}

export function TextScreen({ screen: s, module: m }: { screen: Screen; module: Module }) {
  return (
    <>
      <ScreenHead kicker={`Module ${pad2(m.number)}`} title={s.heading || ''} screen={s} module={m} size={38} />
      <Glass>
        <Paragraphs items={s.body || []} />
        <MediaBlock screen={s} />
      </Glass>
    </>
  );
}

export function ToolIntro({ screen: s, module: m }: { screen: Screen; module: Module }) {
  return (
    <>
      <ScreenHead kicker="Tool walkthrough" title={s.tool || ''} badge={s.tool} screen={s} module={m} />
      <Glass>
        <Typography sx={{ fontSize: 16, lineHeight: 1.75 }}>{inline(s.description || '')}</Typography>
        {s.steps && (
          <Box component="ol" sx={{ m: 0, mt: 2.5, p: 0, listStyle: 'none', display: 'grid', gap: 1.5, counterReset: 'step' }}>
            {s.steps.map((st, i) => (
              <Box
                component="li"
                key={i}
                sx={(t) => ({
                  counterIncrement: 'step', display: 'flex', gap: 1.75, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.7, animation: `txblurin .55s cubic-bezier(.2,.8,.2,1) ${200 + i * 90}ms both`,
                  '&::before': { content: 'counter(step)', flex: 'none', width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, color: 'primary.contrastText', bgcolor: 'primary.main', boxShadow: `0 0 0 4px ${t.tx.glow}` },
                })}
              >
                <span>{inline(st, `s${i}`)}</span>
              </Box>
            ))}
          </Box>
        )}
        {s.prompt && <PromptCard label="Prompt" text={s.prompt} />}
        <MediaBlock screen={s} />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TryButton tool={s.tool} />
        </Box>
      </Glass>
    </>
  );
}

export function PromptOutput({ screen: s, module: m }: { screen: Screen; module: Module }) {
  return (
    <>
      <ScreenHead kicker={`${s.tool} in action`} title={s.promptLabel || ''} screen={s} module={m} size={34} />
      <Glass>
        <PromptCard label="Prompt" text={s.prompt || ''} hideCopy={s.hideCopy} tool={s.tool} />
        {s.examplePrompt && <PromptCard example label="Example, filled in" text={s.examplePrompt} copyLabel="Copy Example" />}
        <Box sx={(t) => ({ my: 2.5, borderRadius: '18px', border: `1px solid ${t.tx.line}`, overflow: 'hidden', background: t.palette.mode === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(20,32,138,.04)' })}>
          <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.1, borderBottom: `1px solid ${t.tx.line}`, fontWeight: 800, fontSize: 13, color: 'secondary.main' })}>
            <Box aria-hidden sx={{ display: 'flex', gap: '3px', alignItems: 'center', height: 14 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ width: 3, height: 14, borderRadius: 2, bgcolor: 'secondary.main', transformOrigin: 'center', animation: `txwave 1s ease-in-out ${i * 0.12}s infinite` }} />
              ))}
            </Box>
            {s.outputLabel}
          </Box>
          <Box sx={{ p: 2, fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: MONO, minHeight: 72 }}>
            <TypeWriter key={s.id + (s.output || '')} text={s.output || ''} />
          </Box>
        </Box>
        <MediaBlock screen={s} />
        {s.explanation && (
          <Box sx={(t) => ({ borderRadius: '16px', p: 2, borderLeft: `4px solid ${t.tx.hl}`, background: t.tx.glow })}>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Why this worked</Typography>
            <Rich text={s.explanation} size={15} />
          </Box>
        )}
      </Glass>
    </>
  );
}

export function PracticeTask({ screen: s, module: m }: { screen: Screen; module: Module }) {
  return (
    <>
      <ScreenHead kicker="Your turn" title={s.heading || ''} screen={s} module={m} size={34} />
      <Glass>
        <PromptCard label="Copy and try this prompt" text={s.prompt || ''} hideCopy={s.hideCopy} tool={s.tool} />
        {s.examplePrompt && <PromptCard example label="Example, filled in" text={s.examplePrompt} copyLabel="Copy Example" />}
        <MediaBlock screen={s} />
        {s.note && (
          <Box sx={(t) => ({ borderRadius: '16px', p: 2, border: `1px dashed ${t.tx.hl}`, fontSize: 15, lineHeight: 1.7 })}>{inline(s.note)}</Box>
        )}
      </Glass>
    </>
  );
}

export function KeyTakeaways({ screen: s, module: m }: { screen: Screen; module: Module }) {
  const items = (s.items || []) as string[];
  return (
    <>
      <ScreenHead kicker="Key takeaways" title="What to remember" screen={s} module={m} />
      <Glass>
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.5 }}>
          {items.map((it, i) => (
            <Box
              component="li"
              key={i}
              sx={(t) => ({ display: 'flex', gap: 1.5, alignItems: 'flex-start', p: 2, borderRadius: '16px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, fontSize: 16, lineHeight: 1.7, animation: `txblurin .6s cubic-bezier(.2,.8,.2,1) ${200 + i * 120}ms both`, transition: 'transform .25s, border-color .25s', '&:hover': { transform: 'translateX(5px)', borderColor: t.tx.hl } })}
            >
              <Box component="span" sx={{ flex: 'none', mt: 0.25, width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', '& svg': { fontSize: 17 } }}>
                <CheckRoundedIcon />
              </Box>
              <span>{inline(it, `k${i}`)}</span>
            </Box>
          ))}
        </Box>
      </Glass>
    </>
  );
}

