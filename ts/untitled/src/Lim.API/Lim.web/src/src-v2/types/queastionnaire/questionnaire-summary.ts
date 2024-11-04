import {
  QuestionnaireState,
  QuestionnaireTriggeringIssue,
} from '@src-v2/types/queastionnaire/questionnaire-response';

export interface QuestionnaireSummary {
  // TODO: we need to replace `id` with `key` in BE
  key: string;
  id: string;
  accessKey: string;
  title: string;
  templateName: string;
  dueDate: Date;
  currentState: QuestionnaireState;
  triggeringIssue: QuestionnaireTriggeringIssue;
  updatedTime: Date | null;
}

export interface QuestionnaireTemplateSummary {
  // TODO: we need to replace `id` with `key` in BE
  id: string;
  key: string;
  title: string;
}
