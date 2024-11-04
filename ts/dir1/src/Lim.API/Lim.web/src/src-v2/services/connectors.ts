import _ from 'lodash';
import { includesValue } from '@src-v2/components/filters/menu-control/filters-menu';
import { SubType } from '@src-v2/containers/connectors/connections/catalog/connectors-provider-layouts';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { MonitorStatus } from '@src-v2/data/monitor-status';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { Filter } from '@src-v2/hooks/use-filters';
import { Analytics } from '@src-v2/services/analytics';
import { ApiClient } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { AsyncCache } from '@src-v2/services/async-cache';
import { SearchLogType } from '@src-v2/services/audit-log';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderRepositoryDataType } from '@src-v2/types/multi-branch';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ProviderType } from '@src-v2/types/providers/provider-type';
import { StubAny } from '@src-v2/types/stub-any';
import { modify } from '@src-v2/utils/mobx-utils';
import { uri } from '@src-v2/utils/template-literals';

export type ArtifactType = {
  name: string;
  packageType: string;
  description: string;
  lastCandidateByComponentsFullRefresh: string;
  key: string;
  id: string;
  syncSequence: number;
  createdAt: string;
  nameLower: string;
  type: string;
  serverUrl: string;
  server: Connection;
  providerExtensionData: any;
  url: string;
  isMonitored: boolean;
  isNotMonitored: boolean;
  isIgnored: boolean;
  monitorStatus: string;
  monitorStatusIntValue: number;
  lastMonitoringChangeTimestamp: string;
  ignoredBy: null;
  ignoreReason: null;
  relevancyStatus: string;
  interestScore: number;
  isPrivate: null;
  isPublic: boolean;
  isArchived: boolean;
  isNotArchived: boolean;
  shouldForceRefresh: boolean;
  consumableType: string;
};
export type SummaryType = {
  isRelated: boolean;
  key: string;
  label: string;
  monitored: number;
  total: number;
};

export class Connectors {
  #client: ApiClient;
  #asyncCache: AsyncCache;
  #application: Application;
  #analytics: Analytics;

  constructor({
    apiClient,
    asyncCache,
    application,
    analytics,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    application: Application;
    analytics: Analytics;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#application = application;
    this.#analytics = analytics;
  }

  async createServer(serverData: StubAny) {
    const response = await this.#client.post('servers', serverData);
    await this.#application.fetchIntegrations();
    this.#asyncCache.invalidateAll(this.getProviderGroups);
    this.#asyncCache.invalidateAll(this.getProviderTypes);
    return response;
  }

  async updateServer(serverData: StubAny) {
    const response = await this.#client.put(uri`servers/${serverData.url}`, serverData);
    this.#asyncCache.invalidateAll(this.getProviderTypes);
    this.#asyncCache.invalidateAll(this.getConnection);
    return response;
  }

  async deleteServer(serverUrl: StubAny) {
    const response = await this.#client.delete(uri`servers/${serverUrl}`);
    await this.#application.fetchIntegrations();
    this.#asyncCache.invalidateAll(this.getProviderGroups);
    this.#asyncCache.invalidateAll(this.getProviderTypes);
    return response;
  }

  updateBranchLabel({ key, tag }: { key: string; tag: StubAny }) {
    return this.#client.put(`repositories/${key}/tags`, { tag });
  }

  setBranchMonitor({ key, name }: { key: string; name: string }) {
    const data = this.#client.post(`providerRepositories/${key}/branches`, { branchName: name });
    this.#asyncCache.invalidateAll(this.searchConnectionRepositories);
    return data;
  }

  getBranchMonitor({ key, name }: { key: string; name: string }) {
    return this.#client.get(`providerRepositories/${key}/branches/${encodeURIComponent(name)}`);
  }

  setBranchUnmonitor({ key }: { key: string }) {
    const data = this.#client.put(`repositories/${key}`, { monitorStatus: 'NotMonitored' });
    this.#asyncCache.invalidateAll(this.searchConnectionRepositories);
    return data;
  }

  async setMultiBranchChanges({ key, data }: { key: string; data: StubAny }) {
    await this.#client.put(`providerRepositories/${key}/manage`, data);
    this.#asyncCache.invalidateAll(this.searchConnectionRepositories);
    this.#asyncCache.invalidate(this.getProviderRepositoryData, { key });
  }

  async getProviderGroups(): Promise<ProviderGroup[]> {
    const groups = await this.#client.get('providers/groups');
    return this.filterDemoAndBetaConnectors(groups);
  }

  async getRepositoriesGroups({ key }: { key: string }) {
    return await this.#client.get(`providerRepositories/${key}/repositoriesGroups`);
  }

  async getProviderTypes(): Promise<ProviderType[]> {
    const types = await this.#client.get<StubAny>('providers/types');
    const groups = types.map((group: ProviderType) => ({
      ...group,
      providerGroups: this.filterDemoAndBetaConnectors(group.providerGroups),
      subTypes:
        group.subTypes?.map((type: SubType) => ({
          ...type,
          providerGroups: this.filterDemoAndBetaConnectors(type.providerGroups),
        })) ?? [],
    }));
    return groups.filter((group: ProviderType) => Boolean(group.providerGroups.length));
  }

  async getConnection({ key }: { key: string }): Promise<Connection> {
    return await this.#client.get(`servers/v2/${key}`);
  }

  async getConnectionSummary({ key }: { key: string }): Promise<SummaryType[]> {
    const consumableSummaries = await this.#client.get<SummaryType[]>(`servers/v2/${key}/summary`);
    const summaries = consumableSummaries.filter((consumable: SummaryType) => consumable.isRelated);

    // hides projects tab on other providers
    if (summaries.length > 1) {
      return summaries.filter((summary: SummaryType) => summary.key !== 'FindingsReports');
    }

    return summaries;
  }

  getRepository({ key }: { key: string }) {
    return this.#client.get(`repositories/${key}`);
  }

  getMonitorAllEffects({
    serverUrl,
    shouldMonitor,
  }: {
    serverUrl: string;
    shouldMonitor: boolean;
  }) {
    return this.#client.get(uri`servers/${serverUrl}/monitor/affected`, {
      params: { isMonitored: shouldMonitor },
    });
  }

  getDeleteConnectionEffects({ serverUrl }: { serverUrl: string }) {
    return this.#client.get(uri`servers/${serverUrl}/affected`);
  }

  async getRepositoriesFilterOptions({
    isSingleConnection,
    serverUrl,
  }: {
    isSingleConnection: boolean;
    serverUrl?: string;
  }): Promise<Filter[]> {
    const filterGroups = await this.#client.get('repositories/filterOptions', {
      params: { isSingleConnection, serverUrl },
    });
    return filterGroups.map(transformFilterGroups);
  }

  async getClustersFilterOptions() {
    const filterGroups = await this.#client.get('clusters/filterOptions', {
      params: { isSingleConnection: true },
    });
    return filterGroups.map(transformFilterGroups);
  }

  async getArtifactsFilterOptions() {
    const filterGroups = await this.#client.get('artifactRepositories/filterOptions');
    return filterGroups.map(transformFilterGroups);
  }

  async getFindingsReportsFilterOptions({ serverUrl }: { serverUrl: string }) {
    const filterGroups = await this.#client.get('findingsReportsProjects/filterOptions', {
      params: { serverUrl },
    });
    return filterGroups.map(transformFilterGroups);
  }

  async getProjectsFilterOptions() {
    const filterGroups = await this.#client.get('projects/filterOptions', {
      params: { isSingleConnection: true },
    });
    return filterGroups.map(transformFilterGroups);
  }

  async getApiGatewayFilterOptions() {
    const filterGroups = await this.#client.get('apiGateways/filterOptions');
    return filterGroups.map(transformFilterGroups);
  }

  getProviderRepositoryBranches({
    key,
    searchTerm,
    pageSize,
    startPage,
  }: {
    key: string;
    searchTerm: string;
    pageSize: number;
    startPage: number;
  }) {
    return this.#client.get(`providerRepositories/${key}/branches`, {
      params: {
        searchTerm,
        pageSize,
        startPage,
      },
    });
  }

  getProviderRepositoryData({ key }: { key: string }): Promise<ProviderRepositoryDataType> {
    return this.#client.get(`providerRepositories/${key}`);
  }

  getMonitorNewStatus({ key }: { key: string }) {
    return this.#client.get(`servers/${key}/monitorStatus`);
  }

  async redirectToOAuthConsentUrl(providerKey: string, body = {}) {
    window.location.href = await this.#client.post(
      `integrations/${providerKey}/authenticate`,
      body
    );
  }

  async setServerMonitorAll({
    serverUrl,
    shouldMonitor,
    ignoredIncluded,
  }: {
    serverUrl: string;
    shouldMonitor?: boolean;
    ignoredIncluded?: boolean;
  }) {
    // @ts-expect-error
    this.#asyncCache.invalidate(this.getProviderTypes);
    return await this.#client.put<{ irrelevantRepositoriesByStatus: Record<string, StubAny> }>(
      uri`servers/${serverUrl}/monitor`,
      {
        monitorStatus: shouldMonitor ? 'Monitored' : 'NotMonitored',
        ignoredIncluded,
      }
    );
  }

  async setServerMonitorNewRepositoriesGroups({
    serverUrl,
    groupsKeys,
    shouldMonitor,
    monitorArchived,
  }: {
    serverUrl: string;
    groupsKeys: StubAny;
    shouldMonitor: boolean;
    monitorArchived: boolean;
  }) {
    await this.#client.put(uri`servers/${serverUrl}/monitorNewForRepositoriesGroups`, {
      groupsKeys,
      monitorNewBin: { monitorNew: shouldMonitor, monitorArchived },
    });
    this.#asyncCache.invalidate(this.getMonitorNewStatus, { key: serverUrl });
  }

  async setServerMonitorNew({
    serverUrl,
    shouldMonitor,
    monitorArchived,
  }: {
    serverUrl: string;
    shouldMonitor: boolean;
    monitorArchived?: boolean;
  }) {
    await this.#client.put(uri`servers/${serverUrl}/monitorNew`, {
      monitorNew: shouldMonitor,
      MonitorArchived: monitorArchived,
    });
    // @ts-expect-error
    this.#asyncCache.invalidate(this.getProviderGroups);
    this.#asyncCache.invalidate(this.getMonitorNewStatus, { key: serverUrl });
  }

  async setServerPrivateKey({ serverUrl, file }: { serverUrl: string; file: StubAny }) {
    const formData = new FormData();
    formData.append('privateKey', file);
    await this.#client.post(uri`servers/${serverUrl}/privateKey`, formData, {
      headers: { 'content-type': 'multipart/form-data' },
    });
    // @ts-expect-error
    this.#asyncCache.invalidate(this.getProviderGroups);
  }

  async getJiraServerSettings({ serverUrl }: { serverUrl: string }) {
    return await this.#client.get(`servers/jira/${serverUrl}/settings`);
  }

  async setJiraServerSettings({
    serverUrl,
    serverSettings,
  }: {
    serverUrl: string;
    serverSettings: any;
  }) {
    await this.#client.put(uri`servers/jira/${serverUrl}/settings`, serverSettings);
    this.#asyncCache.invalidate(this.getJiraServerSettings, { serverUrl });
  }

  async toggleIgnoredProviderRepository({
    key,
    shouldIgnore,
    ignoreReason,
  }: {
    key: string;
    shouldIgnore: boolean;
    ignoreReason: string;
  }) {
    const updatedData = await this.#client.put(`providerRepositories/${key}`, {
      monitorStatus: shouldIgnore ? MonitorStatus.Ignored : MonitorStatus.NotMonitored,
      ignoreReason,
    });

    this.#analytics.track(
      `Repository ${shouldIgnore ? MonitorStatus.Ignored : MonitorStatus.NotMonitored}`,
      { Success: Boolean(updatedData) }
    );
    return updatedData;
  }

  async bulkToggleIgnoredProviderRepositories({
    data,
    shouldIgnore,
    ignoreReason,
  }: {
    data: StubAny[];
    shouldIgnore: boolean;
    ignoreReason: string;
  }) {
    const keys = data.map(item => item.key);
    const excludedRepositories = await this.#client.put(`providerRepositories`, {
      monitorStatus: shouldIgnore ? MonitorStatus.Ignored : MonitorStatus.NotMonitored,
      keys,
      ignoreReason,
    });
    const repositoriesToModify = data.filter(
      repository => !includesValue(excludedRepositories, repository)
    );
    repositoriesToModify.forEach(repository => {
      modify(repository, { isIgnored: shouldIgnore, isMonitored: false });
    });

    this.#asyncCache.invalidateAll(this.searchConnectionRepositories);
  }

  async toggleMonitoredProviderRepository(data: StubAny) {
    const monitorStatus = data.isMonitored ? MonitorStatus.NotMonitored : MonitorStatus.Monitored;
    try {
      const updatedData = await this.#client.put<StubAny>(`providerRepositories/${data.key}`, {
        monitorStatus,
      });
      this.#asyncCache.invalidate(this.getConnectionSummary, {
        key: encodeURIComponent(data.serverUrl),
      });

      if (updatedData) {
        modify(data, updatedData);
      }

      this.#analytics.track(`Repository ${monitorStatus}`, { Success: Boolean(updatedData) });
    } catch (error) {
      modify(data, { isMonitored: !data.isMonitored });
      throw error;
    }
  }

  async bulkToggleMonitoredFindingReports(repositories: StubAny[], shouldMonitor: boolean) {
    const keys = repositories.map(repository => repository.key);

    await this.#client.put(`findingsReportsProjects`, {
      keys,
      monitorStatus: shouldMonitor ? 'Monitored' : 'NotMonitored',
    });

    repositories.forEach(repository => {
      modify(repository, { isMonitored: shouldMonitor });
    });
  }

  async bulkToggleMonitoredProviderRepositories(repositories: StubAny[], shouldMonitor: boolean) {
    const keys = repositories.map(repository => repository.key);

    await this.#client.put(`providerRepositories`, {
      keys,
      monitorStatus: shouldMonitor ? 'Monitored' : 'NotMonitored',
    });

    repositories.forEach(repository => {
      modify(repository, { isMonitored: shouldMonitor, isIgnored: false });
    });
    this.#asyncCache.invalidateAll(this.searchConnectionRepositories);
    this.#asyncCache.invalidateAll(this.getConnectionSummary);
    this.#asyncCache.invalidateAll(this.getConnection);
    this.#asyncCache.invalidateAll(this.getMonitorNewStatus);
    this.#asyncCache.invalidateAll(this.getProviderGroups);
    await this.#application.fetchIntegrations();
  }

  async bulkToggleMonitoredProjects(projects: StubAny[], shouldMonitor: boolean) {
    const keys = projects.map(repository => repository.key);

    await this.#client.put(`projects`, {
      keys,
      monitorStatus: shouldMonitor ? 'Monitored' : 'NotMonitored',
    });

    projects.forEach(project => {
      modify(project, { isMonitored: shouldMonitor });
    });

    this.#asyncCache.invalidateAll(this.getConnectionSummary);
    this.#asyncCache.invalidateAll(this.getConnection);
    this.#asyncCache.invalidateAll(this.getMonitorNewStatus);
    this.#asyncCache.invalidateAll(this.getProviderGroups);
    await this.#application.fetchIntegrations();
  }

  async toggleMonitoredRepository({ key, shouldMonitor }: { key: string; shouldMonitor: boolean }) {
    const updatedData = await this.setMonitorStatus({
      key,
      shouldMonitor,
      controller: 'repositories',
    });

    this.#analytics.track(
      `Repository ${shouldMonitor ? MonitorStatus.Monitored : MonitorStatus.NotMonitored}`,
      { Success: Boolean(updatedData) }
    );
    return updatedData;
  }

  setMonitorStatus({
    key,
    controller,
    shouldMonitor,
  }: {
    key: string;
    shouldMonitor: boolean;
    controller: string;
  }) {
    return this.#client.put(`${controller}/${key}`, {
      monitorStatus: shouldMonitor ? MonitorStatus.Monitored : MonitorStatus.NotMonitored,
    });
  }

  async toggleMonitoredProject({
    key,
    shouldMonitor,
    serverUrl,
  }: {
    key: string;
    shouldMonitor: boolean;
    serverUrl: string;
  }) {
    await this.setMonitorStatus({ key, shouldMonitor, controller: 'projects' });
    this.#asyncCache.invalidate(this.getConnectionSummary, { key: encodeURIComponent(serverUrl) });
  }

  toggleMonitoredArtifactRepository({
    key,
    shouldMonitor,
  }: {
    key: string;
    shouldMonitor: boolean;
  }) {
    return this.setMonitorStatus({ key, shouldMonitor, controller: 'artifactRepositories' });
  }

  toggleMonitoredApiGateway({ key, shouldMonitor }: { key: string; shouldMonitor: boolean }) {
    return this.setMonitorStatus({ key, shouldMonitor, controller: 'apiGateways' });
  }

  toggleMonitoredFindingsReport({ key, shouldMonitor }: { key: string; shouldMonitor: boolean }) {
    return this.setMonitorStatus({ key, shouldMonitor, controller: 'findingsReportsProjects' });
  }

  async setProviderRepositoryStatus({
    key,
    shouldMonitor,
    ignore,
    ignoreReason,
  }: {
    key: string;
    shouldMonitor: boolean;
    ignore: boolean;
    ignoreReason: string;
  }) {
    const monitorStatus = ignore
      ? MonitorStatus.Ignored
      : shouldMonitor
        ? MonitorStatus.Monitored
        : MonitorStatus.NotMonitored;
    const success = Boolean(
      await this.#client.put(`providerRepositories/${key}`, { monitorStatus, ignoreReason })
    );
    this.#analytics.track(`Repository ${ignore ? 'Ignored' : monitorStatus}`, {
      Success: success,
    });
    return success;
  }

  async searchProviderRepositories(params: StubAny) {
    const { items, ...rest } = await this.#client.search('providerRepositories/search', params);
    return {
      ...rest,
      items,
    };
  }

  filterDemoAndBetaConnectors(types: StubAny[]) {
    return types.filter(
      type =>
        (!type.betaFeatureName ||
          this.#application.isFeatureEnabled(type.betaFeatureName) ||
          !type.isHidden) &&
        (this.#application.isDemo || !type.demoOnly)
    );
  }

  searchConnectionRepositories(params: StubAny) {
    return this.#client.search(
      uri`servers/v2/${params.connectionUrl}/providerRepositories/search`,
      params
    );
  }

  async searchConnectionProjects(params: StubAny) {
    const { items, ...rest } = await this.#client.search(
      uri`servers/v2/${params.connectionUrl}/projects/search`,
      params
    );

    return {
      ...rest,
      items: items.map(item => ({
        ...item,
        isRecommended: item.interestScore > 0 && !item.isArchived,
      })),
    };
  }

  searchConnectionApiGateways(params: StubAny) {
    return this.#client.search(uri`servers/v2/${params.connectionUrl}/apiGateways/search`, params);
  }

  searchConnectionClusters(params: StubAny) {
    return this.#client.search(uri`servers/v2/${params.connectionUrl}/clusters/search`, params);
  }

  searchConnectionArtifacts(params: StubAny) {
    return this.#client.search(uri`servers/v2/${params.connectionUrl}/artifacts/search`, params);
  }

  searchConnectionNetworkBroker(
    params: StubAny
  ): Promise<{ count: number; items: StubAny[]; total: number }> {
    return this.#client.get('networkBroker/hosts', params);
  }

  searchConnectionFindingsReports(params: StubAny) {
    return this.#client.search(
      uri`servers/v2/${params.connectionUrl}/findingsReportsProjects/search`,
      params
    );
  }

  searchProviderEvents(params: StubAny): Promise<AggregationResult<SearchLogType>> {
    return this.#client.search('health-events/search', params);
  }

  async getProviderEventsFilterOptions(params: StubAny): Promise<Filter[]> {
    const options = await this.#client.get(`health-events/filterOptions`, { params });

    return _.orderBy(options, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(item => transformFilterGroups(item));
  }
}
