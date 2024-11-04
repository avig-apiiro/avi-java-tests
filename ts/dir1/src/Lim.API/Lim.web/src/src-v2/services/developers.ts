import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { DeveloperProfileResponse } from '@src-v2/types/profiles/developer-profile-response';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';

export class Developers {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  async getDeveloperProfiles({ keys = [] }: { keys: string[] }) {
    if (!keys.length) {
      return [];
    }

    return await Promise.all(
      keys.map(key => this.#asyncCache.suspend(this.getDeveloperProfile, { key }))
    );
  }

  async getDeveloperProfile({ key }: { key: string }) {
    try {
      return await this.#client.get(`developers/byIdentity/${key}`);
    } catch (exception) {
      if (exception.response?.status === 404) {
        return null;
      }
      throw exception;
    }
  }

  async getLeanDeveloperProfile({ key }: { key: string }): Promise<LeanDeveloper> {
    if (!key) {
      return null;
    }
    return await this.#client.get(`developers/v2/lean/${key}`);
  }

  async getDeveloperProfileResponse({ key }: { key: string }): Promise<DeveloperProfileResponse> {
    return await this.#client.get(`developers/v2/${key}`);
  }
}
