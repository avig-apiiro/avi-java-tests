import _ from 'lodash';
import { transformLegacyFilters } from '@src-v2/services';
import { BaseOverviewService } from '@src-v2/services/overview/base-overview-service';
import { TopRepositoryItem } from '@src-v2/types/overview/overview-responses';
import {
  AbnormalCommitsOverTimeResponse,
  RiskyPipelinesOverTimeResponse,
} from '@src-v2/types/overview/supply-chain-overview-responses';
import { StubAny } from '@src-v2/types/stub-any';

export class SupplyChainOverview extends BaseOverviewService {
  constructor({ apiClient, organization }: StubAny) {
    super({ apiClient, organization, baseUrl: 'supply-chain-dashboard' });
  }

  getRiskyPipelinesOverTime({
    filters,
  }: {
    filters: StubAny;
  }): Promise<RiskyPipelinesOverTimeResponse> {
    return this.client.get(`${this.baseUrl}/risky-pipelines-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }

  getTopRepositoriesInactiveContributors = async ({
    filters,
  }: StubAny): Promise<TopRepositoryItem[]> => {
    const topRepositories: TopRepositoryItem[] = await this.client.get(
      `${this.baseUrl}/top-hbi-repos-inactive-contributors`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );

    return _.orderBy(topRepositories, 'count', 'desc');
  };

  getAbnormalCommitsOverTime({
    filters,
  }: {
    filters: StubAny;
  }): Promise<AbnormalCommitsOverTimeResponse> {
    return this.client.get(`${this.baseUrl}/abnormal-commits-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }
}
