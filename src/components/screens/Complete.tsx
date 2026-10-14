import { useEffect, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { course, modules, pad2, realScreens } from '../../data/courseData';
import { Narrator } from '../../engine/audio';
import { Learner, Progress, useLearner } from '../../engine/store';
import type { Module } from '../../types';
import { CountUp } from '../Motion';
import { GradientText } from '../fx';
import { Glass, Kicker } from '../ui';
import { Burst } from './Quizzes';

function Trophy({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ position: 'relative', width: 104, height: 104, mx: 'auto', mb: 2.5 }}>
      <Box aria-hidden sx={(t) => ({ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${t.tx.hl}`, animation: 'txring 2.4s ease-out infinite' })} />
      <Box sx={(t) => ({ position: 'absolute', inset: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: `0 16px 48px ${t.tx.glow}`, animation: 'txtrophy .9s cubic-bezier(.2,.8,.2,1) both', '& svg': { fontSize: 52 } })}>{children}</Box>
    </Box>
  );
}

export function ModuleComplete({ module: m, onNext }: { module: Module; onNext: () => void }) {
  useLearner();
  useEffect(() => {
    Learner.markModuleDone(m.id);
  }, [m.id]);
  const i = modules.findIndex((x) => x.id === m.id);
  const next = modules[i + 1];
  return (
    <Glass sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
      <Burst pieces={60} />
      <Trophy>
        <CheckRoundedIcon />
      </Trophy>
      <Kicker>Module complete</Kicker>
      <Typography variant="h2" sx={{ fontSize: { xs: 28, sm: 40 } }}>
        <GradientText>{m.title}</GradientText>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, sm: 6 }, my: 4 }}>
        {[
          ['This module', Progress.moduleProgress(m)],
          ['Overall course', Progress.courseProgress()],
        ].map(([label, v]) => (
          <Box key={label as string}>
            <Typography sx={{ fontSize: { xs: 36, sm: 48 }, fontWeight: 800, lineHeight: 1, color: 'secondary.main' }}>
              <CountUp value={v as number} suffix="%" />
            </Typography>
            <Typography color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Button variant="contained" size="large" onClick={onNext}>
        {next ? `Continue to module ${pad2(next.number)}` : 'Continue to final review'}
      </Button>
    </Glass>
  );
}

export function CourseComplete({ onRestart, onGoTo }: { onRestart: () => void; onGoTo: (id: string) => void }) {
  useLearner();
  const done = Progress.isCourseDone();
  useEffect(() => {
    if (!done) return;
    Learner.completeCourse();
    const id = setTimeout(() => Narrator.finale(`Congratulations, you did it! You've completed ${course.title}.`), 200);
    return () => clearTimeout(id);
  }, [done]);

  if (!done) {
    const todo = realScreens.find((e) => Progress.isInteractive(e.screen) && !Learner.isCorrect(e.screen.id));
    return (
      <Glass sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          Almost there
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3, lineHeight: 1.7 }}>
          A few activities are still open. Finish every knowledge check and the course can be marked complete.
        </Typography>
        {todo && (
          <Button variant="contained" size="large" onClick={() => onGoTo(todo.screen.id)}>
            Go to the next unfinished check
          </Button>
        )}
      </Glass>
    );
  }
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Burst pieces={120} />
      <Trophy>
        <EmojiEventsRoundedIcon />
      </Trophy>
      <Kicker>Course complete</Kicker>
      <Typography variant="h2" sx={{ fontSize: { xs: 30, sm: 46 }, mb: 1.5 }}>
        You did it! <GradientText>{course.title}</GradientText>
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', fontSize: 17, lineHeight: 1.7 }}>
        All {course.moduleCount} modules, every tool and every quiz are done.
      </Typography>
      <Glass sx={{ mt: 4, maxWidth: 680, mx: 'auto', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: '.14em', fontSize: 12, color: 'secondary.main' }}>CERTIFICATE OF COMPLETION</Typography>
        <Typography variant="h4" sx={{ my: 1 }}>
          {course.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {course.moduleCount} modules completed. All knowledge checks passed.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center' }}>
          {modules.map((m) => (
            <Box key={m.id} component="span" sx={(t) => ({ px: 1.25, py: 0.4, borderRadius: 999, fontSize: 12.5, fontWeight: 600, border: `1px solid ${t.tx.line}`, background: t.tx.surface })}>
              {m.title}
            </Box>
          ))}
        </Box>
      </Glass>
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
        <Button variant="contained" size="large" component="a" href={course.certificateUrl} target="_blank" rel="noopener noreferrer" startIcon={<EmojiEventsRoundedIcon />}>
          Go to certificate
        </Button>
        <Button variant="outlined" size="large" startIcon={<ReplayRoundedIcon />} onClick={onRestart}>
          Restart from the beginning
        </Button>
      </Box>
    </Box>
  );
}
