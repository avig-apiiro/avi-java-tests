import _ from 'lodash';
import {
  formatFilterOption,
  formatRemoteFilterOptions,
} from '@src-v2/components/filters/filter-utils';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { ActiveFiltersData, Filter } from '@src-v2/hooks/use-filters';
import ioc from '@src-v2/ioc';
import {
  ApiClient,
  Organization,
  SlaPolicyDefinition,
  transformLegacyFilters,
} from '@src-v2/services';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import {
  MTTRStatItem,
  ManualActionsOverTimeResponse,
  MttrVsSlaStatItem,
  OverviewTopRisksItem,
  RiskLevelsCountByAgeRange,
  RisksStatusOverTimeResponse,
  TopRepositoryItem,
  TopRiskScoreApplicationItem,
  TopRiskScoreRepositoryItem,
  TopRiskScoreTeamItem,
} from '@src-v2/types/overview/overview-responses';
import { StubAny } from '@src-v2/types/stub-any';

const applicationFilterOptionKeys = ['RepositoryKeys', 'DashboardDateRange'];
const repositoryFilterOptionKeys = ['DashboardDateRange'];
const teamsFilterOptionKeys = [
  'RepositoryKeys',
  'DashboardDateRange',
  'OrgTeam',
  'RemoteAssetCollectionKeys',
];

export abstract class BaseOverviewService {
  readonly baseUrl: string;
  private readonly organization: Organization;
  protected client: ApiClient;

  protected constructor({ apiClient, baseUrl, organization }: StubAny) {
    this.organization = organization;
    this.client = apiClient;
    this.baseUrl = baseUrl;
  }

  getTopRisks = ({ filters }: StubAny): Promise<OverviewTopRisksItem[]> =>
    this.client.get(`${this.baseUrl}/top-risks`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });

  getTopRiskyTicketsRisks = ({ filters }: StubAny): Promise<OverviewTopRisksItem[]> => {
    // Hacky solution until BE will support filters for this endpoint
    if (Object.keys(filters)?.length) {
      return Promise.resolve([]);
    }

    return this.client.get(`${this.baseUrl}/risky-issues-count`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  };

  getRiskLevelsCountByAgeRange = ({
    filters,
  }: StubAny): Promise<{ riskLevelCounts: RiskLevelsCountByAgeRange }> => {
    return this.client.get(`${this.baseUrl}/risks-level-count-by-age-range`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  };

  getOpenRisks = ({ filters }: StubAny): Promise<Record<keyof typeof RiskLevel, number>> =>
    this.client.get(`${this.baseUrl}/open-risks-by-level`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });

  getTopRepositories = async ({ filters }: StubAny): Promise<TopRepositoryItem[]> => {
    const topRepositories: TopRepositoryItem[] = await this.client.get(
      `${this.baseUrl}/top-hbi-repos`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );

    return _.orderBy(topRepositories, 'count', 'desc');
  };

  getTopRiskScoreTeams = async ({ filters }: StubAny): Promise<TopRiskScoreTeamItem[]> => {
    const topApplications: TopRiskScoreTeamItem[] = await this.client.get(
      `${this.baseUrl}/top-teams-by-risk-score`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );

    return _.orderBy(topApplications, 'riskScore', 'desc');
  };

  getTopRiskScoreApplications = async ({
    filters,
  }: StubAny): Promise<TopRiskScoreApplicationItem[]> => {
    const topApplications: TopRiskScoreApplicationItem[] = await this.client.get(
      `${this.baseUrl}/top-applications-by-risk-score`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );

    return _.orderBy(topApplications, 'riskScore', 'desc');
  };

  getTopRiskScoreRepositories = async ({
    filters,
  }: StubAny): Promise<TopRiskScoreRepositoryItem[]> => {
    const topRepositories: TopRiskScoreRepositoryItem[] = await this.client.get(
      `${this.baseUrl}/top-repositories-by-risk-score`,
      {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      }
    );

    return _.orderBy(topRepositories, 'riskScore', 'desc');
  };

  getMttrVsSlaStats = async ({
    filters,
    params: profile,
  }: StubAny): Promise<MttrVsSlaStatItem[]> => {
    const [mttrResults, slaPolicy] = await Promise.all([
      this.getMTTRStats({ filters }),
      this.getSlaPolicy(profile),
    ]);

    return mttrResults.map(mttrStat => ({
      mttrStats: mttrStat,
      slaStats: {
        riskLevel: mttrStat.riskLevel,
        slaValue: slaPolicy[mttrStat.riskLevel.toLowerCase() as keyof SlaPolicyDefinition] ?? 0,
      },
    }));
  };

  private getMTTRStats = ({ filters }: StubAny): Promise<MTTRStatItem[]> =>
    this.client
      .get<MTTRStatItem[]>(`${this.baseUrl}/mttr`, {
        params: { filters: transformLegacyFilters(filters) },
        shouldTransformDates: true,
      })
      .then(mttrResults =>
        _.orderBy(mttrResults, result => RiskLevel[result.riskLevel as RiskLevel], 'desc')
      );

  private getSlaPolicy = (profile: StubAny): Promise<SlaPolicyDefinition> => {
    if (profile?.profileType === 'applications') {
      return this.getApplicationSlaPolicy(profile.profileKey);
    }
    if (profile?.profileType === 'teams') {
      return this.getTeamSlaPolicy(profile.profileKey);
    }
    return this.getOrganizationSlaPolicy();
  };

  private getApplicationSlaPolicy = (profileKey: string): Promise<SlaPolicyDefinition> =>
    ioc.applicationProfilesV2
      .getProfile({ key: profileKey })
      .then(profileData => this.transformSlaData(profileData.slaProfileResponse.sla));

  private getTeamSlaPolicy = (profileKey: string): Promise<SlaPolicyDefinition> =>
    ioc.orgTeamProfiles
      .getProfile({ key: profileKey })
      .then(profileData => this.transformSlaData(profileData.slaProfileResponse.sla));

  private getOrganizationSlaPolicy = (): Promise<SlaPolicyDefinition> =>
    this.organization.getRiskSLASettings().then(this.normalizeSlaPolicyDefinition);

  private transformSlaData = (data: StubAny): SlaPolicyDefinition =>
    data.reduce((acc: StubAny, item: StubAny) => {
      acc[item.riskLevel.toLowerCase()] = item.slaDays;
      return acc;
    }, {} as SlaPolicyDefinition);

  private normalizeSlaPolicyDefinition = (policy: SlaPolicyDefinition): SlaPolicyDefinition => ({
    critical: policy.critical ?? 0,
    high: policy.high ?? 0,
    medium: policy.medium ?? 0,
    low: policy.low ?? 0,
  });

  getRisksStatus = ({ filters }: StubAny): Promise<RisksStatusOverTimeResponse> =>
    this.client.get(`${this.baseUrl}/risks-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });

  getManualRemediationActions = ({ filters }: StubAny): Promise<ManualActionsOverTimeResponse> =>
    this.client.get(`${this.baseUrl}/manual-actions-over-time`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });

  getFilterOptions = async (): Promise<Filter[]> => {
    const filterGroups: LegacyFilterGroup[] = await this.client.get(
      'overview-dashboard/filters/options'
    );

    return _.orderBy(filterGroups, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(transformFilterGroups);
  };
  moduleBasedAppExist = ({ filters }: StubAny): Promise<boolean> =>
    this.client.get(`${this.baseUrl}/has-mono-repo-app`, {
      params: { filters: transformLegacyFilters(filters) },
    });

  searchRepositories = async ({
    searchTerm,
    assetCollectionKey,
  }: {
    searchTerm: string;
    assetCollectionKey?: string;
  }) => {
    const repositoriesGroups = await this.client.get(`${this.baseUrl}/filters/searchRepositories`, {
      params: { searchTerm, assetCollectionKey },
    });
    return formatRemoteFilterOptions(repositoriesGroups);
  };

  initRepositoriesFilterOptions = async ({
    filterGroupToKeys,
  }: { filterGroupToKeys?: ActiveFiltersData } = {}) => {
    return await this.initRemoteFilterOption('repositories', filterGroupToKeys);
  };

  searchApplications = async ({
    searchTerm,
    orgTeamKey,
  }: {
    searchTerm: string;
    orgTeamKey: string;
  }) => {
    const applicationsGroups = await this.client.get(`${this.baseUrl}/filters/searchApplications`, {
      params: { searchTerm, orgTeamKey },
    });
    return formatRemoteFilterOptions(applicationsGroups);
  };

  initApplicationsFilterOptions = async ({
    filterGroupToKeys,
  }: { filterGroupToKeys?: ActiveFiltersData } = {}) => {
    return await this.initRemoteFilterOption('applications', filterGroupToKeys);
  };

  getApplicationFilterOptions = async (): Promise<StubAny[]> => {
    const filters = await this.getFilterOptions();
    return filters.filter(filterOption => applicationFilterOptionKeys.includes(filterOption.key));
  };

  getRepositoryFilterOptions = async (): Promise<StubAny[]> => {
    const filters = await this.getFilterOptions();
    return filters.filter(filterOption => repositoryFilterOptionKeys.includes(filterOption.key));
  };

  getTeamFilterOptions = async (): Promise<StubAny[]> => {
    const filters = await this.getFilterOptions();
    return filters.filter(filterOption => teamsFilterOptionKeys.includes(filterOption.key));
  };

  private async initRemoteFilterOption(
    filter: 'repositories' | 'applications',
    filterGroupToKeys: ActiveFiltersData
  ): Promise<StubAny> {
    const keys = Object.values(filterGroupToKeys).flatMap(filter =>
      typeof filter === 'string' ? filter : filter.values
    );

    if (!keys.length) {
      return [];
    }

    const options = await this.client.get<StubAny[]>(
      `${this.baseUrl}/filters/init-search-${filter}`,
      {
        params: { keys },
      }
    );
    return options.map(formatFilterOption);
  }
}
