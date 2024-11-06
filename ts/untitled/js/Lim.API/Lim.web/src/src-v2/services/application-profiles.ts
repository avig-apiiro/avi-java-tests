import _ from 'lodash';
import { ApplicationFormConfigurationType } from '@src-v2/containers/applications/application-form';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { Filter } from '@src-v2/hooks/use-filters';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { Connectors } from '@src-v2/services/connectors';
import { Contributors } from '@src-v2/services/contributors';
import { ApplicationProfilesV2 } from '@src-v2/services/profiles/application-profiles-v2';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { Provider } from '@src-v2/types/enums/provider';
import { LeanPointOfContact } from '@src-v2/types/profiles/lean-developer';
import { ProjectProfile } from '@src-v2/types/profiles/project-profile';
import { RepositoryProfileResponse } from '@src-v2/types/profiles/repository-profile-response';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { StubAny } from '@src-v2/types/stub-any';
import { mapFromArray } from '@src-v2/utils/collection-utils';

interface Configuration {
  key: string;
  repositoryKeys: string[];
  projectKeys: string[];
  repositoryGroups: string[];
  apiGatewayKeys: string[];
  apisGroupKeys: string[];
  pointsOfContact: string[];
  businessImpact: 'None' | string;
  businessImpactLevel: 'None' | string;
  deploymentLocation: 'None' | string;
  moduleRepositoryKey: string | null;
  modulesGroup: string | null;
  applicationType: 'None' | string;
  estimatedUsersNumber: 'Undefined' | string;
  estimatedRevenue: 'Undefined' | string;
  complianceRequirements: string[];
}

export class ApplicationProfiles {
  #client: ApiClient;
  #asyncCache: AsyncCache;
  #contributors: Contributors;
  #applicationProfilesV2: ApplicationProfilesV2;
  #connectors: Connectors;

  constructor({
    apiClient,
    asyncCache,
    contributors,
    applicationProfilesV2,
    connectors,
  }: {
    apiClient: ApiClient;
    asyncCache: AsyncCache;
    contributors: Contributors;
    applicationProfilesV2: ApplicationProfilesV2;
    connectors: Connectors;
  }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#contributors = contributors;
    this.#applicationProfilesV2 = applicationProfilesV2;
    this.#connectors = connectors;
  }

  getApplicationGroupsConfigurations() {
    return this.#client.get('applicationGroups/configurations');
  }

  getApplicationConfigurations() {
    return this.#client.get('assetCollections/configurations');
  }

  async getConnectors() {
    const modifiedOptions = (convertOption: StubAny, options: StubAny[] = []) =>
      _.orderBy(options, 'isMonitored', 'desc').map(convertOption);

    const convertServerOption = (server: StubAny) => ({
      key: server.url,
      value: server.url,
      name: server.url,
      label: server.url,
      providerGroup: server.providerGroup,
    });

    const data = await this.#connectors.getProviderGroups();
    const transformedData = _.uniqBy(
      data.flatMap(group => group.servers),
      'url'
    ).filter(Boolean);

    const connectorsItems = modifiedOptions(convertServerOption, transformedData);

    const returnPromise = ({ limit = 200, offset = 0 }) =>
      new Promise<any[]>(accept => {
        accept(connectorsItems.slice(offset, offset + limit || 20));
      });

    return returnPromise({});
  }

  async upsert(data: StubAny) {
    const response = await this.#client.put(`assetCollections/configuration/${data.key}`, data, {
      params: { suggestionBase: false },
    });
    this.invalidate(data);
    return response;
  }

  async delete(key: string) {
    const response = await this.#client.delete(`assetCollections/configuration/${key}`);
    this.invalidate({ key });
    return response;
  }

  invalidate({ key }: { key: string }) {
    this.#asyncCache.invalidate(this.#applicationProfilesV2.getProfile, {
      key,
    });
  }

  async searchSuggestions(
    {
      searchTerm,
      limit = 10000,
      sortBy = 'DisplayName',
    }: {
      searchTerm: string;
      limit: number;
      sortBy: string;
    },
    apiOptions: StubAny = null
  ) {
    const { items } = await this.#client.get<{ items: StubAny[] }>(
      'assetCollections/profiles/search',
      {
        ...apiOptions,
        params: {
          searchTerm,
          pageSize: limit,
          sortOption: sortBy,
          skip: 0,
        },
      }
    );
    return items.map(item => ({
      key: item.key,
      name: item.name,
    }));
  }

  async searchConfigurationSuggestions({
    searchTerm,
    limit = 10000,
  }: {
    searchTerm: string;
    limit: number;
  }) {
    const items = await this.#client.get<StubAny[]>('assetCollections/configuration/search', {
      params: {
        searchTerm,
        pageSize: limit,
        skip: 0,
      },
    });
    return items.map(item => ({
      key: item.key,
      name: item.name,
    }));
  }

  async getConfigurationOptions() {
    return _.mapValues(
      await this.#client.get<StubAny>('assetCollections/configuration/options'),
      value => _.orderBy(value, ['isMonitored', 'name'], ['desc', 'asc'])
    );
  }

  async getProfileExtendedConfiguration({ key }: { key: string }) {
    return await this.#client.get(`assetCollections/configuration/${key}`);
  }

  getProviderRepositories(params: StubAny): Promise<
    AggregationResult<{
      name: string;
      server: { provider: Provider; providerGroup: ProviderGroup };
    }>
  > {
    return this.#client.search('providerRepositories/search', params);
  }

  getRepositories(params: StubAny) {
    return this.#client.search('repositories/search', params);
  }

  getRepositoryProfiles(params: StubAny) {
    return this.#client.search('repositories/profiles/search', params);
  }

  getApplications(params: StubAny) {
    return this.#client.search('assetCollections/profiles/search', params);
  }

  async searchApplicationProjects({
    applicationKey,
    ...params
  }: {
    applicationKey: string;
  } & SearchParams): Promise<AggregationResult<ProjectProfile>> {
    return await this.#client.search(`assetCollections/${applicationKey}/projects/search`, params);
  }

  getProjects(params: StubAny) {
    return this.#client.search('projects/search', params);
  }

  getStaticConfigurationOptions() {
    return this.#client.get('assetCollections/configuration/formOptions');
  }

  async getConfigurationDefaultValues({
    key,
    configuration,
    recommendations,
  }: {
    key: string;
    configuration: ApplicationFormConfigurationType;
    recommendations?: any;
  }) {
    const { transformConfigurationOptions, transformConfigurationsWithoutOptions } =
      ApplicationProfiles;
    const options: StubAny = await this.#asyncCache.suspend(this.getConfigurationOptions);

    const [extendedConfiguration, { tags }] = key
      ? await Promise.all([
          this.#asyncCache.suspend(this.getProfileExtendedConfiguration, { key }),
          this.#asyncCache.suspend(this.#applicationProfilesV2.getProfile, { key }),
        ])
      : [{}, []];

    const { repositories, projects, moduleRepository } = extendedConfiguration;

    return {
      ...configuration,
      editable: !configuration?.source,
      repositories: transformConfigurationsWithoutOptions(
        repositories,
        recommendations?.suggestedRepositories
      ),
      repositoryGroups: transformConfigurationsWithoutOptions(
        configuration?.repositoryGroups,
        recommendations?.repositoryGroups
      ),
      projects: transformConfigurationsWithoutOptions(projects, recommendations?.suggestedProjects),
      apiGateways: transformConfigurationOptions(
        mapFromArray(options.apiGateways, 'key'),
        configuration?.apiGatewayKeys
      ).map((api, index) => ({
        gateway: api,
        gatewayRoute: options.apiGatewaysRoutes.find(
          (route: StubAny) => configuration?.apisGroupKeys[index] === route.key
        ),
      })),
      modulesGroup: configuration?.modulesGroup?.moduleKeys?.map(key => ({
        key,
        name: key,
        repositoryKey: configuration?.modulesGroup?.repositoryKey,
      })),
      moduleRepository: moduleRepository ?? null,
      estimatedUsersNumber:
        configuration?.estimatedUsersNumber === 'Undefined'
          ? ''
          : options.estimatedUsersNumberOptions.find(
              (item: StubAny) => item.value === configuration?.estimatedUsersNumber
            ),
      applicationType:
        configuration?.applicationType !== 'None'
          ? options?.applicationTypesOptions?.find(
              (option: StubAny) => option?.value === configuration?.applicationType
            )
          : null,
      applicationTypeOther:
        configuration?.applicationType === 'Other' ? configuration?.applicationTypeOther : '',
      deploymentLocation:
        configuration?.deploymentLocation !== 'None'
          ? options.deploymentLocationOptions.find(
              (option: StubAny) => option?.value === configuration?.deploymentLocation
            )
          : null,
      complianceRequirements: configuration?.complianceRequirements?.map(value =>
        options.complianceRequirementsOptions.find((item: StubAny) => item.value === value)
      ),
      estimatedRevenue:
        configuration?.estimatedRevenue === 'Undefined'
          ? ''
          : options.estimatedRevenueOptions.find(
              (item: StubAny) => item.value === configuration?.estimatedRevenue
            ),
      pointsOfContact: await this.#contributors.groupPointsOfContactsByType(
        (await Promise.all(
          configuration?.pointsOfContact?.map(this.fetchPointOfContactDeveloper)
        )) ?? []
      ),
      tags,
    };
  }

  convertFormDataToConfiguration({
    repositories,
    projects,
    repositoryGroups,
    pointsOfContact,
    apiGateways,
    businessImpact,
    deploymentLocation,
    moduleRepository,
    modulesGroup,
    applicationType,
    estimatedUsersNumber,
    estimatedRevenue,
    complianceRequirements,
    ...formData
  }: {
    repositories: StubAny[];
    projects: StubAny[];
    repositoryGroups: StubAny[];
    pointsOfContact: StubAny;
    apiGateways: StubAny[];
    businessImpact: StubAny;
    deploymentLocation: StubAny;
    moduleRepository: StubAny;
    modulesGroup: StubAny[];
    applicationType: StubAny;
    estimatedUsersNumber: StubAny;
    estimatedRevenue: StubAny;
    complianceRequirements: StubAny[];
    formData: StubAny[];
  }) {
    const sanitizedApiGateways =
      apiGateways?.filter(api => Boolean(api.gateway) && Boolean(api.gatewayRoute)) ?? [];

    return _.defaults(
      {
        ...formData,
        repositoryKeys: repositories?.map(repository => repository.key),
        projectKeys: projects?.map(project => project.key),
        repositoryGroups: repositoryGroups?.map(repository => ({
          serverUrl: repository.key.split('+')[0],
          groupName: repository.name,
        })),
        apiGatewayKeys: sanitizedApiGateways?.map(api => api.gateway.key),
        apisGroupKeys: sanitizedApiGateways?.map(api => api.gatewayRoute.key),
        pointsOfContact: pointsOfContact.flatMap(
          ({ developer, jobTitle }: { developer: StubAny[]; jobTitle: StubAny }) =>
            developer.map(item => ({
              ...item,
              representativeIdentityKeySha: item.identityKey,
              title: jobTitle.value ?? jobTitle,
            }))
        ),
        businessImpact: businessImpact ?? 'None',
        businessImpactLevel: businessImpact ?? 'None',
        deploymentLocation: deploymentLocation?.value,
        hasBusinessImpact: businessImpact?.length > 0,
        hasDeploymentLocation: deploymentLocation?.length > 0,
        moduleRepositoryKey: moduleRepository?.key,
        modulesGroup:
          modulesGroup && moduleRepository?.key
            ? {
                repositoryKey: moduleRepository?.key,
                moduleKeys: modulesGroup.map(module => module.key),
              }
            : null,
        applicationType: applicationType?.value,
        estimatedUsersNumber: estimatedUsersNumber?.value,
        estimatedRevenue: estimatedRevenue?.value,
        complianceRequirements: complianceRequirements
          ?.filter(item => item !== undefined && item !== null)
          .map(item => item.value),
      },
      ApplicationProfiles.createEmptyConfiguration()
    );
  }

  static createEmptyConfiguration(): Configuration {
    return {
      key: crypto.randomUUID(),
      repositoryKeys: [],
      projectKeys: [],
      repositoryGroups: [],
      apiGatewayKeys: [],
      apisGroupKeys: [],
      pointsOfContact: [],
      businessImpact: 'None',
      businessImpactLevel: 'None',
      deploymentLocation: 'None',
      moduleRepositoryKey: null,
      modulesGroup: null,
      applicationType: 'None',
      estimatedUsersNumber: 'Undefined',
      estimatedRevenue: 'Undefined',
      complianceRequirements: [],
    };
  }

  static transformConfigurationOptions(
    optionsMap: StubAny,
    configuration: StubAny[] = [],
    recommendations: StubAny[] = []
  ) {
    return _.uniq(configuration.concat(recommendations))
      .filter(optionKey => optionsMap.has(optionKey))
      .map(optionKey => ({
        ...optionsMap.get(optionKey),
        isHighlight: recommendations.includes(optionKey),
        isRecommended: recommendations.includes(optionKey),
      }));
  }

  // This is the new function to transform data with no optionsMap
  static transformConfigurationsWithoutOptions(
    configuration: StubAny[] = [],
    recommendations: StubAny[] = []
  ) {
    return _.uniq(configuration.concat(recommendations)).map(option => ({
      ...option,
      isHighlight: recommendations.map(({ key }) => key).includes(option.key),
      isRecommended: recommendations.map(({ key }) => key).includes(option.key),
    }));
  }

  async searchRepositories({
    applicationKey,
    ...params
  }: SearchParams & {
    applicationKey: string;
  }): Promise<AggregationResult<RepositoryProfileResponse>> {
    return await this.#client.search(
      `assetCollections/v2/${applicationKey}/repositories/search`,
      params
    );
  }

  async getFilterOptions(): Promise<Filter[]> {
    return await this.#client
      .get(`assetCollections/repositories/filterOptions`)
      .then((options: any[]) =>
        _.orderBy(options, [
          option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
          'displayName',
        ]).map(item => transformFilterGroups(item))
      );
  }

  async fetchPointOfContactDeveloper(pointOfContact: LeanPointOfContact): Promise<any> {
    try {
      const developer = await this.#client.get(
        `developers/${pointOfContact.representativeIdentityKeySha}`
      );

      return {
        identityKey: pointOfContact.representativeIdentityKeySha,
        jobTitle: pointOfContact.title,
        username: developer?.displayName,
        avatarUrl: developer?.avatarUrl,
        developer: {
          identityKey: pointOfContact.representativeIdentityKeySha,
          username: developer?.displayName,
        },
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          identifyKey: pointOfContact.representativeIdentityKeySha,
          username: 'N/A',
          jobTitle: pointOfContact.title,
          faulted: true,
        };
      }

      throw error;
    }
  }
}
