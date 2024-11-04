import _ from 'lodash';
import { OptionalDate } from '@src-v2/components/time';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { ActiveFiltersData, Filter } from '@src-v2/hooks/use-filters';
import { Analytics } from '@src-v2/services/analytics';
import { ApiClient, SearchParams, transformLegacyFilters } from '@src-v2/services/api-client';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanRepositoryConsumable } from '@src-v2/types/profiles/lean-consumable';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { downloadFile } from '@src-v2/utils/dom-utils';

export const apiiroProviderSca = 'Apiiro SCA';
export const apiiroProviderApiSecurity = 'Apiiro API Security';
export const apiiroProviderSecretsDetection = 'Apiiro Secrets Detection';
export const embeddedSemgrepProvider = 'Managed Semgrep';
export const apiiroProviderNames = [
  apiiroProviderSca,
  apiiroProviderApiSecurity,
  apiiroProviderSecretsDetection,
];

export type ProjectType = {
  isRecentScan: boolean;
  lastScan: OptionalDate;
  notScannedEntities: any[];
  notSupportedEntities: any[];
  projectName: string;
  scanCoverage: string;
  scannedEntities: any[];
  status: string;
  tooltipFailureOverrideText: string;
  url: string;
};

type CoverageResponse = {
  key: string;
  name: string;
  providerGroup: ProviderGroup;
  applications: LeanApplication[];
  providers: Record<string, ProjectType>;
  repositoryProfile: LeanRepositoryConsumable;
  languages: string[];
  isArchived: boolean;
  isActive: boolean;
  monitorStatus: string;
  ignoredBy: string;
  ignoredReason: string;
  lastMonitoringChangeTimestamp: Date;
  lastCommit: Date;
  repositoryTags: TagResponse[];
  applicationTags: TagResponse[];
};

export class Coverage {
  #client: ApiClient;
  #analytics: Analytics;

  constructor({ apiClient, analytics }: { apiClient: ApiClient; analytics: Analytics }) {
    this.#client = apiClient;
    this.#analytics = analytics;
  }

  async searchCoverage(
    params: Partial<SearchParams>
  ): Promise<AggregationResult<CoverageResponse>> {
    return await this.#client.search('coverage', params);
  }

  async getFilterOptions(): Promise<Filter[]> {
    const options = await this.#client.get('coverage/filterOptions');
    return _.orderBy(options, ['sortOrder', 'displayName']).map(transformFilterGroups);
  }

  getConnectedProvidersAndGroups() {
    return this.#client.get('coverage/providersAndGroups');
  }

  async exportCoverage({ searchTerm, ...filters }: ActiveFiltersData) {
    const startTime = Date.now();
    const { headers, data } = await this.#client.get(`coverage/export`, {
      noInterceptor: true,
      responseType: 'blob',
      params: { searchTerm, tableFilterToQuery: transformLegacyFilters(filters) },
    });
    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'application/zip');
    this.#analytics.track('Export Clicked', {
      'Number of Items': 'All',
      Context: 'Coverage',
      'Download Time': `${(Date.now() - startTime) / 1000}ms`,
    });
  }

  async exportCoverageSelection(repositoryKeys: string[]) {
    const startTime = Date.now();
    const { headers, data } = await this.#client.get(`coverage/bulk-export`, {
      noInterceptor: true,
      responseType: 'blob',
      params: { repositoryKeys },
    });
    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'application/zip');
    this.#analytics.track('Export Clicked', {
      'Number of Items': repositoryKeys.length,
      Context: 'Coverage',
      'Download Time': `${(Date.now() - startTime) / 1000}ms`,
    });
  }
}
