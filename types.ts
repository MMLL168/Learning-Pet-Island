export enum QuestionType {
  PHONETIC = '字音字形',
  FILL_BLANK = '填空',
  FIX_TYPO = '改錯別字',
  CHOICE = '選擇題',
  SENTENCE = '造句',
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string; // The question text
  options?: string[]; // For multiple choice
  correctAnswer?: string; // For auto-grading
  keyword?: string; // For sentence making
  explanation?: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  loading: boolean;
  complete: boolean;
}

export enum PetStage {
  EGG = 'EGG',
  BABY = 'BABY',
  CHILD = 'CHILD',
  TEEN = 'TEEN',
  ADULT = 'ADULT',
  GRADUATE = 'GRADUATE',
}

export interface Pet {
  name: string;
  stage: PetStage;
  exp: number;
  maxExp: number;
  mood: number; // 0-100
}

export interface UserState {
  food: number;
  points: number; // Reward points
  inventory: string[]; // Collected items
}
