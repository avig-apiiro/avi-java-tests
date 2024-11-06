import _ from 'lodash';
import { getRiskUrl } from '@src-v2/data/risk-data';
import {
  IssueSchemaByProvider,
  SummaryFieldPathToProvider,
  TicketingProviders,
  createIssueSummary,
} from '@src-v2/data/ticketing-issues-provider';
import { Project } from '@src-v2/types/projects/project';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StubAny } from '@src-v2/types/stub-any';

export class TicketingIssues {
  #client;

  constructor({ apiClient }: StubAny) {
    this.#client = apiClient;
  }

  static #createBaseTriggerIssue(riskData: StubAny, projectKey: StubAny) {
    const riskMainProfile = riskData.applications[0] ?? riskData.relatedEntity;
    return {
      triggerKey: riskData.key,
      triggerRuleKey: riskData.ruleKey,
      triggerDescription: riskData.riskName,
      triggerElementType: riskData.elementType,
      triggerElementKey: riskData.elementKey,
      projectKey,
      profileKey: riskMainProfile?.key,
      profileType: riskMainProfile?.profileType ?? riskMainProfile?.type,
      relatedEntity: riskData.relatedEntity,
      riskLevel: riskData.riskLevel,
      apiiroLink: riskData?.apiiroLink ?? getRiskUrl(riskData),
      applications: riskData.applications.map((item: StubAny) => item.name).join(', '),
      discoveredAt: riskData.discoveredAt,
      dataModelReference: riskData.dataModelReference ?? riskData.primaryDataModelReference,
      triggerDueDate: riskData.dueDate,
    };
  }

  static #normalizeFieldsValues(provider: StubAny, schema: StubAny, fieldsValues: StubAny) {
    const schemaFields = IssueSchemaByProvider[provider] ?? [
      ...schema.requiredFields,
      ...schema.additionalFields,
    ];
    return schemaFields.reduce(
      (clone, { key: fieldKey, type, customFieldType, multiple = false }) => {
        const value = _.get(fieldsValues, fieldKey);
        if (!value) {
          return clone;
        }

        switch (type) {
          case 'date':
          case 'string':
          case 'textarea':
          case 'number':
            clone[fieldKey] = [value];
            break;
          case 'select':
            clone[fieldKey] = multiple
              ? value.map((fieldValue: StubAny) => fieldValue.value)
              : value.value
                ? [value.value]
                : [value];
            break;
          case 'user':
            clone[fieldKey] = [value.email ?? value.key ?? value];
            break;
          case 'issuelink':
            clone[fieldKey] = [value.key];
            break;
          case 'users':
            clone[fieldKey] = value.map((user: StubAny) => user.email ?? user.key);
            break;
          case 'array':
            clone[fieldKey] = value.map((selected: StubAny) => selected.value);
            break;
          case 'any':
            customFieldType === 'gh-epic-link'
              ? (clone[fieldKey] = [value.key])
              : console.warn(`Unsupported field type: ${type}`);
            break;
          default:
            console.warn(`Unsupported field type: ${type}`);
        }
        return clone;
      },
      {}
    );
  }

  static #convertAzureFieldType({ type: baseType, ...field }: StubAny) {
    let type = baseType;
    if (field.key === 'System.Tags') {
      type = 'array';
    }

    switch (baseType) {
      case 'select':
        break;
      case 'DateTime':
        type = 'date';
        break;
      case 'Html':
        type = 'textarea';
        break;
      case 'Identity':
        type = 'user';
        break;
      case 'String':
      case 'PlainText':
        type = 'string';
        break;
      case 'Integer':
      case 'Double':
      case 'Decimal':
        type = 'number';
        break;
      // no default
    }

    return { ...field, type };
  }

  getProject({ key }: StubAny) {
    return this.#client.get(`projects/${key}`);
  }

  getMonitoredProjects({ provider, withCreateIssuesPermission }: StubAny): Promise<Project[]> {
    return this.#client.get(`projects/v2/${provider}`, {
      params: {
        withCreateIssuesPermission,
      },
    });
  }

  async getDefaultIssueDestination({ provider, applicationKey, riskLevel }: StubAny) {
    if (provider !== TicketingProviders.Jira || !applicationKey || !riskLevel) {
      return Promise.resolve([]);
    }

    return await this.#client.get('projects/preFilledProjectIssueType', {
      params: { provider, applicationKey, riskLevel },
    });
  }

  async getDefaultFields({ applicationKey, riskLevel, project, issueType }: StubAny) {
    if (!project || !issueType || !riskLevel) {
      return Promise.resolve([]);
    }

    return await this.#client.get(`projects/preFilledFields`, {
      params: {
        applicationKey,
        riskLevel,
        project,
        issueType,
      },
    });
  }

  async getIssueTypeSchema({ provider, projectKey, issueTypeId }: StubAny) {
    if (!provider || provider === TicketingProviders.Github || !projectKey || !issueTypeId) {
      return Promise.resolve(null);
    }

    return await this.#client
      .get('projects/issueTypeOptions', {
        params: { provider, projectKey, issueTypeId },
      })
      .then(({ additionalFields, nonRequiredFields, requiredFields, ...issueSchema }: StubAny) => ({
        ...issueSchema,
        requiredFields: requiredFields?.map(TicketingIssues.#convertAzureFieldType),
        additionalFields: additionalFields?.map(TicketingIssues.#convertAzureFieldType),
        nonRequiredFields: nonRequiredFields?.map(TicketingIssues.#convertAzureFieldType),
      }));
  }

  getMonitoredProjectIssueTypes({ provider, projectKey }: StubAny) {
    return projectKey && provider
      ? this.#client.get(`projects/v2/${provider}/${projectKey}/issueTypes/options`)
      : Promise.resolve([]);
  }

  createIssue({
    issue: { summary, project, issueType = { id: '', key: '' }, schema, ...rawIssue },
    riskData,
  }: StubAny) {
    return this.#client.post('issues', {
      ...TicketingIssues.#createBaseTriggerIssue(riskData, project.key),
      summary,
      issueType: issueType.key ?? issueType.id,
      fieldsValues: TicketingIssues.#normalizeFieldsValues(
        rawIssue.provider,
        schema,
        rawIssue.fieldsValues
      ),
    });
  }

  linkExistingTicket({
    url,
    riskData,
    projects,
  }: {
    url: string;
    riskData: RiskTriggerSummaryResponse;
    projects: Project[];
  }) {
    const { serverUrl, projectId, issueId } = this.parseProjectIdFromUrl(url);
    const project = projects.find(
      project => project.id === projectId && project.serverUrl === serverUrl
    );
    if (!project) {
      throw Error('Could not find a monitored project with this Id');
    }

    const triggerIssue = TicketingIssues.#createBaseTriggerIssue(riskData, project.key);
    return this.#client.post('issues/linkIssueToRisk', {
      url,
      triggerIssue,
      issueId,
    });
  }

  parseProjectIdFromUrl(url: string): { serverUrl: string; projectId: string; issueId: string } {
    const regex = /\/browse\/([A-Za-z0-9]+-[\d]+)/;
    const match = url.match(regex);

    if (!match) {
      throw new Error("URL format doesn't match the required format.");
    }

    const [, issueId] = match;
    const [projectId] = issueId.split('-');

    const baseUrl = new URL(url);
    const serverUrl = `${baseUrl.protocol}//${baseUrl.hostname}`;

    return { serverUrl, projectId, issueId };
  }

  createAggregatedIssue({
    issue: { summary, project, issueType = { id: '', key: '' }, schema, ...rawIssue },
    items,
  }: StubAny) {
    return this.#client.post('issues/aggregated', {
      projectKey: project.key,
      issueTypeKey: issueType.id,
      issueType: issueType.key ?? issueType.id,
      fieldsValues: TicketingIssues.#normalizeFieldsValues(
        rawIssue.provider,
        schema,
        rawIssue.fieldsValues
      ),
      items: items.map((riskData: StubAny) =>
        TicketingIssues.#createBaseTriggerIssue(riskData, project.key)
      ),
    });
  }

  createSeparateIssues({ issue, items }: StubAny) {
    return Promise.all(
      items.map((item: StubAny) =>
        this.createIssue({
          issue: _.set(
            issue,
            SummaryFieldPathToProvider[issue.provider] ?? 'summary',
            createIssueSummary(item)
          ),
          riskData: item,
        })
          .then((response: StubAny) => ({ resolved: Boolean(response), sentItem: item, response }))
          .catch((error: StubAny) => ({ resolved: false, sentItem: item, error }))
      )
    ).then(results => _.partition(results, 'resolved'));
  }
}
