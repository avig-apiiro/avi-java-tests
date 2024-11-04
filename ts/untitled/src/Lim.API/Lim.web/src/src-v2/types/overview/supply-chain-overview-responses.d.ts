import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';

export type RiskyPipelinesOverTimeResponse = {
  misconfiguredPipelinesOverTime: OverviewLineItem[];
  vulnerablePipelinesOverTime: OverviewLineItem[];
};

export type AbnormalCommitsOverTimeResponse = {
  abnormalCommitsOverTime: OverviewLineItem[];
};
