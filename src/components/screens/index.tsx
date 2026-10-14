import { stripMarkup } from '../../utils/text';
import type { Module, Screen } from '../../types';
import { KeyTakeaways, ModuleIntro, PracticeTask, PromptOutput, TextScreen, ToolIntro } from './Basics';
import { CourseComplete, ModuleComplete } from './Complete';
import { MultiFillBlank, MultiSelect, Mcq, Reorder } from './Quizzes';

export interface ScreenActions {
  onNext: () => void;
  onRestart: () => void;
  onGoTo: (id: string) => void;
}

export function ScreenView({ screen, module, actions }: { screen: Screen; module: Module; actions: ScreenActions }) {
  const p = { screen, module };
  switch (screen.type) {
    case 'module_intro':
      return <ModuleIntro {...p} />;
    case 'text':
      return <TextScreen {...p} />;
    case 'tool_intro':
      return <ToolIntro {...p} />;
    case 'prompt_and_output':
      return <PromptOutput {...p} />;
    case 'practice_task':
      return <PracticeTask {...p} />;
    case 'key_takeaways':
      return <KeyTakeaways {...p} />;
    case 'mcq':
      return <Mcq {...p} />;
    case 'multi_select':
      return <MultiSelect {...p} />;
    case 'multi_fill_blank':
      return <MultiFillBlank {...p} />;
    case 'reorder':
      return <Reorder {...p} />;
    case 'module_complete':
      return <ModuleComplete module={module} onNext={actions.onNext} />;
    case 'course_complete':
      return <CourseComplete onRestart={actions.onRestart} onGoTo={actions.onGoTo} />;
    default:
      return null;
  }
}

/** What is read aloud for a screen. Questions only, never the answers. */
export function narrationFor(s: Screen, m: Module): string {
  switch (s.type) {
    case 'module_intro':
      return `${m.title}. Estimated time, ${m.estTime}. In this module, you will: ${(m.outcomes || []).map(stripMarkup).join('. ')}`;
    case 'text':
      return (
        stripMarkup(s.heading ? s.heading + '. ' : '') +
        (s.body || [])
          .map((p) => {
            if (typeof p === 'string') return stripMarkup(p);
            if ('list' in p) return p.list.map((it) => `${it.label}: ${stripMarkup(it.text)}`).join('. ');
            return 'Prompt: ' + p.prompt;
          })
          .join(' ')
      );
    case 'tool_intro':
      return `${s.tool}. ${stripMarkup(s.description || '')}` + (s.steps ? ' Step by step: ' + s.steps.map((st, i) => `Step ${i + 1}: ${stripMarkup(st)}`).join('. ') : '');
    case 'prompt_and_output':
      return `${s.promptLabel}: ${s.prompt}` + (s.examplePrompt ? `. Example: ${s.examplePrompt}` : '') + `. ${s.outputLabel}: ${s.output}`;
    case 'practice_task':
      return `${stripMarkup(s.heading || '')}. ${s.prompt}`;
    case 'mcq':
    case 'multi_select':
      return s.question || '';
    case 'multi_fill_blank':
      return (s.heading ? s.heading + '. ' : '') + (s.template || '').replace(/\[\[\d+\]\]/g, 'blank');
    case 'reorder':
      return `${s.instruction}. Items: ${((s.items || []) as Array<{ text: string }>).map((i) => i.text).join(', ')}`;
    case 'key_takeaways':
      return 'Key takeaways. ' + ((s.items || []) as string[]).map(stripMarkup).join('. ');
    default:
      return '';
  }
}
