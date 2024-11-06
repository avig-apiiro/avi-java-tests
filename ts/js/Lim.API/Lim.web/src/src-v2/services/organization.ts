import _ from 'lodash';
import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { Provider } from '@src-v2/types/enums/provider';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';
import { entries } from '@src-v2/utils/ts-utils';

interface RiskyTickets {
  monitoredTicketTypesByProvider: Record<Provider, string[]>;
  riskyTicketsConfiguration: {
    enabledTicketTypesByProvider: Record<Provider, string[]>;
    modified: Date | string;
    featureEnabled: boolean;
    enabledDate: Date | string;
  };
}

export interface SlaPolicyDefinition {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskScoreDefinition {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface GranulatedSlaPolicyDefinition {
  key: string;
  slaConfiguration: SlaPolicyDefinition;
  name: string;
  tags?: TagResponse[];
  assets?: { key: string; name: string }[];
  policyType: 'Application' | 'OrgTeam';
}

export class Organization {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  private readonly slaBaseUrl = 'slaPolicies';

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  getLearningStatistics() {
    return this.#client.get('organization/learningStatistics');
  }

  getAttackSurfaceHighlights() {
    return this.#client.get('organization/attackSurfaceHighlights');
  }

  getTechnologies() {
    return this.#client.get('organization/technologies');
  }

  async getRiskSLASettings(): Promise<SlaPolicyDefinition> {
    return await this.#client.get(`configuration/sla`);
  }

  async getRiskScoreSettings(): Promise<RiskScoreDefinition> {
    return await this.#client.get(`risk-score/global`);
  }

  async setRiskScoreSettings(data: StubAny): Promise<void> {
    await this.#client.post(`risk-score/global`, data);
    this.#asyncCache.invalidateAll(this.getRiskScoreSettings);
  }

  async getGranularSLASettings(): Promise<GranulatedSlaPolicyDefinition[]> {
    return await this.#client.get(`${this.slaBaseUrl}/granular`);
  }

  async setRiskSLASettings(data: StubAny) {
    await this.#client.put(`configuration/sla`, data);
    this.#asyncCache.invalidateAll(this.getRiskSLASettings);
  }

  async updateGranularSlaPolicies(
    updatedPolicies: GranulatedSlaPolicyDefinition[],
    deletedPolicyKeys: string[]
  ) {
    await this.#client.post(`${this.slaBaseUrl}/granular`, {
      updatedPolicies: updatedPolicies.map(({ assets, slaConfiguration, ...policy }) => ({
        ...policy,
        assetCollectionKeys: assets?.map(asset => asset.key),
        slaConfiguration: entries(slaConfiguration).reduce(
          (configuration, [key, value]) => ({
            ...configuration,
            [key]: value ? parseInt(value.toString()) : undefined,
          }),
          {}
        ),
      })),
      deletedPolicyKeys,
    });

    this.#asyncCache.invalidateAll(this.getGranularSLASettings);
  }

  getRiskyTickets(): Promise<RiskyTickets> {
    return this.#client.get('configuration/riskyTickets');
  }

  async setRiskyTickets(
    enabledTicketTypesByProvider: Record<string, string[]>,
    featureEnabled: boolean
  ): Promise<void> {
    await this.#client.put(`configuration/riskyTickets`, {
      EnabledTicketTypesByProvider: enabledTicketTypesByProvider,
      FeatureEnabled: featureEnabled,
    });
    this.#asyncCache.invalidateAll(this.getRiskyTickets);
  }

  getContributors() {
    return this.#client.get('organization/contributors').then(contributors =>
      _.defaultsDeep(
        {
          linkTo: '/users/contributors',
          recentlyActive: {
            linkTo: makeUrl('/users/contributors', {
              fl: { Behavior: { values: ['IsActiveDeveloper'] } },
            }),
          },
          recentlyJoined: {
            linkTo: makeUrl('/users/contributors', { fl: { Behavior: { values: ['IsNew'] } } }),
          },
          securityRelated: {
            linkTo: makeUrl('/users/contributors', {
              fl: { Contributions: { values: ['ContributedSecurity'] } },
            }),
          },
        },
        contributors
      )
    );
  }
}
