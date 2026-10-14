export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  whoFor: string;
  duration: string;
  moduleCount: number;
  brand: string;
  certificateUrl: string;
}

export interface ListItem {
  label: string;
  text: string;
}

/** One paragraph of body text: plain string, a "Label: text" list, or an inline prompt card. */
export type Paragraph = string | { list: ListItem[] } | { prompt: string };

export interface Option {
  id: string;
  text: string;
}

export interface Blank {
  options: string[];
  correct: string;
}

export type ScreenType =
  | 'module_intro'
  | 'text'
  | 'tool_intro'
  | 'prompt_and_output'
  | 'practice_task'
  | 'mcq'
  | 'multi_select'
  | 'multi_fill_blank'
  | 'reorder'
  | 'key_takeaways'
  | 'module_complete'
  | 'course_complete';

/** Every screen type in course.json, with all fields optional (each type uses its own subset). */
export interface Screen {
  id: string;
  type: ScreenType;
  visuals?: number;
  hideCopy?: boolean;
  popQuiz?: boolean;
  tool?: string;
  heading?: string;
  body?: Paragraph[];
  description?: string;
  steps?: string[];
  prompt?: string;
  examplePrompt?: string;
  promptLabel?: string;
  outputLabel?: string;
  output?: string;
  note?: string;
  explanation?: string;
  question?: string;
  options?: Option[];
  correct?: string | string[];
  instruction?: string;
  items?: Array<string | Option>;
  correctOrder?: string[];
  template?: string;
  blanks?: Blank[];
  outputImage?: string;
  outputImages?: string[];
  outputVideo?: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  estTime: string;
  outcomes: string[];
  screens: Screen[];
}

export interface FlatEntry {
  screen: Screen;
  module: Module;
  index: number;
}
