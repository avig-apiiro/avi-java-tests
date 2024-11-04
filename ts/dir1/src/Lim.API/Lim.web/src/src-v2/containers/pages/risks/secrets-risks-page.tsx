import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { RisksFunnel } from '@src-v2/containers/risks/funnels/risks-funnel';
import { RisksFunnelDataProvider } from '@src-v2/containers/risks/funnels/risks-funnel-data-provider';
import { RisksFunnelDrawer } from '@src-v2/containers/risks/funnels/risks-funnel-drawer';
import { RisksContext, TableRiskType } from '@src-v2/containers/risks/risks-context';
import { SecretRisksTable } from '@src-v2/containers/risks/secrets/secrets-table';
import { tableColumns } from '@src-v2/containers/risks/secrets/secrets-table-content';
import { risksFunnelColors } from '@src-v2/data/risks-funnel';
import { useInject } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default observer(() => {
  const { application, secretsRisks } = useInject();
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
            risksService={secretsRisks}
            title="Secrets risks"
            tableColumns={tableColumns}
            tableRiskType={TableRiskType.Secrets}>
            {!application.isFeatureEnabled(FeatureFlag.DisableRisksFunnel) && (
              <RisksFunnelDataProvider storagePrefix="secrets">
                <RisksFunnelDrawer>
                  <AsyncBoundary>
                    <RisksFunnel
                      suspendFilterOptions
                      dataFetcher={secretsRisks.searchFunneledRisksCount}
                      colorsMapper={risksFunnelColors.bySeverity}
                      onLegendClick={handleLegendClick}
                    />
                  </AsyncBoundary>
                </RisksFunnelDrawer>
              </RisksFunnelDataProvider>
            )}
            <SecretRisksTable />
          </RisksContext>
        </AsyncBoundary>
      </Gutters>
    </Page>
  );
});
