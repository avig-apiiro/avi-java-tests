import _ from 'lodash';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { RepositoryProfiles } from '@src-v2/services/profiles/repository-profiles';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Release } from '@src-v2/types/releases/release';
import { StubAny } from '@src-v2/types/stub-any';

export class Releases {
  #client: ApiClient;
  #asyncCache: AsyncCache;
  #repositoryProfiles: RepositoryProfiles;

  constructor({ apiClient, asyncCache, repositoryProfiles }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#repositoryProfiles = repositoryProfiles;
  }

  async searchReleases(params: Partial<SearchParams>): Promise<AggregationResult<Release>> {
    const result: AggregationResult<Release> = await this.#client.search(
      '/releases/search',
      params
    );

    const repositoryKeys = result.items.map(({ repositoryKey }) => repositoryKey);
    if (!repositoryKeys.length) {
      return result;
    }

    const repositories = await this.#repositoryProfiles.getLeanRepositories({
      keys: repositoryKeys,
    });
    const repositoriesByKey = _.keyBy(repositories, 'key');
    result.items.forEach(item => {
      item.relatedRepositoryProfile = repositoriesByKey[item.repositoryKey];
    });

    return result;
  }

  async deleteRelease({ key }: { key: string }) {
    await this.#client.delete(`/releases/${key}`);
    return this.#asyncCache.invalidateAll(this.searchReleases);
  }

  async upsertRelease(release: Release) {
    if (release.key) {
      await this.#client.put('releases', release);
    } else {
      release.key = crypto.randomUUID();
      await this.#client.post('releases', release);
    }

    return this.#asyncCache.invalidateAll(this.searchReleases);
  }
}
