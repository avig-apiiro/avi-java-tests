import _ from 'lodash';
import {
  formatFilterOption,
  formatRemoteFilterOptions,
} from '@src-v2/components/filters/filter-utils';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { ActiveFiltersData, Filter } from '@src-v2/hooks/use-filters';
import { Analytics } from '@src-v2/services/analytics';
import { ApiClient, SearchParams, transformLegacyFilters } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { AsyncCache } from '@src-v2/services/async-cache';
import { Governance } from '@src-v2/services/governance';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { DevPhase } from '@src-v2/types/enums/dev-phase';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { RiskCategory } from '@src-v2/types/enums/risk-category';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import { CommentTimelineEvent, DueDateChangeTimelineEvent } from '@src-v2/types/inventory-elements';
import { ActionTakenDetails, ActionsTakenSummary } from '@src-v2/types/risks/action-taken-details';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { ApiRiskTriggerSummary } from '@src-v2/types/risks/risk-types/api-risk-trigger-summary';
import { StubAny } from '@src-v2/types/stub-any';
import { downloadFile } from '@src-v2/utils/dom-utils';
import { modify } from '@src-v2/utils/mobx-utils';

export interface FiltersOptionsParams {
  profileType?: string;
  devPhase?: DevPhase;
  pipelineFilters?: boolean;
  profileKey?: string;
}

type GroupingMenuItem = {
  key: string;
  label: string;
};

export interface FunnelFilterDefinition {
  key: string;
  label: string;
  tableFilter: string;
  tableFilterGroup?: string;
  values: string[];
  description?: string;
  isAdditional: boolean;
  disabledReasonMarkdown?: string;
  type?: 'Likelihood' | 'Impact';
}

export interface FunnelDynamicFilterDefinition extends FunnelFilterDefinition {
  isDynamic: true;
  possibleValuesFilterBy: string[];
}

export abstract class Risks {
  protected client: ApiClient;
  protected asyncCache: AsyncCache;
  protected governance: Governance;
  protected analytics: Analytics;
  protected application: Application;

  constructor({
    apiClient,
    asyncCache,
    governance,
    analytics,
    application,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    governance: Governance;
    analytics: Analytics;
    application: Application;
  }) {
    this.client = apiClient;
    this.asyncCache = asyncCache;
    this.governance = governance;
    this.analytics = analytics;
    this.application = application;
  }

  abstract get path(): string;

  async getTrigger({ key }: { key: string }): Promise<RiskTriggerSummaryResponse> {
    const { riskTrigger, profile, exposurePath } = await this.client.get(`risk/${key}`);
    return { ...riskTrigger, profile, exposurePath };
  }

  getTriggerSummaryKeyByTriggerKey = ({ legacyKey, ruleKey }: StubAny): Promise<string> =>
    this.client.get(`risk/legacy/${ruleKey}/${legacyKey}`);

  getGroupingMenuOptions = ({ riskType }: StubAny): Promise<GroupingMenuItem[]> =>
    this.client.get(`risk${riskType ? `/${riskType}` : ''}/groupedByOptions`);

  searchRisks = async (params: StubAny): Promise<AggregationResult<RiskTriggerSummaryResponse>> => {
    const [{ items, ...searchState }, rules] = await Promise.all([
      this.client.search<RiskTriggerSummaryResponse>(this.path ?? 'risk', params),
      this.asyncCache.suspend(this.governance.getRules),
    ]);

    const rulesByKey = _.keyBy(rules, 'key');
    return {
      ...searchState,
      items: items.map((item: StubAny) => ({
        ...item,
        ruleRiskLevel: rulesByKey[item.ruleKey]?.risk,
      })),
    };
  };

  searchGroupingRisks = async (
    params: StubAny
  ): Promise<AggregationResult<RiskTriggerSummaryResponse>> => {
    const [{ items, ...searchState }, rules] = await Promise.all([
      this.client.search<RiskTriggerSummaryResponse>(`${this.path}/grouped`, params),
      this.asyncCache.suspend(this.governance.getRules),
    ]);

    const rulesByKey = _.keyBy(rules, 'key');
    return {
      ...searchState,
      items: items.map((item: StubAny) => ({
        ...item,
        ruleRiskLevel: rulesByKey[item.ruleKey]?.risk,
      })),
    };
  };

  exportRisks = async ({ searchTerm, ...filters }: ActiveFiltersData) => {
    const startTime = Date.now();
    const { headers, data } = await this.client.get(`${this.path ?? 'risk'}/export`, {
      noInterceptor: true,
      responseType: 'blob',
      params: { searchTerm, tableFilterToQuery: transformLegacyFilters(filters) },
    });
    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'text/csv');
    this.analytics.track('Export Clicked', {
      Context: 'Risks',
      'Number of selected items': 'All',
      DownloadTime: (Date.now() - startTime) / 1000,
    });
  };

  searchLocationFilter = ({ searchTerm }: { searchTerm: string }) =>
    this.client
      .get<LegacyFilterGroup[]>('risk/filters/searchLocation', { params: { searchTerm } })
      .then(results => results.filter(optionGroup => optionGroup.count))
      .then(formatRemoteFilterOptions);

  initLocationFilterOptions = async ({
    filterGroupToKeys,
  }: { filterGroupToKeys?: ActiveFiltersData } = {}) => {
    if (
      !Object.values(filterGroupToKeys).some(
        value => typeof value === 'string' || value.values?.length
      )
    ) {
      return Promise.resolve([]);
    }

    const options = await this.client.get('risk/filters/init-search-locations', {
      params: { filterGroupToKeys: transformLegacyFilters(filterGroupToKeys) },
    });
    return options.map(formatFilterOption);
  };

  async searchModuleFilter({
    searchTerm,
    profileType,
    profileKey,
  }: {
    searchTerm: string;
    profileType?: 'ApplicationProfile' | 'RepositoryProfile';
    profileKey?: string;
  }) {
    const remoteFilterOptions = (
      await this.client.get<
        {
          key: string;
          label: string;
          count: number;
          results: StubAny[];
        }[]
      >('modules/filters/searchModule', {
        params: {
          searchTerm,
          profileType,
          profileKey,
        },
      })
    ).filter((optionGroup: StubAny) => optionGroup.count);
    return formatRemoteFilterOptions(remoteFilterOptions);
  }

  initModulesFilterOptions = async ({
    filterGroupToKeys,
  }: { filterGroupToKeys?: Record<string, string[]> } = {}) => {
    const moduleRepositoryAndRoots = Object.values(filterGroupToKeys).flat();
    if (!moduleRepositoryAndRoots.length) {
      return Promise.resolve([]);
    }

    const options = await this.client.get('modules/filters/init-search-modules', {
      params: { moduleRepositoryAndRoots },
    });
    return options.map(formatFilterOption);
  };

  async bulkIgnoreRisks({ riskTriggers, ignoreReasonText, ignoreType }: StubAny) {
    const result = await this.bulkOverrideRisk({
      riskTriggers,
      overrideRiskParams: { ignoreReasonText, ignoreReasonType: ignoreType, isIgnored: true },
    });
    this.asyncCache.invalidateAll(this.getProfileRiskOverview);
    return result;
  }

  bulkAcceptRisks = async ({ riskTriggers, acceptReasonText }: StubAny) => {
    const result = await this.bulkOverrideRisk({
      riskTriggers,
      overrideRiskParams: { acceptReasonText, isAccepted: true },
    });

    this.asyncCache.invalidateAll(this.getProfileRiskOverview);
    return result;
  };

  bulkExportRisks = async (riskTriggers: StubAny, context = 'Risks') => {
    const startTime = Date.now();
    const { headers, data } = await this.client.get(`${this.path ?? 'risk'}/bulk-export`, {
      noInterceptor: true,
      responseType: 'blob',
      params: { triggerKeys: riskTriggers.map((_: StubAny) => _.key) },
    });

    const [, filename] = headers['content-disposition'].match(/filename=([^;]+);/);
    downloadFile(filename, data, 'text/csv');
    this.analytics.track('Export Clicked', {
      Context: context,
      'Number of selected items': riskTriggers.length,
      DownloadTime: (Date.now() - startTime) / 1000,
    });
  };

  modifyActionTimelineItem = (
    data: RiskTriggerSummaryResponse,
    timelineItem: ActionTakenDetails
  ) => {
    const actionsTakenSummaries = data.actionsTakenSummaries ? [...data.actionsTakenSummaries] : [];
    const summaryIndex = _.findIndex(
      actionsTakenSummaries,
      summary => summary.provider === timelineItem.provider
    );
    if (summaryIndex !== -1) {
      actionsTakenSummaries[summaryIndex].items.push(timelineItem);
    } else {
      actionsTakenSummaries.push(new ActionsTakenSummary(timelineItem.provider, [timelineItem]));
    }

    modify(data, { actionsTakenSummaries });
  };

  modifyRiskLevel(data: StubAny, riskLevel: StubAny, riskOverrideData: StubAny) {
    modify(data, { riskStatus: riskLevel, riskOverrideData });
  }

  getFilterOptions = async (params: FiltersOptionsParams): Promise<Filter[]> =>
    await this.client
      .get(`${this.path ?? 'risk'}/filterOptions`, { params })
      .then((options: StubAny) =>
        _.orderBy(options, [
          option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
          'displayName',
        ]).map(item => transformFilterGroups(item))
      );

  bulkOverrideRisk = async ({ riskTriggers, overrideRiskParams: overrideRisk }: StubAny) => {
    const result = await this.client.put('risk/override-risk-status', {
      triggerKeys: riskTriggers.map((_: StubAny) => _.key),
      overrideRisk,
    });

    this.asyncCache.invalidateAll(this.getProfileRiskOverview);
    return result;
  };

  overrideRisksStatus = async ({ risks, overrideRiskStatusData }: StubAny) => {
    const result = await this.client.put('risk/override-risk-status', {
      triggerKeys: risks.map((risk: StubAny) => risk.key),
      overrideRiskStatus: overrideRiskStatusData,
    });
    if (risks.length > 1) {
      this.asyncCache.invalidateAll(this.getProfileRiskOverview);
      this.asyncCache.invalidateAll(this.getTrigger);
    } else if (risks.length === 1) {
      this.asyncCache.invalidate(this.getProfileRiskOverview, { key: risks[0].key });
      this.asyncCache.invalidate(this.getTrigger, { key: risks[0].key });
    }
    this.asyncCache.invalidateAll(this.getOverrideRiskStatusEvents);
    this.asyncCache.invalidateAll(this.searchRisks);
    this.asyncCache.invalidateAll(this.getTotalCount);
    this.asyncCache.invalidateAll(this.getFilteredCount);
    risks.forEach((risk: StubAny) =>
      modify(risk, { riskStatus: overrideRiskStatusData.riskStatus })
    );

    return result;
  };

  overrideRisksLevel = async ({ risks, overrideRiskLevelData }: StubAny) => {
    const result = await this.client.put('risk/overrideRiskLevel', {
      triggerKeys: risks.map((risk: StubAny) => risk.key),
      overrideRiskLevel: overrideRiskLevelData,
    });
    if (risks.length > 1) {
      this.asyncCache.invalidateAll(this.getProfileRiskOverview);
      this.asyncCache.invalidateAll(this.getTrigger);
    } else if (risks.length === 1) {
      this.asyncCache.invalidate(this.getProfileRiskOverview, { key: risks[0].key });
      this.asyncCache.invalidate(this.getTrigger, { key: risks[0].key });
    }
    this.asyncCache.invalidateAll(this.getOverrideRiskLevelEvents);
    this.asyncCache.invalidateAll(this.searchRisks);
    this.asyncCache.invalidateAll(this.getTotalCount);
    this.asyncCache.invalidateAll(this.getFilteredCount);
    risks.forEach((risk: StubAny) => modify(risk, { riskLevel: overrideRiskLevelData.riskLevel }));

    return result;
  };

  getDueDateEvents = ({ key }: { key: string }): Promise<DueDateChangeTimelineEvent[]> => {
    return this.client.get('risk/dueDateEvents', {
      params: {
        key,
      },
      shouldTransformDates: true,
    });
  };

  changeRiskDueDate = async ({
    newDate,
    triggerKeys,
  }: {
    newDate: Date;
    triggerKeys: string[];
  }) => {
    await this.client.put(
      'risk/overrideDueDate',
      {
        newDate,
        triggerKeys,
      },
      { shouldTransformDates: true }
    );
    this.asyncCache.invalidate(this.getDueDateEvents, { key: _.first(triggerKeys) });
  };

  getProfileRiskOverview = async ({ profileKey, profileType, moduleRoot }: StubAny) =>
    await this.client.get(`/risk/riskOverview`, {
      params: {
        profileKey,
        profileType,
        moduleRoot,
      },
    });

  getCommentEvents = ({ key }: { key: string }): Promise<CommentTimelineEvent[]> => {
    return this.client.get('risk/comments', {
      params: {
        key,
      },
    });
  };

  getOverrideRiskLevelEvents = ({ key }: { key: string }): Promise<CommentTimelineEvent[]> => {
    return this.client.get('risk/overrideRiskLevelEvents', {
      params: {
        key,
      },
    });
  };

  getOverrideRiskStatusEvents = ({ key }: { key: string }): Promise<CommentTimelineEvent[]> => {
    return this.client.get('risk/overrideRiskStatusEvents', {
      params: {
        key,
      },
    });
  };

  commentOnRisk = async ({ comment, key }: StubAny) => {
    await this.client.post('risk/commentOnRisk', {
      comment,
      key,
    });
    this.asyncCache.invalidate(this.getCommentEvents, { key });
  };

  searchFunneledRisksCount = async ({
    globalFilters: { searchTerm, ...globalFilters } = {},
    controlledFilters,
    bySeverity = true,
  }: {
    bySeverity?: boolean;
    globalFilters: Record<string, string[]>;
    controlledFilters: FunnelFilterDefinition[];
  }): Promise<Record<string, number>[]> =>
    await this.client.get(`${this.path ?? 'risk'}/funnel/risks-count`, {
      params: {
        body: btoa(
          JSON.stringify({
            searchTerm,
            globalFilters,
            controlledFilters: controlledFilters?.map(({ tableFilter, values }) => ({
              tableFilter,
              values,
            })),
            bySeverity,
          })
        ),
      },
    });

  getFunnelFilters = async (): Promise<FunnelFilterDefinition[]> =>
    await this.client.get(`${this.path ?? 'risk'}/funnel/filterOptions`);

  overrideRiskLevel = async ({
    risk,
    riskLevel,
    description,
  }: {
    risk: { key: string; riskLevel: RiskLevel };
    riskLevel: RiskLevel;
    description?: string;
  }) => {
    await this.client.put('risk/overrideRiskLevel', {
      triggerKeys: [risk.key],
      overrideRiskLevel: {
        riskLevel,
        reason: description ?? '',
      },
    });

    modify(risk, { riskLevel });
    this.asyncCache.invalidate(this.getOverrideRiskLevelEvents, { key: risk.key });
  };

  getTotalCount = async ({
    filters,
    ...params
  }: {
    profileType?: ProfileType;
    profileKey?: string;
    devPhase?: DevPhase;
    pipelinesEntityIds?: string | string[];
  } & Partial<SearchParams>): Promise<number> => {
    return await this.client.get(this.path ? `${this.path}/totalCount` : 'risk/totalCount', {
      params: { ...params, filters: transformLegacyFilters(filters) },
    });
  };

  getFilteredCount = async ({
    filters,
    ...params
  }: {
    profileType?: ProfileType;
    devPhase?: DevPhase;
    pipelinesEntityIds?: string | string[];
  } & Partial<SearchParams>): Promise<number> => {
    return await this.client.get(this.path ? `${this.path}/filteredCount` : 'risk/filteredCount', {
      params: { ...params, tableFilterToQuery: transformLegacyFilters(filters) },
    });
  };
}

export class AllRisks extends Risks {
  get path() {
    return 'risk';
  }

  getFunnelRiskCategoryToGroup = (): Promise<{ [p in keyof typeof RiskCategory]: string }> => {
    return this.client.get(`${this.path}/funnel-risk-groups`);
  };
}

export class SecretsRisks extends Risks {
  get path() {
    return 'risk/secrets';
  }
}

export class ApiRisks extends Risks {
  get path() {
    return 'risk/api';
  }

  async getApiTrigger({ key }: StubAny): Promise<ApiRiskTriggerSummary> {
    const result = await this.client.get<StubAny>(`risk/api/${key}`);
    const { riskTrigger, exposurePath } = result;
    return { ...riskTrigger, exposurePath };
  }
}

export class OssRisks extends Risks {
  get path() {
    return 'risk/oss';
  }
}

export class SupplyChainRisks extends Risks {
  get path() {
    return 'risk/supplyChain';
  }
}

export class SastRisks extends Risks {
  get path() {
    return 'risk/sast';
  }
}

export class ArtifactDependencyFindingsRisks extends Risks {
  get path() {
    return 'risk/artifactDependencyFindings';
  }
}
