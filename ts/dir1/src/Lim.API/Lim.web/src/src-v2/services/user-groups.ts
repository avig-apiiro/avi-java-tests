import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StubAny } from '@src-v2/types/stub-any';

interface ConsumableItem {
  key: string;
  name: string;
  description: string;
  isAdminBySelf: boolean;
  adminsCount: number;
  membersCount: number;
  rolesCount: number;
}

export class UserGroups {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  async getUserGroup({ key }: { key: string }) {
    return await this.#client.get(`roleGroups/${key}`);
  }

  async deleteUserGroup(key: string) {
    return await this.#client.delete(`roleGroups/${key}`);
  }

  async saveUserGroup(data: StubAny) {
    return await this.#client.post('roleGroups', data);
  }

  getApiiroUserGroups(params: {
    searchTerm?: string;
    pageNumber?: number;
    limit?: number;
  }): Promise<AggregationResult<ConsumableItem>> {
    return this.#client.search('roleGroups/search', params);
  }

  invalidateGroups() {
    this.#asyncCache.invalidateAll(this.getApiiroUserGroups);
  }

  invalidateEditGroup() {
    this.#asyncCache.invalidateAll(this.getUserGroup);
  }
}
