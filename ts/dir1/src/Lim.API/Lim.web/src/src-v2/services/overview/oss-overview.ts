import { transformLegacyFilters } from '@src-v2/services';
import { BaseOverviewService } from '@src-v2/services/overview/base-overview-service';
import { ExploitMaturity } from '@src-v2/types/inventory-elements';
import { Severity } from '@src-v2/types/overview/overview-responses';
import { LeanApplication } from '@src-v2/types/profiles/lean-application';
import { StubAny } from '@src-v2/types/stub-any';

export interface ExploitableVulnerabilities {
  vulnerabilities: string[];
  severity: Severity;
  cvssScore: number;
  epssScore: number;
  exploitMaturity: ExploitMaturity;
  packageName: string;
  applications: LeanApplication[];
  risks: any;
  description: string;
  pocReferences: Record<string, string[]>;
}

export class OssOverview extends BaseOverviewService {
  constructor({ apiClient, organization }: StubAny) {
    super({ apiClient, organization, baseUrl: 'oss-dashboard' });
  }

  getTopExploitableVulnerabilities({
    filters,
  }: {
    filters: any;
  }): Promise<ExploitableVulnerabilities[]> {
    return this.client.get(`${this.baseUrl}/top-exploitable-cves`, {
      params: { filters: transformLegacyFilters(filters) },
      shouldTransformDates: true,
    });
  }
}
