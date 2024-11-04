import { AxiosResponse } from 'axios';
import _ from 'lodash';
import { sortOrderUnsorted } from '@src-v2/data/filters';
import { transformFilterGroups } from '@src-v2/data/transformers';
import { ApiClient, SearchParams } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import {
  BaseDataModelReference,
  FindingDataModelReference,
} from '@src-v2/types/data-model-reference/data-model-reference';
import { LegacyFilterGroup } from '@src-v2/types/filters/legacy-filters';
import { LightweightFindingResponse } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { Severity } from '@src-v2/types/overview/overview-responses';
import { FindingComponent } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StubAny } from '@src-v2/types/stub-any';

export interface ManualFindingResponse {
  key: string;
  findingComponents: FindingComponent[];
  rawFindingKey: string;
  severity: Severity;
  status: string;
  name: string;
  findingDataModelReference: FindingDataModelReference;
  reportName: string;
}

interface RemediationUpload {
  description?: string;
  title: string;
}

interface GlobalIdentifierRequest {
  type: string;
  identifier: string;
}

export interface ActorRequest {
  name: string;
  email: string;
  isStaff: boolean | null;
  role: 'Reporter' | 'Submitter' | 'Assignee';
}

interface CvssRequest {
  version: string;
  score: string;
  vector: string | null;
}

export interface AssetRequest {
  role: 'Subject' | 'Related' | 'Affected';
  type: string;
  dataModelId?: string | null;
  name: string;
  importance: 'Low' | 'Medium' | 'High' | 'NoData';
  ips: string[];
  tags: object;
}

interface EvidenceDescription {
  description: string;
}

interface EvidenceHttpRequest {
  url: string;
  method: string;
  headers: { name: string; value: string }[];
}

export interface ManualFindingRequest {
  title: string;
  description: string;
  discoveredOn: string | Date;
  severity: string;
  remediation: RemediationUpload;
  status: string;
  impact: string | null;
  globalIssueIdentifiers: GlobalIdentifierRequest[];
  cvss: CvssRequest;
  actors: ActorRequest[];
  assets: AssetRequest[];
  tags: object;
  reportName: string | null;
  evidencesGeneral: EvidenceDescription[];
  evidencesHttpRequest: EvidenceHttpRequest[];
  links: string[];
}

export class Findings {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  async create(data: ManualFindingRequest) {
    await this.#client.post('manuallyUploadedFindings/create', data);
    await this.#asyncCache.invalidateAll(this.searchManualFindings);
  }

  getFinding(dataModelReference: BaseDataModelReference): Promise<LightweightFindingResponse> {
    return this.#client.get('findings', {
      params: {
        dataModelReference: JSON.stringify(dataModelReference),
      },
    });
  }

  async searchManualFindings(
    params: SearchParams
  ): Promise<AggregationResult<ManualFindingResponse>> {
    return await this.#client.search(`manuallyUploadedFindings/search`, params);
  }

  async uploadManualFindingsCsv(props: StubAny) {
    const formData = new FormData();
    const data = { ...props };

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string | Blob);
    });
    const results = await this.#client.post<{ Warnings: StubAny }>(
      'manuallyUploadedFindings/uploadCsv',
      formData
    );
    this.#asyncCache.invalidateAll(this.searchManualFindings);
    return results;
  }

  downloadCsvTemplate(): Promise<AxiosResponse> {
    return this.#client.get('manuallyUploadedFindings/downloadCsvTemplate', {
      noInterceptor: true,
      responseType: 'blob',
    });
  }

  async getManualFinding({ key }: { key: string }) {
    if (!key) {
      return null as ManualFindingRequest;
    }
    return await this.#client.get<ManualFindingRequest>(`manuallyUploadedFindings/${key}`);
  }

  async update(key: string, finding: ManualFindingRequest) {
    await this.#client.post(`manuallyUploadedFindings/${key}`, finding);
    await this.#asyncCache.invalidateAll(this.searchManualFindings);
    await this.#asyncCache.invalidateAll(this.getManualFinding);
    await this.#asyncCache.invalidateAll(this.getFinding);
  }

  async deleteFinding(key: string | string[]) {
    const keys = Array.isArray(key) ? key : [key];
    const queryParams = new URLSearchParams();
    keys.forEach((findingKey, index) => {
      queryParams.append(`findingKeys[${index}]`, findingKey);
    });

    await this.#client.delete(`manuallyUploadedFindings?${queryParams.toString()}`);
    await this.#asyncCache.invalidateAll(this.searchManualFindings);
  }

  async getFilterOptions() {
    const filterOptions = await this.#client.get<LegacyFilterGroup[]>(
      'manuallyUploadedFindings/filterOptions'
    );
    return _.orderBy(filterOptions, [
      option => (option.sortOrder === null ? sortOrderUnsorted : option.sortOrder),
      'displayName',
    ]).map(transformFilterGroups);
  }
}
