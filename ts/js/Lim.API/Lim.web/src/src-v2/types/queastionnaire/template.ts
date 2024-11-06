import {
  QuestionCondition,
  QuestionOption,
  QuestionType,
} from '@src-v2/types/queastionnaire/questionnaire-response';

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  options: QuestionOption[];
  enabledBy: QuestionCondition;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Template {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

export interface TemplateSummary {
  id: string;
  title: string;
  updatedTime: Date | null;
}
