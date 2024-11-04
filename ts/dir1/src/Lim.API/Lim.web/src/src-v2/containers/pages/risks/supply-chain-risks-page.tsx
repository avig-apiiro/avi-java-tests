import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { tableColumns } from '@src-v2/containers/risks/all-risks/all-risks-table-content';
import { RisksFunnel } from '@src-v2/containers/risks/funnels/risks-funnel';
import { RisksFunnelDataProvider } from '@src-v2/containers/risks/funnels/risks-funnel-data-provider';
import { RisksFunnelDrawer } from '@src-v2/containers/risks/funnels/risks-funnel-drawer';
import { RisksContext, TableRiskType } from '@src-v2/containers/risks/risks-context';
import { SupplyChainRisksTable } from '@src-v2/containers/risks/supply-chain/supply-chain-risks-table';
import { risksFunnelColors } from '@src-v2/data/risks-funnel';
import { useInject } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default observer(() => {
  const { application, supplyChainRisks } = useInject();
  const { updateFilters } = useFilters();

  const handleLegendClick = useCallback(
    (legend: string) =>
      updateFilters({
        key: 'RiskLevel',
        value: [legend],
      }),
    [updateFilters]
  );

  return (
    <Page>
      <Gutters data-top-spacing>
        <AsyncBoundary>
          <RisksContext
            risksService={supplyChainRisks}
            title="Supply chain risks"
            tableColumns={tableColumns}
            tableRiskType={TableRiskType.SupplyChain}>
            {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) && (
              <RisksFunnelDataProvider storagePrefix="supply-chain">
                <RisksFunnelDrawer>
                  <AsyncBoundary>
                    <RisksFunnel
                      suspendFilterOptions
                      dataFetcher={supplyChainRisks.searchFunneledRisksCount}
                      colorsMapper={risksFunnelColors.bySeverity}
                      onLegendClick={handleLegendClick}
                    />
                  </AsyncBoundary>
                </RisksFunnelDrawer>
              </RisksFunnelDataProvider>
            )}
            <SupplyChainRisksTable />
          </RisksContext>
        </AsyncBoundary>
      </Gutters>
    </Page>
  );
});
