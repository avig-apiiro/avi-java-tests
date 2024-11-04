import _ from 'lodash';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { Filter } from '@src-v2/hooks/use-filters';
import { Analytics } from '@src-v2/services/analytics';
import { ApiClient, SearchParams, transformLegacyFilters } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StubAny } from '@src-v2/types/stub-any';
import { downloadFile } from '@src-v2/utils/dom-utils';

export interface SearchLogType {
  key: string;
  eventType: string;
  eventDescription: string;
  status: string;
  timestamp: string;
  user: string;
  impactedEntityUrl?: string;
}

export class AuditLogs {
  #client: ApiClient;
  #analytics: Analytics;
  #asyncCache: AsyncCache;

  constructor({
    apiClient,
    analytics,
    asyncCache,
  }: {
    apiClient: ApiClient;
    analytics: Analytics;
    asyncCache: AsyncCache;
  }) {
    this.#client = apiClient;
    this.#analytics = analytics;
    this.#asyncCache = asyncCache;
  }

  searchLogs(params: Partial<SearchParams>): Promise<AggregationResult<SearchLogType>> {
    return this.#client.search('auditlogs', params);
  }

  invalidateLogs() {
    this.#asyncCache.invalidateAll(this.searchLogs);
  }

  async getFilterOptions(): Promise<Filter[]> {
    const options = await this.#client.get<StubAny>(`auditlogs/filterOptions`);
    return _.orderBy(options, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(item => transformFilterGroups(item));
  }

  async exportLogs({ searchTerm, ...filters }: { searchTerm: string; [key: string]: StubAny }) {
    const startTime = Date.now();
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    const { headers, data } = await this.#client.get(`auditlogs/export`, {
      noInterceptor: true,
      responseType: 'blob',
      params: { searchTerm, tableFilterToQuery: transformLegacyFilters(filters), timeZone },
    });
    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'application/zip');
    this.#analytics.track('Export Clicked', {
      'Number of Items': 'All',
      Context: 'Audit Log',
      'Download Time': `${(Date.now() - startTime) / 1000}ms`,
    });
  }
}
