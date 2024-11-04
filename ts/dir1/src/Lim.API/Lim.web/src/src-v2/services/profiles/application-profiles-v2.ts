import { FunnelFilterDefinition, transformLegacyFilters } from '@src-v2/services';
import { AssetCollectionProfilesBase } from '@src-v2/services/profiles/asset-collection-profiles-base';
import { AppCreationOptions } from '@src-v2/types/app-creation-options';
import {
  ApplicationProfileResponse,
  EnrichedApplicationConfigurationResponse,
  FlatApplicationProfile,
} from '@src-v2/types/profiles/application-profile-response';
import { TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

// TODO: rename this class once we handle `./application-profiles.ts`
export class ApplicationProfilesV2 extends AssetCollectionProfilesBase<ApplicationProfileResponse> {
  constructor({ apiClient, asyncCache, application, inventory }: StubAny) {
    super({
      apiClient,
      asyncCache,
      application,
      inventory,
      baseUrl: ApplicationProfileResponse.profileType,
    });
  }

  async getEnrichedProfile({
    key,
  }: {
    key: string;
  }): Promise<EnrichedApplicationConfigurationResponse> {
    return key ? await this.client.get(`${this.baseUrl}/v2/configuration/${key}`) : null;
  }

  getAllFlatApplicationTags = async (): Promise<TagResponse[]> =>
    await this.client.get(`${this.baseUrl}/all-tags`);

  getConfigurationOptions = async (): Promise<AppCreationOptions> => {
    return await this.client.get('assetCollections/configuration/options');
  };

  getFunnelFilters = async (): Promise<FunnelFilterDefinition[]> => {
    return await this.client.get(`${this.baseUrl}/funnel/filterOptions`);
  };

  getMaxRiskScore = async (): Promise<number> => {
    return await this.client.get(`risk-score/max-risk-score-app`);
  };

  searchFunneledApplicationsCount = async ({
    globalFilters: { searchTerm, ...globalFilters } = {},
    controlledFilters,
  }: {
    globalFilters: Record<string, string[]>;
    controlledFilters: FunnelFilterDefinition[];
  }): Promise<Record<string, number>[]> =>
    await this.client.get(`${this.baseUrl}/funnel/apps-count`, {
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

  upsert = async (configuration: FlatApplicationProfile) => {
    const { key } = configuration;
    await this.client.put(`${this.baseUrl}/configuration/${key}`, configuration);

    await Promise.all([
      this.asyncCache.invalidate(this.getProfile, { key }),
      this.asyncCache.invalidate(this.getEnrichedProfile, { key }),
      this.asyncCache.invalidateAll(this.searchProfiles),
      this.asyncCache.invalidateAll(this.inventory.searchInventoryData),
      this.asyncCache.invalidateAll(this.getAllFlatApplicationTags),
      this.invalidateTagsFetch({ key }),
    ]);
  };
}
