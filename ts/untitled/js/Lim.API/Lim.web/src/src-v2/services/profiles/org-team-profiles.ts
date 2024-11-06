import _ from 'lodash';
import { PointsOfContactOptions } from '@src-v2/containers/profiles/points-of-contacts-fields';
import { SearchParams } from '@src-v2/services';
import {
  AssetCollectionProfilesBase,
  ConfigurationRecord,
} from '@src-v2/services/profiles/asset-collection-profiles-base';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import {
  FlatOrgTeamConfiguration,
  OrgTeamConfiguration,
} from '@src-v2/types/profiles/org-team-configuration';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';
import { StubAny } from '@src-v2/types/stub-any';
import { OrgTeamChannelResponse } from '@src-v2/types/team-channel-response';
import { OrgTeamProjectResponse } from '@src-v2/types/team-project-response';
import { entries } from '@src-v2/utils/ts-utils';

export class OrgTeamProfiles extends AssetCollectionProfilesBase<OrganizationTeamProfileResponse> {
  constructor({ apiClient, asyncCache, application, inventory }: StubAny) {
    super({
      apiClient,
      asyncCache,
      application,
      inventory,
      baseUrl: OrganizationTeamProfileResponse.profileType,
    });
  }

  searchProfiles = async (
    searchParams: SearchParams,
    apiOptions?: any
  ): Promise<AggregationResult<OrganizationTeamProfileResponse>> =>
    await this.client.search(
      `${this.baseUrl}/v2/profiles/search`,
      {
        ...searchParams,
        sort: searchParams.sort ?? 'DisplayName',
      },
      apiOptions
    );

  async getTeamHierarchyChart(): Promise<ConfigurationRecord[]> {
    const chart: ConfigurationRecord[] = await this.client.get(`${this.baseUrl}/chart`);
    return _.orderBy(chart, record => [...record.hierarchy.map(parent => parent.name)].join(' / '));
  }

  async getTeamPointsOfContactTypes(): Promise<{ value: string; label: string }[]> {
    const typesDictionary: Record<keyof typeof PointsOfContactOptions, string> =
      await this.client.get(`${this.baseUrl}/points-of-contact/types`);

    return entries(typesDictionary).map(([value, label]) => ({ value, label }));
  }

  async getEnrichedProfile({ key }: { key: string }): Promise<OrgTeamConfiguration> {
    return key ? await this.client.get(`${this.baseUrl}/v2/configuration/${key}`) : null;
  }

  async getMaxRiskScore(): Promise<number> {
    return await this.client.get(`risk-score/max-risk-score-team`);
  }

  async upsert(data: FlatOrgTeamConfiguration) {
    await this.client.put(`${this.baseUrl}/configuration/${data.key}`, data, {
      params: { suggestionBase: false },
    });

    await Promise.all([
      this.asyncCache.invalidate(this.getEnrichedProfile, { key: data.key }),
      this.asyncCache.invalidate(this.getProfile, { key: data.key }),
      this.asyncCache.invalidateAll(this.searchProfiles),
      this.asyncCache.invalidateAll(this.inventory.searchInventoryData),
      this.asyncCache.invalidateAll(this.getTeamHierarchyChart),
      this.invalidateTagsFetch({ key: data.key }),
    ]);
  }

  async deleteProfile({ key }: { key: string }) {
    await this.client.delete(`${this.baseUrl}/configuration/${key}`);

    this.asyncCache.invalidateAll(this.searchProfiles);
    this.asyncCache.invalidateAll(this.getTeamHierarchyChart);
  }

  getTeamApplications(
    params: SearchParams & { key: string }
  ): Promise<AggregationResult<LeanApplication>> {
    return this.client.search(`${this.baseUrl}/${params.key}/applications/search`, params);
  }

  async getTeamsCommunicationChannelOptions({
    keys,
    provider,
  }: {
    keys: string[];
    provider: ProviderGroup;
  }): Promise<OrgTeamChannelResponse[]> {
    if (!keys?.length) {
      return [];
    }

    return await this.client.get(`${this.baseUrl}/team-channels`, {
      params: { teamKeys: keys, provider },
    });
  }

  async getTeamsCommunicationProjectOptions({
    keys,
    provider,
  }: {
    keys: string[];
    provider: ProviderGroup;
  }): Promise<OrgTeamProjectResponse[]> {
    if (!keys?.length) {
      return [];
    }

    return await this.client.get(`${this.baseUrl}/team-projects`, {
      params: { teamKeys: keys, provider },
    });
  }
}
