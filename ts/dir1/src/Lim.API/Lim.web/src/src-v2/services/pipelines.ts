import { transformFilterGroups } from '@src-v2/data/transformers';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import {
  CICDServer,
  CICDServerDependency,
  CICDServerDependencyInfo,
  CICDServerPipeline,
  Pipeline,
} from '@src-v2/types/pipelines/pipelines-types';
import { Filter } from '../hooks/use-filters';

export class Pipelines {
  #client: ApiClient;

  constructor({ apiClient }: { apiClient: ApiClient }) {
    this.#client = apiClient;
  }

  searchPipelines(params: Partial<SearchParams>): Promise<AggregationResult<Pipeline>> {
    return this.#client.search('pipelines/search', params);
  }

  searchCICDServers(params: Partial<SearchParams>): Promise<AggregationResult<CICDServer>> {
    return this.#client.search('cicd/servers/search', params);
  }

  searchCICDServerPipelines(
    params: Partial<SearchParams>
  ): Promise<AggregationResult<CICDServerPipeline>> {
    return this.#client.search('cicd/servers/pipelines', params);
  }

  searchCICDServerDependencies(
    params: Partial<SearchParams>
  ): Promise<AggregationResult<CICDServerDependency>> {
    return this.#client.search('cicd/servers/dependencies', params);
  }

  getCICDServer({ key }: { key: string }): Promise<CICDServer> {
    return this.#client.get(`cicd/servers/${key}`);
  }

  async getPipelinesFilterOptions(): Promise<Filter[]> {
    const filterGroups = await this.#client.get('pipelines/filterOptions');
    return filterGroups.map(transformFilterGroups);
  }

  async getServersFilterOptions(): Promise<Filter[]> {
    const filterGroups = await this.#client.get('cicd/servers/filterOptions');
    return filterGroups.map(transformFilterGroups);
  }

  async getServersDependenciesFilterOptions(): Promise<Filter[]> {
    const filterGroups = await this.#client.get('cicd/servers/dependencies/filterOptions');
    return filterGroups.map(transformFilterGroups);
  }

  getServersDependencyInfo({
    name,
    version,
    serverUrl,
  }: {
    name: string;
    version: string;
    serverUrl: string;
  }): Promise<CICDServerDependencyInfo> {
    return this.#client.get('cicd/servers/dependency/info', {
      params: { name, version, serverUrl },
    });
  }

  getPipelinesSortOptions(): Promise<LegacyFilterGroup[]> {
    return this.#client.get('pipelines/sortOptions');
  }

  getPipeline({ key }: { key: string }): Promise<Pipeline> {
    return this.#client.get(`pipelines/${key}`);
  }
}
