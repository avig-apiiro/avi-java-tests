import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';

export enum CodeChanges {
  Commit = 'Code change',
}

export interface EntityEvent {
  shortSha: string;
  commitSha: string;
  label: string;
  riskLevel: keyof typeof RiskLevel;
  createdAt: Date;
  developer?: LeanDeveloper;
  type: CodeChanges.Commit;
}

export interface DueDateChangeTimelineEvent {
  currentDueDate: Date;
  createdAt: Date;
  createdBy: string;
  type: 'DueDateChange';
  overrideActionProvider: any;
}

export interface CommentTimelineEvent {
  createdAt: Date;
  createdBy: string;
  message: string;
  commentSourceData: any;
  ticketsCommentAppearAt: object[];
  type: 'Comment';
}
