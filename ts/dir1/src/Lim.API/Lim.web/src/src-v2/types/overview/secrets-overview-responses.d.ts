import { ExternalProvider } from '@src-v2/types/enums/external-provider';
import { OverviewLineItem } from '@src-v2/types/overview/overview-line-item';
import { Insight } from '@src-v2/types/risks/insight';

export interface ProviderToValidSecrets {
  provider: keyof typeof ExternalProvider | 'Other';
  count: number;
}

export interface ObtainableExploitableImpactfulSecrets {
  category: 'obtainable' | 'exploitable' | 'impactful';
  count: number;
}

export interface AggregatedSecretsData<T> {
  data: T[];
}

export type ValidSecretsOverTime = {
  validSecretsInPublicRepos: OverviewLineItem[];
  validSecrets: OverviewLineItem[];
};

export interface PatternedSecretsResult {
  count: number;
  externalPlatform: string;
  insights: Insight[];
  secretHash: string;
  secretTypeDescription: string;
  validationResult: string;
  lastFoundValid: string;
}
