import { ActionType } from '@src-v2/types/enums/action-type';
import { RiskLevel, RiskStatus } from '@src-v2/types/enums/risk-level';
import {
  CodeChanges,
  CommentTimelineEvent,
  DueDateChangeTimelineEvent,
  EntityEvent,
} from '@src-v2/types/inventory-elements/entity-event';
import { ActionTakenDetails } from '@src-v2/types/risks/action-taken-details';
import { RiskOverrideData } from '@src-v2/types/risks/risk-override-data';

export const TimelineEventType = {
  ...ActionType,
  ...CodeChanges,
};

export class RiskOverrideEvent {
  constructor({ reason, riskLevel, riskStatus, timestamp, user, changedByType }: RiskOverrideData) {
    this.reason = reason;
    this.riskLevel = riskLevel;
    this.riskStatus = riskStatus;
    this.createdAt = timestamp;
    this.createdBy = user;
    this.changedByType = changedByType;
  }

  reason: string;
  riskLevel: keyof typeof RiskLevel;
  riskStatus: keyof typeof RiskStatus;
  createdBy: string;
  createdAt: Date;
  changedByType: 'Api' | 'User';
  get type() {
    return 'RiskOverrideEvent';
  }
}

export type TimelineEvent =
  | ActionTakenDetails
  | EntityEvent
  | RiskOverrideEvent
  | DueDateChangeTimelineEvent
  | CommentTimelineEvent;

export interface TimelineFilterOption {
  type: keyof typeof TimelineEventType;
  count: number;
}
