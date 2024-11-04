import { ConsumableDataFunnel } from '@src-v2/components/data-funnel/consumable-data-funnel';
import { useInject } from '@src-v2/hooks';

export const RepositoriesFunnel = () => {
  const { repositoryProfiles } = useInject();

  return (
    <ConsumableDataFunnel
      label="All repositories"
      filtersDataFetcher={repositoryProfiles.getFunnelFilters}
      segmentsDataFetcher={repositoryProfiles.searchFunneledRepositoriesCount}
    />
  );
};
