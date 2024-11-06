import { ApiClient } from '@src-v2/services/api-client';
import { Provider } from '@src-v2/types/enums/provider';
import { StubAny } from '@src-v2/types/stub-any';
import { AsyncCache } from './async-cache';

export class ScaConfiguration {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  getConfiguration(): Promise<Record<'providersPriority', Provider[]>> {
    return this.#client.get('configuration/sca');
  }

  getAvailableServerProviders(): Promise<Provider[]> {
    return this.#client.get('servers/v2/sca-servers');
  }

  async updatePriorityConfiguration(priorities: string[]): Promise<StubAny> {
    await this.#client.put('configuration/sca-providers-priority', priorities);
    this.#asyncCache.invalidateAll(this.getAvailableServerProviders);
    this.#asyncCache.invalidateAll(this.getConfiguration);
  }
}
