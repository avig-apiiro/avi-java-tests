import _ from 'lodash';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import {
  Artifact,
  ArtifactAsset,
  ArtifactCloudTool,
  ArtifactCodeAssets,
  ArtifactDependency,
  ArtifactServer,
  ArtifactVersion,
  CodeAssetsDependency,
  RelatedFinding,
  RelatedFindingCodeRepository,
} from '@src-v2/types/artifacts/artifacts-types';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import { StubAny } from '@src-v2/types/stub-any';
import { Filter } from '../hooks/use-filters';

export class Artifacts {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  searchArtifacts(params: Partial<SearchParams>) {
    return this.#client.search<Artifact>('artifacts/search', params);
  }

  async getArtifactsFilterOptions(): Promise<Filter[]> {
    const filterGroups = await this.#client.get<StubAny>('artifacts/filterOptions');
    return _.orderBy(filterGroups, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(transformFilterGroups);
  }

  getArtifactsSortOptions(): Promise<LegacyFilterGroup[]> {
    return this.#client.get('artifacts/sortOptions');
  }

  getArtifact({ key }: { key: string }): Promise<Artifact> {
    return this.#client.get(`artifacts/${key}`);
  }

  getArtifactDependencies({
    key,
    ...params
  }: StubAny): Promise<AggregationResult<ArtifactDependency>> {
    return this.#client.search(`artifacts/${key}/dependencies/search`, params);
  }

  async getArtifactDependenciesFilterOptions({ key }: { key: string }): Promise<Filter[]> {
    const filterGroups = await this.#client.get<StubAny>(
      `artifacts/${key}/dependencies/filterOptions`
    );
    return filterGroups.map(transformFilterGroups);
  }

  getArtifactVersions({ key, ...params }: StubAny): Promise<AggregationResult<ArtifactVersion>> {
    return this.#client.search(`artifacts/${key}/versions/search`, params);
  }

  async getArtifactVersionsFilterOptions({ key }: { key: string }): Promise<Filter[]> {
    const filterGroups = await this.#client.get<StubAny>(`artifacts/${key}/versions/filterOptions`);
    return filterGroups.map(transformFilterGroups);
  }

  getArtifactConnectionsCodeAssets({
    key,
    ...params
  }: StubAny): Promise<AggregationResult<ArtifactCodeAssets>> {
    return this.#client.search(`artifacts/${key}/connections/codeAssets/search`, params);
  }

  async removeArtifactCodeAsset(
    artifactKey: string,
    params: { repositoryKey: string; moduleNames?: string[] }[]
  ) {
    await this.#client.post(`artifacts/${artifactKey}/connections/codeAssets/unlink`, params);
    this.#asyncCache.invalidateAll(this.getArtifactConnectionsCodeAssets);
  }

  async addArtifactCodeAsset(
    artifactKey: string,
    params: { repositoryKey: string[]; moduleNames?: string[] }[]
  ) {
    await this.#client.post(`artifacts/${artifactKey}/connections/codeAssets/link`, params);
    this.#asyncCache.invalidateAll(this.getArtifactConnectionsCodeAssets);
    this.#asyncCache.invalidateAll(this.getArtifact);
  }

  getArtifactCloudTool({ key }: { key: string }): Promise<ArtifactCloudTool[]> {
    return this.#client.get(`artifacts/${key}/connections/cloudTools/list`);
  }

  async addArtifactCloudTools(artifactKey: string, cloudToolKeys: string[]) {
    await this.#client.post(`artifacts/${artifactKey}/connections/cloudTools/link`, cloudToolKeys);
    this.#asyncCache.invalidateAll(this.getArtifactCloudTool);
  }

  async removeArtifactCloudTool(artifactKey: string, cloudToolKeys: string[]) {
    await this.#client.post(
      `artifacts/${artifactKey}/connections/cloudTools/unlink`,
      cloudToolKeys
    );
    this.#asyncCache.invalidateAll(this.getArtifactConnectionsCodeAssets);
  }

  getArtifactAvailableServers(): Promise<ArtifactServer[]> {
    return this.#client.get('/artifacts/cloudTools/availableServers');
  }

  getArtifactAvailableAssets({ key, ...params }: StubAny) {
    return this.#client.search<ArtifactAsset>(
      `/artifacts/${key}/connections/cloudTools/available/search`,
      params
    );
  }

  getCodeAssetsDependencies({
    key,
    dependencyName,
  }: {
    key: string;
    dependencyName: string;
  }): Promise<CodeAssetsDependency[]> {
    return this.#client.get(`artifacts/${key}/connections/codeAssets/dependencies`, {
      params: { dependencyName },
    });
  }

  getArtifactRelatedFindings({
    key,
    dependencyName,
    findingId,
  }: {
    key: string;
    dependencyName: string;
    findingId: string;
  }): Promise<RelatedFinding[]> {
    return key
      ? this.#client.get(`/findings/artifact/${key}`, {
          params: { dependencyName, findingId },
        })
      : null;
  }

  getArtifactRelatedCodeRepositoryFindings({
    key,
    dependencyName,
  }: {
    key: string;
    dependencyName: string;
  }): Promise<RelatedFindingCodeRepository[]> {
    return key
      ? this.#client.get(`/artifacts/${key}/connections/codeAssets/findings`, {
          params: { dependencyName },
        })
      : null;
  }
}
