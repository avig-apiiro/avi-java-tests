import _ from 'lodash';
import { transformLegacyFilters } from '@src-v2/services';
import { BaseOverviewService } from '@src-v2/services/overview/base-overview-service';
import {
  PatternedSecretsResult,
  ProviderToValidSecrets,
} from '@src-v2/types/overview/secrets-overview-responses';
import { StubAny } from '@src-v2/types/stub-any';

export class SecretsOverview extends BaseOverviewService {
  constructor({ apiClient, organization }: StubAny) {
    super({ apiClient, organization, baseUrl: 'secrets-dashboard' });
  }

  async getValidSecrets({
    filters,
    itemsCountToShow = 5,
  }: {
    filters?: StubAny;
    itemsCountToShow?: number;
  }): Promise<ProviderToValidSecrets[]> {
    const items = _.orderBy<ProviderToValidSecrets>(
      await this.client.get(`${this.baseUrl}/valid-secrets`, {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }),
      'count',
      'desc'
    );

    if (items.length <= itemsCountToShow) {
      return items;
    }

    const otherItems = items.splice(itemsCountToShow - 1);
    return [
      ...items,
      {
        count: _.sumBy(otherItems, 'count'),
        provider: 'Other',
        data: otherItems,
      },
    ] as ProviderToValidSecrets[];
  }

  getPatternedSecrets = ({ filters }: StubAny): Promise<PatternedSecretsResult[]> =>
    this.client.get(`${this.baseUrl}/patterned-secrets`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
}
