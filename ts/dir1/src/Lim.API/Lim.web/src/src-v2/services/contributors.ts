import _ from 'lodash';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups, transformProfileTypeToEndpoint } from '@src-v2/data/transformers';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { Profiles } from '@src-v2/services/profiles';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { EntityType } from '@src-v2/types/enums/entity-type';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { LeanDeveloper, LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';
import { StubAny } from '@src-v2/types/stub-any';
import { LeanApplicationWithPointsOfContact } from '../types/profiles/lean-application';

export class Contributors {
  #client: ApiClient;
  #asyncCache: AsyncCache;
  #profiles: Profiles;

  constructor({
    apiClient,
    asyncCache,
    profiles,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    profiles: Profiles;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#profiles = profiles;
  }

  async getTeam({ key }: { key: string }) {
    const [{ configuration, ...teamData }, { teamTypeDescriptions, serverDescriptions }] =
      await Promise.all([
        this.#client.get<StubAny>(`teams/${key}`),
        this.#asyncCache.suspend(this.getTeamConfiguration),
      ]);

    return {
      ...teamData,
      defaultValues: {
        ...configuration,
        provider: serverDescriptions.find(
          (server: StubAny) => server.value === configuration.providerUrl
        ),
        providerGroup: { label: configuration.groupName, value: configuration.groupId },
        pointsOfContact: await this.groupPointsOfContactsByType(configuration?.pointsOfContact),
        teamType: teamTypeDescriptions.find(
          (type: StubAny) => type.value === configuration.teamType
        ),
      },
    };
  }

  createTeam(data: StubAny) {
    this.#client.put('teams', { ...data, key: data.key ?? crypto.randomUUID() });
  }

  async deleteTeam({ key }: { key: string }) {
    const response = await this.#client.delete(`teams/${key}`);
    this.#asyncCache.invalidateAll(this.#profiles.searchProfiles);
    return response;
  }

  getTeamConfiguration(): Promise<StubAny> {
    return this.#client.get('teams/formConfiguration');
  }

  async searchContributors({
    profileType,
    profileKey,
    ...params
  }: {
    profileType: ProfileType;
    profileKey: string;
  } & SearchParams) {
    const { items, ...searchState } = await this.#client.search(
      `${transformProfileTypeToEndpoint(profileType)}/${profileKey}/developers/search`,
      params
    );

    return {
      ...searchState,
      items,
    };
  }

  async getFilterOptions({ profileType, ...params }: { profileType: ProfileType }) {
    const options = await this.#client.get<StubAny>(
      `${profileType === ProfileType.AssetCollection ? 'asset-collections/applications' : 'repositories'}/developers/filterOptions`,
      { params }
    );

    return _.orderBy(options, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(item => transformFilterGroups(item));
  }

  async getPointsOfContactTypes(): Promise<{ value: string; label: string }[]> {
    const data = await this.#client.get('developers/pointsOfContact/types');
    return Object.entries(data).map(([key, value]) => ({ value: key, label: value?.toString() }));
  }

  async groupPointsOfContactsByType(pointsOfContact: LeanPointOfContact[]) {
    const pointsOfContactTypes = await this.#asyncCache.suspend(this.getPointsOfContactTypes);
    const groupedByJobTitle = _.groupBy(pointsOfContact, 'jobTitle');
    return Object.entries(groupedByJobTitle).map(([jobTitle, contacts]) => ({
      jobTitle: pointsOfContactTypes.find(
        (type: StubAny) => type.value === jobTitle || type.label === jobTitle
      ),
      developer: _.uniqBy(contacts, 'identityKey'),
    }));
  }

  searchGroupOptions(
    { searchTerm, providerUrl }: { searchTerm: string; providerUrl: string },
    apiOptions: StubAny
  ) {
    return this.#client.get('teams/groups/search', {
      ...apiOptions,
      params: { searchTerm, serverUrl: providerUrl },
    });
  }

  getGroupUsers({ groupId, serverUrl }: { groupId: string; serverUrl: string }) {
    return this.#client.get(`teams/groups/${groupId}/users`, { params: { serverUrl } });
  }

  async searchDevelopers(
    searchParams: Partial<SearchParams> = {}
  ): Promise<AggregationResult<LeanDeveloper>> {
    const { items: developers, ...rest } = (await this.#client.search(
      'developers/profiles/search',
      {
        ...searchParams,
        sortBy: searchParams.sortBy ?? 'DisplayName',
        limit: searchParams.limit ?? 20,
      }
    )) as AggregationResult<StubAny>;

    return {
      ...rest,
      items: developers.map(developer => ({
        key: developer.representativeIdentityKeySha,
        identityKey: developer.representativeIdentityKeySha,
        username: developer.displayName,
        avatarUrl: developer.avatarUrl,
      })),
    };
  }

  async getElementLastModifier({
    repositoryKey,
    entityKey,
    entityType,
  }: {
    repositoryKey: string;
    entityKey: string;
    entityType: EntityType;
  }): Promise<LeanDeveloper> {
    if (entityType === EntityType.None) {
      return null;
    }

    return await this.#client.get(
      `repositories/${repositoryKey}/entityProfile/${entityType}/${entityKey}/last-modifier`
    );
  }

  getApplicationsPointsOfContact({
    applicationKeys,
  }: {
    applicationKeys: string[];
  }): Promise<LeanApplicationWithPointsOfContact[]> {
    return applicationKeys?.length
      ? this.#client.get(`assetCollections/profiles/pointsOfContact`, {
          params: { applicationKeys },
        })
      : Promise.resolve([]);
  }
}
