import { ConsumableDataFunnel } from '@src-v2/components/data-funnel/consumable-data-funnel';
import { useInject } from '@src-v2/hooks';

export const ApplicationsFunnel = () => {
  const { applicationProfilesV2 } = useInject();

  return (
    <ConsumableDataFunnel
      label="All applications"
      filtersDataFetcher={applicationProfilesV2.getFunnelFilters}
      segmentsDataFetcher={applicationProfilesV2.searchFunneledApplicationsCount}
    />
  );
};
