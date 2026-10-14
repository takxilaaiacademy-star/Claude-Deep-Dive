import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Container, Typography } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import Background from '../components/Background';
import { ConfirmRestart, ThemeToggle } from '../components/Chrome';
import { FlipWords, GradientText, GridBackdrop, InfiniteRow, Lamp, Meteors, MovingBorderButton, ScrollTilt, ScrollTimeline, Sparkles, Spotlight, TextGenerate, TiltCard } from '../components/fx';
import { moduleIcon } from '../components/icons';
import Logo from '../components/Logo';
import { CountUp, Reveal } from '../components/Motion';
import ScrollUI from '../components/ScrollUI';
import { Kicker, ToolBadge } from '../components/ui';
import { assetUrl, course, flat, modules, pad2, totalActivities } from '../data/courseData';
import { Narrator } from '../engine/audio';
import { Learner, Progress, useLearner } from '../engine/store';
import { inline } from '../utils/text';

const SURFACES = ['Chat', 'Projects', 'Skills', 'Artifacts', 'Claude Code', 'Cowork', 'Claude Design'];

export default function Landing() {
  const nav = useNavigate();
  useLearner();
  const [confirm, setConfirm] = useState(false);
  const resume = Learner.hasProgress();
  const pct = Progress.courseProgress();
  const start = () => {
    Narrator.unlock();
    nav(`/learn/${resume ? (Learner.current() as string) : flat[0].screen.id}`);
  };
  const toModules = () => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });

  const stats: Array<[number | string, string]> = [
    [modules.length, 'Modules'],
    [totalActivities, 'Knowledge checks'],
    [course.duration, 'Of hands-on learning'],
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'clip' }}>
      <Background />
      <ScrollUI />

      <Box component="header" sx={(t) => ({ position: 'sticky', top: 0, zIndex: 1100, borderBottom: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(22px) saturate(160%)' })}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Logo size={38} />
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggle />
          <Button variant="contained" onClick={start} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            {resume ? 'Resume' : 'Start course'}
          </Button>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- hero */}
      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 }, overflow: 'hidden' }}>
        <GridBackdrop />
        <Spotlight color="#F5B93F" />
        <Meteors />
        <Sparkles />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Reveal>
            <Kicker>By Takxila AI Academy</Kicker>
          </Reveal>
          <Typography variant="h1" sx={{ fontSize: { xs: 44, sm: 68, md: 84 }, lineHeight: 1.05, letterSpacing: '-.03em' }}>
            <GradientText>{course.title}</GradientText>
          </Typography>
          <Typography variant="h4" sx={{ mt: 2.5, fontSize: { xs: 22, sm: 30 }, fontWeight: 700, minHeight: { xs: 70, sm: 44 } }}>
            <TextGenerate text="Make Claude work for you in" step={60} /> <FlipWords words={SURFACES} sx={{ color: 'secondary.main' }} />
          </Typography>
          <Reveal delay={200}>
            <Typography sx={{ mt: 2.5, mx: 'auto', maxWidth: 680, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.75, color: 'text.secondary' }}>{course.description}</Typography>
          </Reveal>
          <Reveal delay={320}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4.5, alignItems: 'center' }}>
              <MovingBorderButton onClick={start} filled>
                {resume ? `Resume course · ${pct}%` : 'Start course'}
              </MovingBorderButton>
              <Button variant="outlined" size="large" onClick={toModules} endIcon={<ArrowDownwardRoundedIcon />}>
                See the modules
              </Button>
            </Box>
            {resume && (
              <Button size="small" onClick={() => setConfirm(true)} sx={{ mt: 2 }}>
                Start over
              </Button>
            )}
          </Reveal>
          <Reveal delay={420}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, sm: 7 }, flexWrap: 'wrap', mt: 7 }}>
              {stats.map(([v, label]) => (
                <Box key={label}>
                  <Typography sx={{ fontSize: { xs: 34, sm: 46 }, fontWeight: 800, lineHeight: 1.05, color: 'secondary.main' }}>{typeof v === 'number' ? <CountUp value={v} /> : v}</Typography>
                  <Typography color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- cover preview */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, mb: { xs: 6, md: 10 } }}>
        <ScrollTilt>
          <Box component="img" src={assetUrl('assets/covers/claude-deep.webp')} alt="Claude Deep Dive course cover" sx={(t) => ({ width: '100%', display: 'block', borderRadius: '28px', border: `1px solid ${t.tx.line}`, boxShadow: `0 40px 100px ${t.tx.glow}` })} />
        </ScrollTilt>
      </Container>

      {/* ---------------------------------------------------------------- who for */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Lamp>
          <Kicker>Who it is for</Kicker>
          <Typography variant="h2" sx={{ fontSize: { xs: 26, sm: 38 }, maxWidth: 760, mx: 'auto', px: 2, lineHeight: 1.3 }}>
            {course.whoFor}
          </Typography>
        </Lamp>
      </Box>

      {/* ---------------------------------------------------------------- marquee */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        <InfiniteRow seconds={60}>
          {modules.map((m) => (
            <Chip key={m.id} icon={<Box sx={{ display: 'grid', '& svg': { fontSize: 18 } }}>{moduleIcon(m.number)}</Box>} label={m.title} variant="outlined" sx={(t) => ({ height: 42, px: 0.75, fontWeight: 700, fontSize: 14, borderColor: t.tx.line, background: t.tx.surface })} />
          ))}
        </InfiniteRow>
      </Box>

      {/* ---------------------------------------------------------------- modules */}
      <Container id="modules" maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Kicker>The path</Kicker>
          <Typography variant="h2" sx={{ fontSize: { xs: 30, sm: 46 } }}>
            {modules.length} modules, <GradientText>one build at a time</GradientText>
          </Typography>
        </Box>
        <ScrollTimeline
          items={modules.map((m) => ({
            title: `${pad2(m.number)} · ${m.title}`,
            icon: moduleIcon(m.number),
            body: (
              <TiltCard max={6} onClick={() => { Narrator.unlock(); nav(`/learn/${m.screens[0].id}`); }} sx={{ cursor: 'pointer' }}>
                <Box sx={(t) => ({ p: 2.5, textAlign: 'left', borderRadius: '22px', border: `1px solid ${t.tx.line}`, background: t.tx.surface, backdropFilter: 'blur(18px)' })}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontWeight: 700, fontSize: 13, mb: 1.25, '& svg': { fontSize: 16 } }}>
                    <ScheduleRoundedIcon />
                    {m.estTime}
                    {Progress.moduleProgress(m) > 0 && <ToolBadge name={`${Progress.moduleProgress(m)}%`} sx={{ ml: 'auto', bgcolor: 'primary.main', color: 'primary.contrastText' }} />}
                  </Box>
                  <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
                    {m.outcomes.map((o, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', gap: 1.25, fontSize: 14.5, lineHeight: 1.6 }}>
                        <Box component="span" aria-hidden sx={(t) => ({ flex: 'none', mt: '9px', width: 6, height: 6, borderRadius: '50%', bgcolor: t.tx.hl })} />
                        <span>{inline(o, `${m.id}-${i}`)}</span>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </TiltCard>
            ),
          }))}
        />
      </Container>

      {/* ---------------------------------------------------------------- closing CTA */}
      <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', pb: 12, px: 2 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 28, sm: 42 }, mb: 3 }}>
          Ready to <GradientText>deep dive</GradientText>?
        </Typography>
        <MovingBorderButton onClick={start} filled>
          {resume ? 'Resume course' : 'Start course'}
        </MovingBorderButton>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 6 }}>
          © {new Date().getFullYear()} {course.brand}
        </Typography>
      </Box>

      <ConfirmRestart open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); Learner.reset(); }} />
    </Box>
  );
}
