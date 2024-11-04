import { BaseOverviewService } from '@src-v2/services/overview/base-overview-service';
import { StubAny } from '@src-v2/types/stub-any';

export class SastOverview extends BaseOverviewService {
  constructor({ apiClient, organization }: StubAny) {
    super({ apiClient, organization, baseUrl: 'sast-dashboard' });
  }
}
