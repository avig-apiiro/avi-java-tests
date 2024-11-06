import { ActiveFiltersData } from '@src-v2/hooks/use-filters';
import { transformLegacyFilters } from '@src-v2/services';
import { BaseOverviewService } from '@src-v2/services/overview/base-overview-service';
import { BusinessImpactAbbreviation } from '@src-v2/types/enums/business-impact';
import {
  AppsRiskScoreResponse,
  CommitsOverTimeResponse,
  PullRequestsOverTimeResponse,
  RiskScoreTrendResponse,
  SlaBreachesResponse,
  WorkflowActionsOverTimeResponse,
} from '@src-v2/types/overview/overview-responses';
import { StubAny } from '@src-v2/types/stub-any';

function transformBusinessImpact(data: AppsRiskScoreResponse[]): AppsRiskScoreResponse[] {
  return data.map(item => {
    const businessImpactKey =
      item.businessImpact.toLowerCase() as keyof typeof BusinessImpactAbbreviation;

    return {
      ...item,
      businessImpact: BusinessImpactAbbreviation[businessImpactKey],
    };
  });
}

export class Overview extends BaseOverviewService {
  constructor({ apiClient, organization }: StubAny) {
    super({ apiClient, baseUrl: 'overview-dashboard', organization });
  }

  getPullRequestsOverTime({ filters }: StubAny): Promise<PullRequestsOverTimeResponse> {
    return this.client.get(`${this.baseUrl}/prs-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }

  async getAppsCountByBusinessImpactAndRiskScore({
    filters,
  }: {
    filters: ActiveFiltersData;
  }): Promise<AppsRiskScoreResponse[]> {
    const response = await this.client.get<AppsRiskScoreResponse[]>(
      `${this.baseUrl}/risk-score-heatmap`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );
    return transformBusinessImpact(response);
  }

  getRiskyCommitsOverTime({ filters }: { filters: StubAny }): Promise<CommitsOverTimeResponse> {
    return this.client.get(`${this.baseUrl}/commits-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }

  getRiskScoreTrend({ filters }: StubAny): Promise<RiskScoreTrendResponse> {
    return this.client.get('/risk-score/trend', {
      params: { filters: transformLegacyFilters(filters) },
    });
  }

  getCoverageSummary({ filters }: StubAny) {
    return this.client.get(`${this.baseUrl}/coverage-summary`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }

  getWorkflowRemediationActions({ filters }: StubAny): Promise<WorkflowActionsOverTimeResponse> {
    return this.client.get(`${this.baseUrl}/workflow-actions-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }

  async hasPRAppm(): Promise<boolean> {
    return await this.client.get(`${this.baseUrl}/has-pr-app`);
  }

  getSLABreachesByRiskLevel({ filters }: StubAny): Promise<SlaBreachesResponse> {
    return this.client.get(`${this.baseUrl}/sla-breach`, {
      shouldTransformDates: true,
      params: { filters: transformLegacyFilters(filters) },
    });
  }
}
