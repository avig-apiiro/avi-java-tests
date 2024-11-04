import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';

export interface InactiveRepositoryContributorElement extends BaseElement {
  developerKey: string;
  lastCommitTime: Date;
  contributionsThisYear?: OverviewLineItem[];
}
