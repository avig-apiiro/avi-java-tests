import { ReactNode, createContext, useContext } from 'react';
import { Risks } from '@src-v2/services';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { Column } from '@src-v2/types/table';

export const enum TableRiskType {
  Sast = 'sast',
  SupplyChain = 'supplyChain',
  Api = 'api',
  Oss = 'oss',
  Secrets = 'secrets',
  ArtifactDependencyFindings = 'artifactDependencyFindings',
}

const Context = createContext<{
  title: string;
  baseUrl: string;
  risksService: Risks;
  tableColumns?: Column<RiskTriggerSummaryResponse>[];
  tableRiskType?: string;
}>(null);

export function RisksContext({
  risksService,
  baseUrl = '/risks',
  title,
  tableColumns,
  tableRiskType,
  children,
}: {
  baseUrl?: string;
  risksService: Risks;
  children: ReactNode;
  title?: string;
  tableColumns?: Column<RiskTriggerSummaryResponse>[];
  tableRiskType?: TableRiskType;
}) {
  return (
    <Context.Provider value={{ title, risksService, tableColumns, baseUrl, tableRiskType }}>
      {children}
    </Context.Provider>
  );
}

export function useRisksContext() {
  return useContext(Context);
}
