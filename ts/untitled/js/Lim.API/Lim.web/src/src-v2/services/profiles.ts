import _ from 'lodash';
import { transformFilterGroups, transformProfileTypeToEndpoint } from '@src-v2/data/transformers';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { AsyncCache } from '@src-v2/services/async-cache';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { RelatedEntityProfile } from '@src-v2/types/profiles/related-entity-profile';
import { RepositoryProjectProfile } from '@src-v2/types/profiles/repository-project-profile';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';
import { uri } from '@src-v2/utils/template-literals';

export class Profiles {
  static validProfileTypes = [
    // 'organization',
    'assetCollections',
    'repositories',
    'applicationGroups',
    'developers',
    'teams',
    'clusters',
    'pipelines',
    'OrgTeamProfile',
    'asset-collections/applications',
    'asset-collections/org-teams',
  ];

  #client: ApiClient;
  #asyncCache: AsyncCache;
  #application: Application;

  constructor({
    apiClient,
    asyncCache,
    application,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    application: Application;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#application = application;
  }

  searchProfiles(
    { profileType, sort = 'DisplayName', ...params }: StubAny,
    apiOptions?: StubAny
  ): Promise<AggregationResult<{ profileType: string; sort?: string }>> {
    Profiles.#validateProfileType(profileType);
    return this.#client.search(`${profileType}/profiles/search`, { ...params, sort }, apiOptions);
  }

  async searchRepositoryProjectProfiles({
    repositoryKey,
    ...params
  }: { repositoryKey: string } & SearchParams): Promise<
    AggregationResult<RelatedEntityProfile<ProjectProfile, RepositoryProjectProfile>>
  > {
    return await this.#client.search(`repositories/${repositoryKey}/projects/search`, params);
  }

  async getSortOptions({ profileType }: { profileType: string }) {
    Profiles.#validateProfileType(profileType);
    const sortOptions = await this.#client.get<StubAny[]>(`${profileType}/profiles/sortOptions`);
    return sortOptions
      .map(option => ({ key: option.name, label: option.displayName }))
      .filter(option => {
        if (
          option.key === 'RiskScore' &&
          !this.#application?.isFeatureEnabled(FeatureFlag.RiskScore)
        ) {
          return false;
        }
        return !(
          option.key === 'ProfileRiskLevel' &&
          this.#application?.isFeatureEnabled(FeatureFlag.RiskScore)
        );
      });
  }

  async getAssetCollectionProfile({ key }: { key: string }) {
    return await this.#client.get(`assetCollections/${key}/profile`);
  }

  async getRepositoryProfile({ key }: { key: string }) {
    return await this.#client.get(`repositories/${key}/profile`);
  }

  async getProjectProfile({ key }: { key: string }) {
    return await this.#client.get(`projects/${key}/profile`);
  }

  async getRepositoryApplications({
    key,
    ...params
  }: SearchParams & {
    key: string;
  }): Promise<AggregationResult<LeanApplication>> {
    return await this.#client.search(`repositories/v2/${key}/applications/search`, params);
  }

  async getRepositoryModuleProfile({
    repositoryKey,
    moduleKey,
  }: {
    repositoryKey: string;
    moduleKey: string;
  }): Promise<{
    module: CodeModule;
    repositoryProfile: LeanConsumableProfile;
    applications: LeanApplication[];
    orgTeams: LeanOrgTeamWithPointsOfContact[];
  }> {
    return await this.#client.get(
      `repositories/v2/${repositoryKey}/profile/module/${encodeURIComponent(moduleKey)}`
    );
  }

  async getFilterOptions({ profileType }: StubAny): Promise<StubAny[]> {
    Profiles.#validateProfileType(profileType);
    const [filterGroups, customFilters] = await Promise.all([
      this.#client.get<LegacyFilterGroup[]>(`${profileType}/profiles/filterOptions`),
      this.#client.get<StubAny[]>(`${profileType}/profiles/customFilters`).then(Object.values),
    ]);

    function populateFilters(filters: StubAny) {
      const groups = filters.reduce((filters: StubAny, filter: StubAny) => {
        if (filter.isGrouped) {
          filter.filterOptions.forEach(({ group, ...option }: StubAny) => {
            if (!filters[group]) {
              filters[group] = {
                ...filter,
                displayName: `${filter.displayName} - ${group}`,
                filterOptions: [],
              };
            }
            filters[group].filterOptions.push({
              ...filter,
              ...option,
              isGrouped: false,
            });
          });
        } else {
          filters[filter.name] = filter;
        }
        return filters;
      }, {});
      return Object.values(groups);
    }

    // TODO move mapping & sorting to the server
    return filterGroups?.length
      ? createCustomFiltersGroup().concat(
          _.orderBy(populateFilters(filterGroups), ['sortOrder', 'displayName']).map(
            transformFilterGroups
          )
        )
      : [];

    function createCustomFiltersGroup(): StubAny[] {
      return customFilters.length
        ? [
            {
              key: 'customFilters',
              type: 'custom',
              title: 'Custom Filters',
              options: customFilters.map(option => ({
                key: option.key,
                title: option.name,
                value: Object.entries(option.filters).flatMap(([key, values]) =>
                  // @ts-expect-error
                  values.map(value => ({
                    key,
                    value,
                    multiple: true,
                  }))
                ),
              })),
            },
          ]
        : [];
    }
  }

  async saveCustomFilter({ profileType, title, value: { searchTerm, ...filters } }: StubAny) {
    Profiles.#validateProfileType(profileType);
    await this.#client.post(`${profileType}/profiles/customFilters`, {
      name: title,
      tableFilterToQuery: filters,
      searchTerm,
    });
    this.#asyncCache.invalidate(this.getFilterOptions, { profileType });
  }

  async deleteCustomFilter({ profileType, key }: StubAny) {
    Profiles.#validateProfileType(profileType);
    await this.#client.delete(`${profileType}/profiles/customFilters/${key}`);
    this.#asyncCache.invalidate(this.getFilterOptions, { profileType });
  }

  async downloadProfileSBOM({
    profileKey,
    profileType,
  }: {
    profileKey: string;
    profileType: ProfileType;
  }) {
    const endpoint = transformProfileTypeToEndpoint(profileType);
    Profiles.#validateProfileType(endpoint);

    return await this.#client.get(`${endpoint}/${profileKey}/sbom`, {
      params: { format: 'cyclonedx' },
      noInterceptor: true,
    });
  }

  getProfileBuilds({ profileKey, profileType }: StubAny) {
    Profiles.#validateProfileType(transformProfileTypeToEndpoint(profileType));
    return this.#client.get('singleCommitScan/builds', {
      params: { key: profileKey, type: profileType },
    });
  }

  async getProfilePullRequests({ profileKey, profileType }: StubAny) {
    Profiles.#validateProfileType(transformProfileTypeToEndpoint(profileType));
    const pullRequests = await this.#client.get('releases/pullRequests', {
      params: { key: profileKey, type: profileType },
    });
    return this.#orderedPullRequests(pullRequests);
  }

  static #validateProfileType(profileType: StubAny) {
    if (!Profiles.validProfileTypes.includes(profileType)) {
      throw Error(`Unknown profile type "${profileType}"`);
    }
  }

  // Old repositories code

  static fillMissingContributorsData(data: StubAny) {
    return _.defaultsDeep(
      {
        linkTo: 'contributors',
        recentlyActive: {
          linkTo: makeUrl('contributors', {
            filters: JSON.stringify({ booleanFilters: ['IsActiveDeveloper'], listFilters: {} }),
          }),
        },
        recentlyJoined: {
          linkTo: makeUrl('contributors', {
            filters: JSON.stringify({ booleanFilters: ['IsNew'], listFilters: {} }),
          }),
        },
        securityRelated: {
          linkTo: makeUrl('contributors', {
            filters: JSON.stringify({ booleanFilters: ['ContributedSecurity'], listFilters: {} }),
          }),
        },
      },
      data.contributors
    );
  }

  async createApplicationGroup(data: StubAny) {
    await this.#client.put('applicationGroups', { ...data, key: data.key ?? crypto.randomUUID() });
    this.#asyncCache.invalidateAll(this.searchProfiles);
  }

  async createApplicationGroupV2(data: StubAny) {
    await this.#client.put('applicationGroups/v2', {
      ...data,
      key: data.key ?? crypto.randomUUID(),
    });
    this.#asyncCache.invalidateAll(this.searchProfiles);
  }

  getApplicationGroup({ key }: StubAny) {
    return this.#client.get(`applicationGroups/${key}`);
  }

  async deleteApplicationGroup({ key }: StubAny) {
    const response = await this.#client.delete(`applicationGroups/${key}`);
    this.#asyncCache.invalidateAll(this.searchProfiles);
    return response;
  }

  getGithubProjectLabels({ projectKey }: StubAny) {
    return this.#client.get(uri`projects/${projectKey}/labels`);
  }

  #orderedPullRequests(pullRequests: StubAny) {
    return _.orderBy(
      pullRequests,
      [
        pr => pr.combinedMaterialChangesRiskLevel === 'Critical',
        pr => pr.combinedMaterialChangesRiskLevel === 'High',
        pr => pr.combinedMaterialChangesRiskLevel === 'Medium',
        pr => pr.combinedMaterialChangesRiskLevel === 'Low',
        pr => pr.status === 'InProgress',
        pr => pr.pullRequestId,
      ],
      ['desc', 'desc', 'desc', 'desc', 'desc', 'desc']
    );
  }
}
