import _ from 'lodash';
import { DoughnutData } from '@src-v2/components/charts/doughnut-chart/types';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { Filter } from '@src-v2/hooks/use-filters';
import { ApiClient, SearchParams, transformLegacyFilters } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { EntityType } from '@src-v2/types/enums/entity-type';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { RiskTriggerElementType } from '@src-v2/types/enums/risk-trigger-element-type';
import { DependencyElement, EntityEvent, SecretElement } from '@src-v2/types/inventory-elements';
import { ApiElementResponse } from '@src-v2/types/inventory-elements/api/api-element-response';
import { Finding } from '@src-v2/types/inventory-elements/api/api-findings-summary';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { BranchProtectionElement } from '@src-v2/types/inventory-elements/branch-protection-element';
import { InactiveRepositoryAdminElement } from '@src-v2/types/inventory-elements/inactive-repository-admin-element-response';
import { InactiveRepositoryContributorElement } from '@src-v2/types/inventory-elements/inactive-repository-contributor-element-response';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanOrgTeamWithPointsOfContact } from '@src-v2/types/profiles/lean-org-team';
import { StubAny } from '@src-v2/types/stub-any';

export type GetInventoryParams = { shouldTransformDates?: boolean } & (
  | {
      elementKey: string;
      profileKey: string;
      profileType?: string;
      elementType?: keyof typeof RiskTriggerElementType;
    }
  | { reference: DiffableEntityDataModelReference }
);

interface InventoryParamsV2 {
  profileKey: string;
  profileType: ProfileType;
  entityType: EntityType;
}

export type SearchInventoryDataParams<T extends BaseElement> = InventoryParamsV2 &
  Partial<SearchParams> & {
    enrichPage?: (
      items: InventoryElementCollectionRow<T>[]
    ) => Promise<InventoryElementCollectionRow<T>[]>;
  };

export class Inventory {
  #client: ApiClient;
  protected application: Application;

  constructor({ apiClient, application }: { apiClient: ApiClient; application: Application }) {
    this.#client = apiClient;
    this.application = application;
  }

  getTerraformHighlights({
    repositoryKey,
    modulePath,
  }: {
    repositoryKey: string;
    modulePath: string;
  }) {
    return this.#client.get(`repositories/terraformHighlights`, {
      params: { repositoryKey, modulePath },
    });
  }

  getEntityProfileEvents({
    repositoryKey,
    entityKey,
    entityType,
  }: {
    repositoryKey: string;
    entityKey: string;
    entityType: EntityType;
  }): Promise<EntityEvent[]> {
    if (entityType === EntityType.None) {
      return Promise.resolve([]);
    }

    return this.#client.get(`repositories/v2/${repositoryKey}/entityEvents`, {
      params: {
        entityKey,
        entityType,
      },
    });
  }

  async getElementContext({
    dataModelReference,
  }: {
    dataModelReference: DiffableEntityDataModelReference;
  }): Promise<{
    relatedProfile: LeanConsumableProfile;
    applications: LeanApplication[];
    orgTeams: LeanOrgTeamWithPointsOfContact[];
  }> {
    return await this.#client.get('inventory/elements/context', {
      params: {
        profileKey: dataModelReference.containingProfileId,
        profileType: dataModelReference.containingProfileType,
      },
    });
  }

  getInventoryElement(inventoryParams: GetInventoryParams): Promise<BaseElement> {
    if ('reference' in inventoryParams && inventoryParams.reference) {
      return this.getElementFromDiffableReference({ reference: inventoryParams.reference });
    }

    if ('elementKey' in inventoryParams) {
      return this.getLegacyElement({
        profileKey: inventoryParams?.profileKey,
        profileType: inventoryParams?.profileType,
        elementKey: inventoryParams?.elementKey,
        elementType: inventoryParams?.elementType,
      });
    }

    throw new Error('Invalid inventory parameters');
  }

  private getLegacyElement({
    profileKey,
    profileType,
    elementKey,
    elementType,
  }: {
    profileKey: string;
    profileType: string;
    elementKey: string;
    elementType: keyof typeof RiskTriggerElementType;
  }): Promise<BaseElement> {
    return this.#client.get('inventory/elements/v2', {
      params: {
        profileKey,
        profileType,
        elementType,
        elementKey,
      },
    });
  }

  private getElementFromDiffableReference({
    reference,
  }: {
    reference: DiffableEntityDataModelReference;
  }): Promise<BaseElement> {
    return this.#client.post('inventory/elements/getElementFromReference', {
      ...reference,
    });
  }

  async getMonitoringStatus(): Promise<DoughnutData[]> {
    const [{ count: monitored }, { total }] = await Promise.all([
      this.#client.get(`repositories/monitoredCountAndSize`),
      this.#client.get(`repositories/search`),
    ]);

    return [
      { key: 'Monitored', count: monitored },
      { key: 'Unmonitored', count: total - monitored },
    ];
  }

  getDependencyElement(params: GetInventoryParams): Promise<DependencyElement> {
    return this.#getElement<DependencyElement>('dependencies', { inventoryParams: params });
  }

  getPipelineDependencyElement(params: GetInventoryParams): Promise<DependencyElement> {
    return this.#getElement<DependencyElement>('pipelineDependencies', { inventoryParams: params });
  }

  async getSecretElement(params: GetInventoryParams): Promise<SecretElement> {
    const element: SecretElement = await this.#getElement('secrets', { inventoryParams: params });
    element.validatedOn = element.validatedOn ? new Date(element.validatedOn) : undefined;
    return element;
  }

  getApiElement(params: GetInventoryParams): Promise<ApiElementResponse> {
    return this.#getElement('apis', { inventoryParams: params });
  }

  getApiFindingElement(params: GetInventoryParams): Promise<Finding> {
    return this.#getElement('apiFindings', { inventoryParams: params });
  }

  getInactiveRepositoryContributorElement(
    params: GetInventoryParams
  ): Promise<InactiveRepositoryContributorElement> {
    return this.#getElement('inactiveContributors', {
      inventoryParams: { ...params, shouldTransformDates: true },
    });
  }

  getInactiveRepositoryAdminElement(
    params: GetInventoryParams
  ): Promise<InactiveRepositoryAdminElement> {
    return this.#getElement('inactiveAdmins', { inventoryParams: params });
  }

  getBranchProtectionElement(params: GetInventoryParams): Promise<BranchProtectionElement> {
    return this.#getElement('branchProtection', { inventoryParams: params });
  }

  async searchInventoryData<T extends BaseElement = BaseElement>({
    profileKey,
    profileType,
    entityType,
    enrichPage,
    ...params
  }: SearchInventoryDataParams<T>) {
    const { items, ...searchState } = await this.#client.search<InventoryElementCollectionRow<T>>(
      `inventory/elements/${profileKey}/${profileType}/${entityType}/search`,
      params
    );

    return {
      ...searchState,
      items: enrichPage ? await enrichPage(items) : items,
    };
  }

  async getFilteredCounterInventoryData<T extends BaseElement = BaseElement>({
    profileKey,
    profileType,
    entityType,
    filters,
    ...params
  }: SearchInventoryDataParams<T>): Promise<number> {
    return await this.#client.get(
      `inventory/elements/${profileKey}/${profileType}/${entityType}/filteredCount`,
      {
        params: { ...params, tableFilterToQuery: transformLegacyFilters(filters) },
      }
    );
  }

  async getTotalCounterInventoryData<T extends BaseElement = BaseElement>({
    profileKey,
    profileType,
    entityType,
  }: SearchInventoryDataParams<T>): Promise<number> {
    return await this.#client.get(
      `inventory/elements/${profileKey}/${profileType}/${entityType}/totalCount`
    );
  }

  async exportInventoryData<T extends BaseElement = BaseElement>({
    profileKey,
    profileType,
    entityType,
    filters,
    ...params
  }: SearchInventoryDataParams<T>) {
    return await this.#client.downloadBlob(
      `inventory/elements/${profileKey}/${profileType}/${entityType}/export`,
      { ...params, filters: transformLegacyFilters(filters) }
    );
  }

  async getInventoryFilterOptions({
    profileKey,
    profileType,
    entityType,
  }: InventoryParamsV2): Promise<Filter[]> {
    return await this.#client
      .get(`inventory/elements/${profileKey}/${profileType}/${entityType}/filterOptions`)
      .then(options =>
        _.orderBy(options, [
          option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
          'displayName',
        ]).map(item => transformFilterGroups(item))
      );
  }

  #getElement<T>(
    elementsPath: string,
    {
      inventoryParams,
    }: {
      inventoryParams: GetInventoryParams;
    }
  ): Promise<T> {
    const shouldTransformDates = inventoryParams.shouldTransformDates ?? false;
    let params: StubAny;

    if ('reference' in inventoryParams && inventoryParams.reference) {
      params = {
        elementKey: inventoryParams.reference?.diffableEntityId,
        profileKey: inventoryParams.reference?.containingProfileId,
        profileType: inventoryParams.reference?.containingProfileType,
      };
    }

    if ('elementKey' in inventoryParams) {
      params = {
        elementKey: inventoryParams.elementKey,
        profileKey: inventoryParams.profileKey,
        profileType: inventoryParams.profileType,
      };
    }

    return this.#client.get<T>(`inventory/elements/${elementsPath}`, {
      params,
      shouldTransformDates,
    });
  }
}
