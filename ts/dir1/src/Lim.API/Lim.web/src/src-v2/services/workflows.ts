import _ from 'lodash';
import { transformWorkflowBeforeSave } from '@src-v2/containers/workflow/transformers';
import {
  ApplicationDefaultProjectOption,
  OpenIssueInSameRepositoryOption,
  TeamDefaultProjectOption,
  ThenType,
  anyOption,
} from '@src-v2/containers/workflow/types/types';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { AsyncCache } from '@src-v2/services/async-cache';
import { RBAC } from '@src-v2/services/rbac';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProviderGroup } from '@src-v2/types/enums/provider-group';
import { CodeProfileResponse } from '@src-v2/types/profiles/code-profile-response';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';
import { QuestionnaireTemplateSummary } from '@src-v2/types/queastionnaire/questionnaire-summary';
import { StubAny } from '@src-v2/types/stub-any';

type ValueOption = { key: string; displayName: string };

export class Workflows {
  #client: ApiClient;
  #asyncCache: AsyncCache;
  #hasGlobalAccess: boolean;
  #application: Application;

  constructor({
    apiClient,
    rbac,
    asyncCache,
    application,
  }: {
    apiClient: ApiClient;
    rbac: RBAC;
    asyncCache: AsyncCache;
    application: Application;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#hasGlobalAccess = rbac.canEdit(resourceTypes.Global);
    this.#application = application;
  }

  getWorkflows(): Promise<[]> {
    return this.#client.get(`workflows/workflows`);
  }

  searchWorkflows = async (
    searchParams: SearchParams,
    apiOptions?: StubAny
  ): Promise<AggregationResult<OrganizationTeamProfileResponse>> =>
    await this.#client.search(
      `workflows/workflows/search`,
      {
        ...searchParams,
        limit: 20,
        sort: searchParams?.sort ?? 'DisplayName',
        searchTerm: searchParams?.searchTerm ?? '',
      },
      apiOptions
    );

  async deleteWorkflow(key: StubAny) {
    await this.#client.delete(`workflows/workflows/${key}`);
    this.#asyncCache.invalidateAll(this.getWorkflows);
    this.#asyncCache.invalidateAll(this.searchWorkflows);
  }

  async saveWorkflow(workflow: StubAny) {
    const workflowToSave = transformWorkflowBeforeSave(workflow);
    await this.#client.put(`workflows/workflows/${workflowToSave.key}`, workflowToSave);
    this.#asyncCache.invalidateAll(this.getWorkflows);
    this.#asyncCache.invalidateAll(this.searchWorkflows);
  }

  async createWorkflow(workflow: StubAny) {
    const key = crypto.randomUUID();
    const workflowToSave = transformWorkflowBeforeSave(workflow);
    await this.#client.put(`workflows/workflows/${key}`, {
      ...workflowToSave,
      key,
    });
    this.#asyncCache.invalidateAll(this.getWorkflows);
    this.#asyncCache.invalidateAll(this.searchWorkflows);
  }

  testWebhook(url: StubAny, authorizationHeader: StubAny) {
    return this.#client.post(
      `workflows/testWebhook?url=${url}&authorizationHeader=${authorizationHeader}`
    );
  }

  async getWorkflowRecipes(): Promise<StubAny[]> {
    const recipeGroups: StubAny = await this.#client.get('workflows/recipes');
    return recipeGroups.map((group: StubAny) =>
      Object.assign(group, {
        recipes: group.recipes.map((recipe: StubAny) =>
          _.defaultsDeep(recipe, {
            workflow: {
              key: crypto.randomUUID(),
              name: recipe.title,
              workflowNotificationEffect: 'Immediate',
            },
          })
        ),
      })
    );
  }

  async getProjectUsers({ searchTerm, projectKey }: StubAny) {
    const params = searchTerm ? { searchTerm } : {};

    return await this.#client.get<StubAny>(`projects/${projectKey}/users/search`, {
      params,
    });
  }

  async getProjectUser({ searchTerm, projectKey }: StubAny) {
    const users = await this.#client.get(`projects/${projectKey}/users/search`, {});

    if (!Array.isArray(users)) {
      return;
    }

    return (
      (users ?? []).find(user => user.includes?.(searchTerm) ?? user.key === searchTerm) ??
      searchTerm
    );
  }

  getMonitoredTicketingProjects({
    provider,
    withCreateIssuesPermission,
    searchTerm,
  }: StubAny): Promise<StubAny> {
    if (!(provider === 'Jira' || provider === 'AzureDevops')) {
      return Promise.resolve();
    }

    return this.#client.get<StubAny>(`projects/v2/${provider}`, {
      params: {
        withCreateIssuesPermission,
        searchTerm,
        pageSize: 20,
        showDefaults: true,
      },
    });
  }

  getThenSubTypeSpecialOptions() {
    const options: StubAny = [OpenIssueInSameRepositoryOption];
    if (this.#application.isFeatureEnabled(FeatureFlag.ApplicationDefaultCommunication)) {
      options.push(ApplicationDefaultProjectOption);
    }
    if (this.#application.isFeatureEnabled(FeatureFlag.TeamDefaultCommunication)) {
      options.push(TeamDefaultProjectOption);
    }
    return options;
  }

  async createHierarchyDictionary() {
    const items = await this.#client.get<StubAny>('asset-collections/org-teams/chart');
    const dictionary: StubAny = {};

    items.forEach((item: StubAny) => {
      dictionary[item.key] = item.hierarchy.map((h: StubAny) => h.name).join(' / ');
    });

    return dictionary;
  }

  async getIssueTypeOptions({ projectKey, provider, isCustomSchema }: StubAny) {
    if (isCustomSchema && projectKey) {
      const issueTypes = await this.#client.get<StubAny>(
        `workflows/issueTypes/${provider}/${projectKey}`
      );

      return (issueTypes ?? []).map(convertIssueType);
    }

    return Promise.resolve();
  }

  async searchRepositories({ searchTerm }: StubAny) {
    const { items } = await this.#client.search<StubAny>('repositories/search', {
      searchTerm,
    });

    return this.#hasGlobalAccess ? [anyOption, ...items] : items;
  }

  async searchContributors({ searchTerm }: StubAny) {
    const { items } = await this.#client.search<StubAny>('developers/profiles/search', {
      searchTerm,
    });
    return items ?? [];
  }

  async searchApplications({ searchTerm }: StubAny) {
    const { items } = await this.#client.search<StubAny>('assetCollections/profiles/search', {
      searchTerm,
    });
    return this.#hasGlobalAccess ? [anyOption, ...items] : items;
  }

  async searchTeams({ searchTerm }: StubAny) {
    const { items } = await this.#client.search<CodeProfileResponse>(
      'asset-collections/org-teams/profiles/search',
      {
        searchTerm,
      }
    );

    const d = await this.createHierarchyDictionary();
    items.forEach((item: StubAny) => {
      item.uniqueName = d[item.key];
    });

    return this.#hasGlobalAccess ? [anyOption, ...items] : items;
  }

  async getQuestionnaireTemplates({ searchTerm }: StubAny) {
    const { items } = await this.#client.search<QuestionnaireTemplateSummary>(
      'questionnaire-templates/search',
      {
        searchTerm,
      }
    );

    return items;
  }

  async searchProjects({ searchTerm }: StubAny) {
    const { items } = await this.#client.get<StubAny>(`projects/search`, {
      params: {
        searchTerm,
        pageSize: 20,
      },
    });
    return this.#hasGlobalAccess ? [anyOption, ...items] : items;
  }

  async searchServers({ searchTerm }: StubAny) {
    const items = await this.#client.get<StubAny>(`servers/v2/project-and-repository-servers`, {
      params: {
        searchTerm,
        pageSize: 20,
      },
    });
    const itemsToDisplay = items.map((item: StubAny) => ({
      ...item,
      key: item.url,
      name: item.url,
    }));
    return this.#hasGlobalAccess ? [anyOption, ...itemsToDisplay] : itemsToDisplay;
  }

  async getRepository({ key }: StubAny) {
    if (!key || typeof key !== 'string') {
      return Promise.resolve(null);
    }
    if (key === 'any') {
      return Promise.resolve({ key, name: 'any' });
    }

    const repository = await this.#client.get(`repositories/${key}`);
    if (!repository) {
      return key;
    }
    return repository;
  }

  async getApplication({ key }: StubAny) {
    if (!key || typeof key !== 'string') {
      return Promise.resolve();
    }
    if (key === 'any') {
      return Promise.resolve(anyOption);
    }

    const application = await this.#client.get(`assetCollections/${key}/profile`);
    if (!application) {
      return key;
    }
    return application;
  }

  async getTeam({ key }: StubAny) {
    if (!key || typeof key !== 'string') {
      return Promise.resolve();
    }
    if (key === 'any') {
      return Promise.resolve(anyOption);
    }
    const team = await this.#client.get<StubAny>(`asset-collections/org-teams/${key}/profile`);
    if (!team) {
      return key;
    }
    const d = await this.createHierarchyDictionary();
    team.uniqueName = d[team.key];
    return team;
  }

  async getQuestionnaireTemplate({ key }: StubAny) {
    if (!key || typeof key !== 'string') {
      return Promise.resolve();
    }
    if (key === 'any') {
      return Promise.resolve(anyOption);
    }
    return await this.#client.get(`questionnaire-templates/${key}`);
  }

  async getProject({ key }: StubAny) {
    if (key === 'OpenIssueInSameRepository') {
      return Promise.resolve(OpenIssueInSameRepositoryOption);
    }

    if (key === 'ApplicationDefaultCommunication__ApplicationDefaultCommunication') {
      return Promise.resolve(ApplicationDefaultProjectOption);
    }

    if (key === 'TeamDefaultCommunication__TeamDefaultCommunication') {
      return Promise.resolve(TeamDefaultProjectOption);
    }

    if (!key || typeof key !== 'string') {
      return Promise.resolve();
    }
    if (key === 'any') {
      return Promise.resolve(anyOption);
    }

    const project = await this.#client.get(`projects/${key}`);
    if (!project) {
      return key;
    }
    return project;
  }

  getContributor({ key }: StubAny) {
    return this.#client.get<StubAny>(`developers/${key}`);
  }

  getWhenOptions({ type }: StubAny): Promise<ValueOption[]> {
    return this.#client.get(`workflows/whenOptions?whenType=${type}`);
  }

  getThenValueOptions = async ({ type }: { type: ThenType }): Promise<ValueOption[]> => {
    const channels = await this.#client.get<StubAny>(`workflows/thenOptions?thenType=${type}`);

    if (
      type === ProviderGroup.Slack ||
      type === ProviderGroup.GoogleChat ||
      type === ProviderGroup.Teams
    ) {
      const specialOptions = [];
      if (this.#application.isFeatureEnabled(FeatureFlag.ApplicationDefaultCommunication)) {
        specialOptions.push({
          key: 'ApplicationDefaultCommunication__ApplicationDefaultCommunication',
          displayName: 'Application default channel',
        });
      }
      if (this.#application.isFeatureEnabled(FeatureFlag.TeamDefaultCommunication)) {
        specialOptions.push({
          key: 'TeamDefaultCommunication__TeamDefaultCommunication',
          displayName: 'Team default channel',
        });
      }
      return [...specialOptions, ...channels];
    }

    if (type === ProviderGroup.Gitlab || ProviderGroup.Gitlab || ProviderGroup.AzureDevops) {
      return [{ key: 'OpenIssueInSameRepository', displayName: 'Same repository' }, ...channels];
    }
    return channels;
  };
}

export const convertIssueType = (issueType: StubAny) => ({
  label: issueType.displayName,
  value: issueType.key,
  ...issueType,
});
