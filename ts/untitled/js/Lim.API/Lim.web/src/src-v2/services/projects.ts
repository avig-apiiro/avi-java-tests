import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Provider } from '@src-v2/types/enums/provider';
import { LeanConsumable } from '@src-v2/types/profiles/lean-consumable';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { StubAny } from '@src-v2/types/stub-any';

interface ProjectUser {
  key: string;
  email: string;
  displayName: string;
}

interface IssueSummary {
  id: string;
  key: string;
  summary: string;
}

export class Projects {
  #client: ApiClient;

  constructor({ apiClient }: StubAny) {
    this.#client = apiClient;
  }

  searchUsers({ projectKey, ...params }: { projectKey: string } & Partial<SearchParams>) {
    return this.#client.get<ProjectUser[]>(`/projects/${projectKey}/users/search`, { params });
  }

  searchIssues({
    projectKey,
    ...params
  }: {
    projectKey: string;
    searchTerm?: string;
    specificIssueTypes?: string[];
    isParentSearch?: boolean;
    issueType?: string;
  }) {
    return this.#client.get<IssueSummary[]>(`/projects/${projectKey}/issues/search`, {
      params,
    });
  }

  // This endpoint should replace both `workflow.getMonitoredTicketingProjects`
  // and `ticketingIssues.getMonitoredProjects` in the future

  searchMonitoredProjects({
    provider,
    ...searchParams
  }: {
    provider: Provider;
  } & Partial<SearchParams>): Promise<AggregationResult<ProjectProfile>> {
    return this.#client.search(`/projects/v2/${provider}/search`, searchParams);
  }

  searchLeanProjects = async (
    params: Pick<SearchParams, 'limit' | 'searchTerm' | 'pageNumber'>
  ): Promise<AggregationResult<LeanConsumable>> => {
    return await this.#client.search('projects/v2/search/lean', params);
  };
}
