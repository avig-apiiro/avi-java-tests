import { ApiClient } from '@src-v2/services/api-client';
import { SecretsData } from '@src-v2/types/secrets-data';
import { StubAny } from '@src-v2/types/stub-any';

export class SecretsService {
  #client: ApiClient;

  constructor({ apiClient }: StubAny) {
    this.#client = apiClient;
  }

  async SecretsFromFile({
    fileContents,
    filePath,
  }: {
    fileContents: string;
    filePath: string;
  }): Promise<SecretsData> {
    return await this.#client.post(`secrets/detector`, {
      FileContents: fileContents,
      FilePath: filePath,
    });
  }
}
