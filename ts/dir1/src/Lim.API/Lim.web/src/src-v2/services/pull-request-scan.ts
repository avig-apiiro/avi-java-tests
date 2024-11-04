import { transformFilterGroups } from '@src-v2/data/transformers';
import { Filter } from '@src-v2/hooks/use-filters';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import {
  PullRequestMaterialChangesSummary,
  PullRequestScanResponse,
} from '@src-v2/types/pull-request/pull-request-response';
import { StubAny } from '@src-v2/types/stub-any';

export class PullRequestScan {
  private client: ApiClient;
  private readonly prScanKillSwitchUrl = 'pullRequestScanKillSwitch';
  private readonly pullRequestsUrl = 'pull-request-scans';

  constructor({ apiClient }: StubAny) {
    this.client = apiClient;
  }

  async getFilterOptions(): Promise<Filter[]> {
    const filterOptions: LegacyFilterGroup[] = await this.client.get(
      `${this.pullRequestsUrl}/filterOptions`
    );
    return filterOptions.map(transformFilterGroups);
  }

  async searchPullRequests(
    params: Partial<SearchParams>
  ): Promise<AggregationResult<PullRequestScanResponse>> {
    return await this.client.search(`${this.pullRequestsUrl}/search`, params);
  }

  async getPullRequest({ key }: { key: string }): Promise<PullRequestScanResponse> {
    return await this.client.get(`${this.pullRequestsUrl}/${key}`);
  }

  async getPullRequestMaterialChanges({
    key,
  }: {
    key: string;
  }): Promise<PullRequestMaterialChangesSummary[]> {
    return await this.client.get(`${this.pullRequestsUrl}/${key}/materialChanges`);
  }

  async getKillSwitchConfiguration() {
    try {
      return await this.client.get(`${this.prScanKillSwitchUrl}/pullRequestScanKillSwitch`);
    } catch (error) {
      console.error('Failed to fetch kill switch configuration:', error);
      throw error;
    }
  }

  setKillSwitchConfiguration() {
    try {
      return this.client.post(`${this.prScanKillSwitchUrl}/pullRequestScanKillSwitch`);
    } catch (error) {
      console.error('Failed to set kill switch configuration:', error);
      throw error;
    }
  }
}
