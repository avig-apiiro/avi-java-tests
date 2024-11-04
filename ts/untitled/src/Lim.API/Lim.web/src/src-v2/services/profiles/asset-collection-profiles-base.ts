import { Inventory, SearchParams } from '@src-v2/services';
import { BaseConsumableProfilesService } from '@src-v2/services/profiles/base-consumable-profiles-service';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { FindingTag, TagOption, TagResponse } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

export interface ConfigurationRecord {
  key: string;
  parentKey?: string;
  name: string;
  hierarchy: { key: string; name: string }[];
}

export abstract class AssetCollectionProfilesBase<
  T extends CodeProfileResponse,
> extends BaseConsumableProfilesService<T> {
  protected inventory: Inventory;

  protected constructor({ apiClient, asyncCache, inventory, application, baseUrl }: StubAny) {
    super({ apiClient, asyncCache, application, baseUrl: `asset-collections/${baseUrl}` });

    this.inventory = inventory;
  }

  searchLeanApplications = async (
    params: Partial<SearchParams>
  ): Promise<AggregationResult<LeanApplication>> =>
    await this.client.search(`${this.baseUrl}/v2/search/lean`, params);

  searchFindingTags = async ({ searchTerm }: { searchTerm?: string } = {}): Promise<FindingTag[]> =>
    await this.client.get(`${this.baseUrl}/finding-tags`, {
      params: { searchTerm },
    });

  getTagsOptions = async (): Promise<TagOption[]> =>
    await this.client.get(`${this.baseUrl}/v2/tagChoices`);

  updateProfileTags = async (key: string, tags: TagResponse[]) => {
    await this.client.post(`${this.baseUrl}/v2/${key}/tags`, tags);
    await this.invalidateTagsFetch({ key });
  };

  protected async invalidateTagsFetch({ key }: StubAny) {
    await Promise.all([
      this.asyncCache.invalidate(this.getProfile, { key }),
      this.asyncCache.invalidateAll(this.getTagsOptions),
    ]);
  }
}
