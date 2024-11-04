import _ from 'lodash';
import { SortOption } from '@src-v2/components/persistent-search-state/sort-options-select';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { Services } from '@src-v2/hooks';
import { Filter } from '@src-v2/hooks/use-filters';
import { ApiClient, Application, AsyncCache, Profiles, SearchParams } from '@src-v2/services';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { DeployKey } from '@src-v2/types/profiles/deploy-key';
import {
  TechnologyCategorySchema,
  TechnologyUsageSchema,
} from '@src-v2/types/profiles/technology-category-schema';

export abstract class BaseConsumableProfilesService<TConsumable extends CodeProfileResponse> {
  protected readonly baseUrl: string;
  protected asyncCache: AsyncCache;
  protected client: ApiClient;
  private application?: Application;

  protected constructor({
    baseUrl,
    apiClient,
    asyncCache,
    application,
  }: Pick<Services, 'apiClient' | 'asyncCache' | 'application'> & { baseUrl: string }) {
    this.baseUrl = baseUrl;
    this.client = apiClient;
    this.asyncCache = asyncCache;
    this.application = application;
  }

  searchProfiles = async (
    searchParams: SearchParams,
    apiOptions?: any
  ): Promise<AggregationResult<TConsumable>> =>
    await this.client.search(
      `${this.baseUrl}/profiles/search`,
      {
        ...searchParams,
        sort: searchParams.sort ?? 'DisplayName',
      },
      apiOptions
    );

  getFilterOptions = async (): Promise<Filter[]> => {
    const options = await this.client.get(`${this.baseUrl}/profiles/filterOptions`);

    if (Array.isArray(options) && options.length > 0) {
      return _.orderBy(options, [
        option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
        'displayName',
      ]).map(item => transformFilterGroups(item));
    }
    return [];
  };

  getSortOptions = async (): Promise<SortOption[]> => {
    const sortOptions: {
      name: string;
      displayName: string;
    }[] = await this.client.get(`${this.baseUrl}/profiles/sortOptions`);

    return sortOptions
      ?.map(option => ({
        key: option.name,
        label: option.displayName,
      }))
      .filter(
        ({ key }) =>
          key !== 'RiskScore' || this.application?.isFeatureEnabled(FeatureFlag.RiskScore)
      );
  };

  getProfile = async ({ key }: { key: string }): Promise<TConsumable> =>
    await this.client.get(`${this.baseUrl}/v2/${key}`);

  getLegacyContributors = async (props: { key: string }) => {
    const profile = await this.asyncCache.suspend(this.getProfile, props);
    return Profiles.fillMissingContributorsData(profile);
  };

  getAttackSurfaceHighlights = async ({ key }: { key: string }) =>
    await this.client.get(`${this.baseUrl}/${key}/attackSurfaceHighlights`);

  getTechnologies = async ({ key }: { key: string }): Promise<TechnologyCategorySchema[]> =>
    await this.client.get(`${this.baseUrl}/${key}/technologies`);

  getTechnologyUsages = async (params: {
    profileType: ProfileType;
    key: string;
    moduleRoot?: string;
  }): Promise<TechnologyUsageSchema[]> =>
    (
      await this.fetchProfileInventoryAdditionalElements<TechnologyUsageSchema>({
        ...params,
        route: 'technologyUsages',
      })
    ).items;

  exportTechnologyUsages = async (params: {
    profileType: ProfileType;
    key: string;
    moduleRoot?: string;
  }) =>
    await this.exportProfileInventoryAdditionalElements({
      ...params,
      route: 'technologyUsages',
    });

  getDeployKeys = async (params: { key: string }) =>
    await this.fetchProfileInventoryAdditionalElements<DeployKey>({
      ...params,
      route: 'deployKeys',
    });

  getLearningStatistics = async ({ key }: { key: string }) =>
    await this.client.get(`${this.baseUrl}/${key}/learningStatistics`);

  getApiSecurityHints = async ({
    profileKey,
    entityId,
    violationType,
  }: {
    profileKey: string;
    entityId: string;
    violationType: 'Authorization' | 'InputValidation';
  }): Promise<BaseElement> =>
    await this.client.get(
      `${this.baseUrl}/${profileKey}/apiSecurityHints?apiKey=${entityId}&violationType=${violationType}`
    );

  protected fetchProfileInventoryAdditionalElements = async <T>({
    key,
    route,
    moduleRoot,
  }: {
    key: string;
    route: string;
    moduleRoot?: string;
  }) => {
    const items = await this.client.get<T[]>(`${this.baseUrl}/${key}/inventory/${route}`, {
      params: {
        moduleRoot,
      },
    });
    return {
      count: items?.length,
      total: items?.length,
      items,
    } as AggregationResult<T>;
  };

  protected async exportProfileInventoryAdditionalElements({
    key,
    route,
  }: {
    key: string;
    route: string;
  }) {
    return await this.client.downloadBlob(`${this.baseUrl}/${key}/inventory/${route}/export`);
  }
}
