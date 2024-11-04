import { FunnelFilterDefinition, SearchParams, transformLegacyFilters } from '@src-v2/services';
import { BaseConsumableProfilesService } from '@src-v2/services/profiles/base-consumable-profiles-service';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { LeanRepositoryConsumable } from '@src-v2/types/profiles/lean-consumable';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import {
  RepositoryGroup,
  RepositoryProfileResponse,
} from '@src-v2/types/profiles/repository-profile-response';
import { TagOption, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

export class RepositoryProfiles extends BaseConsumableProfilesService<RepositoryProfileResponse> {
  private providerRepositoriesUrl = 'providerRepositories';

  constructor({ apiClient, asyncCache, application }: StubAny) {
    super({ apiClient, application, asyncCache, baseUrl: RepositoryProfileResponse.profileType });
  }

  searchLeanRepositories = async (params: Partial<SearchParams>) =>
    await this.client.search<LeanRepositoryConsumable>(`${this.baseUrl}/v2/search/lean`, params);

  searchRepositoryGroups = async (params: {
    searchTerm?: string;
  }): Promise<AggregationResult<RepositoryGroup>> =>
    await this.client.get(`${this.providerRepositoriesUrl}/groups/search`, {
      params,
    });

  getRepositoryTagsOptions = async (): Promise<TagOption[]> =>
    await this.client.get(`${this.providerRepositoriesUrl}/v2/tagChoices`);

  getAllFlatProviderRepositoryTags = async (): Promise<TagResponse[]> =>
    await this.client.get(`${this.providerRepositoriesUrl}/all-tags`);

  getLeanRepositories = async ({ keys }: { keys: string[] }): Promise<LeanConsumableProfile> =>
    await this.client.get(`${this.baseUrl}/profiles`, { params: { keys } });

  getMaxRiskScore = async (): Promise<number> =>
    await this.client.get(`risk-score/max-risk-score-repo`);

  updateProviderRepositoryTags = async (
    providerRepositoryKey: string,
    tags: TagResponse[],
    profileKey: string
  ) => {
    await this.client.post(
      `${this.providerRepositoriesUrl}/v2/${providerRepositoryKey}/tags`,
      tags
    );

    await Promise.all([
      this.asyncCache.invalidateAll(this.getRepositoryTagsOptions),
      this.asyncCache.invalidateAll(this.getAllFlatProviderRepositoryTags),
      this.asyncCache.invalidate(this.getProfile, { key: profileKey }),
    ]);
  };

  getFunnelFilters = async (): Promise<FunnelFilterDefinition[]> =>
    await this.client.get(`${this.baseUrl}/funnel/filterOptions`);

  searchFunneledRepositoriesCount = async ({
    globalFilters: { searchTerm, ...globalFilters } = {},
    controlledFilters,
  }: {
    globalFilters: Record<string, string[]>;
    controlledFilters: FunnelFilterDefinition[];
  }): Promise<Record<string, number>[]> =>
    await this.client.get(`${this.baseUrl}/funnel/repos-count`, {
      params: {
        body: btoa(
          JSON.stringify({
            searchTerm,
            globalFilters: transformLegacyFilters(globalFilters),
            controlledFilters: controlledFilters?.map(
              ({ tableFilterGroup, tableFilter, values }) => ({
                values,
                tableFilter,
                tableFilterGroup,
              })
            ),
          })
        ),
      },
    });
}
