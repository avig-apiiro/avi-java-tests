import { ReactNode } from 'react';
import { FunnelFiltersDataProvider } from '@src-v2/components/charts/funnel-chart/funnel-filters-data-context';
import { useRisksContext } from '@src-v2/containers/risks/risks-context';

export function RisksFunnelDataProvider({
  storagePrefix,
  children,
}: {
  storagePrefix?: string;
  children: ReactNode;
}) {
  const { risksService } = useRisksContext();
  return (
    <FunnelFiltersDataProvider
      storagePrefix={storagePrefix}
      dataFetcher={risksService.getFunnelFilters}>
      {children}
    </FunnelFiltersDataProvider>
  );
}
