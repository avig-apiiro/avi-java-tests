import { ApiClient } from '@src-v2/services';
import { TagOption } from '@src-v2/types/profiles/tags/profile-tag';
import { StubAny } from '@src-v2/types/stub-any';

export class ApplicationGroupProfiles {
  #client: ApiClient;

  constructor({ apiClient }: StubAny) {
    this.#client = apiClient;
  }

  getApplicationGroupTagsOptions = async (): Promise<TagOption[]> =>
    await this.#client.get(`applicationGroups/tag-options`);
}
