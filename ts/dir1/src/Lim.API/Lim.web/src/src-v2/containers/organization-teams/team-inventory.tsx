import { useMemo } from 'react';
import styled from 'styled-components';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DownloadSBOMButton } from '@src-v2/containers/inventory/download-sbom-button';
import { getContributorsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/contributors-route-definition';
import { getProjectsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/projects-route-definition';
import { getRepositoryRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/repository-route-definition';
import { getSupplyChainRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/supply-chain-route-definition';
import { getTeamApplicationsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/team-applications-route-definition';
import { getTrackedIssuesRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/tracked-issues-route-definition';
import { InventoryTabProps, InventoryTabs } from '@src-v2/containers/inventory/inventory-v2';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function TeamInventory(props: InventoryTabProps) {
  const { application } = useInject();
  const routes = useMemo(
    () =>
      [
        getRepositoryRouteDefinition(props),
        getTeamApplicationsRouteDefinition(props),
        getProjectsRouteDefinition(props),
        getTrackedIssuesRouteDefinition(props),
        application.isFeatureEnabled(FeatureFlag.PipelineTables) &&
          getSupplyChainRouteDefinition(props),
        getContributorsRouteDefinition(props),
      ].filter(Boolean),
    [props]
  );

  return (
    <InventoryTabs
      variant={Variant.SECONDARY}
      routes={routes}
      actions={
        <DownloadSBOMContainer>
          <DownloadSBOMButton profileKey={props.profile.key} profileType={props.profileType} />
        </DownloadSBOMContainer>
      }
    />
  );
}

const DownloadSBOMContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
