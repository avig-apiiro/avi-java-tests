export interface Respondent {
  name: string;
  email: string;
}

export type QuestionType = 'text' | 'multiselect' | 'singleselect';

export interface QuestionOption {
  value: string;
  score: number | null;
}

export interface QuestionCondition {
  questionId: string;
  answer: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  answer: string[] | null;
  answeredBy: Respondent;
  options: QuestionOption[];
  score: number;
  enabledBy: QuestionCondition;
}

export interface Section {
  title: string;
  description: string;
  questions: Question[];
}

export enum Status {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Done = 'Done',
  Discarded = 'Discarded',
}

export interface QuestionnaireState {
  percentCompleted: number;
  status: Status;
  score: number;
}

export interface QuestionnaireTriggeringIssue {
  key: string;
  id: string;
  externalUrl: string;
  provider: string;
}

export interface QuestionnaireResponse {
  metadata: {
    title: string;
    template: string;
    accessKey: string;
    description: string;
    triggeringIssue: QuestionnaireTriggeringIssue;
  };
  response: {
    sections: Section[];
    currentState: QuestionnaireState;
  };
}
