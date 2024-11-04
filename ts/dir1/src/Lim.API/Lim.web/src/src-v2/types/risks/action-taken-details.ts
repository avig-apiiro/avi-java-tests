import { ActionType } from '@src-v2/types/enums/action-type';

export interface ActionTakenDetails {
  key: string;
  id: string;
  createdBy: string;
  createdAt: Date;
  provider: string;
  externalLink: string;
  channel: string;
  isAutomated: boolean;
  workflowName?: string;
  type: keyof typeof ActionType;
  status?: string;
  isLinkedManually?: boolean;
}

export class ActionsTakenSummary {
  provider: string;
  items: ActionTakenDetails[];

  constructor(provider: string, items: ActionTakenDetails[]) {
    this.provider = provider;
    this.items = items;
  }

  get type() {
    return this.items[0]?.type;
  }

  get isAutomated() {
    return this.items?.some(item => item.isAutomated);
  }

  get isManual() {
    return this.items?.some(item => !item.isAutomated);
  }
}
