import { useMemo } from 'react';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { TabsRouter, TabsRouterProps } from '@src-v2/components/tabs/tabs-router';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DownloadSBOMButton } from '@src-v2/containers/inventory/download-sbom-button';
import { getApplicationsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/applications-route-definition';
import { getComponentsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/components-route-definition';
import { getContributorsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/contributors-route-definition';
import { getControlsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/controls-route-definition';
import { getDataRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/data-route-definition';
import { getInfrastructureRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/infrastructure-route-definition';
import { getOverviewRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/overview-route-definition';
import { getProjectsRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/projects-route-definition';
import { getRepositoryRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/repository-route-definition';
import { getSupplyChainRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/supply-chain-route-definition';
import { getTrackedIssuesRouteDefinition } from '@src-v2/containers/inventory/inventory-tabs/tracked-issues-route-definition';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';

export type LegacyInventoryConsumableProfile = any;

export interface InventoryTabProps {
  profile: LegacyInventoryConsumableProfile;
  profileType: ProfileType;
}

export const InventoryTabs = ({ routes, ...props }: TabsRouterProps) => {
  const asyncRoutes = useMemo(() => {
    return routes.map(route => ({
      ...route,
      render: () => <AsyncBoundary>{route.render()}</AsyncBoundary>,
    }));
  }, [routes]);

  return (
    <TabsContainer>
      <TabsRouter {...props} routes={asyncRoutes} />
    </TabsContainer>
  );
};

const TabsContainer = styled.div`
  margin-top: 4rem;
`;

export function InventoryV2(props: InventoryTabProps) {
  const { application } = useInject();
  const isRepository = props.profileType === ProfileType.Repository;
  const isAssetCollection = props.profileType === ProfileType.AssetCollection;
  const isModule = props.profileType === ProfileType.Module;
  const { isModuleBased } = props.profile;
  const shouldEnableAppProjectsTable =
    isAssetCollection &&
    (!isModuleBased || application.isFeatureEnabled(FeatureFlag.MonorepoProjects));
  const routes = useMemo(
    () =>
      [
        getOverviewRouteDefinition(props),
        getComponentsRouteDefinition(props),
        getControlsRouteDefinition(props),
        getDataRouteDefinition(props),
        getInfrastructureRouteDefinition(props),
        !isRepository && getTrackedIssuesRouteDefinition(props),
        (isRepository || !isModuleBased) &&
          getContributorsRouteDefinition({
            ...props,
            shouldShowPermissionColumn: isRepository,
          }),
        isRepository && getApplicationsRouteDefinition(props),
        (isRepository || shouldEnableAppProjectsTable) && getProjectsRouteDefinition(props),
        application.isFeatureEnabled(FeatureFlag.PipelineTables) &&
          getSupplyChainRouteDefinition(props),
        !isRepository && !isModule && getRepositoryRouteDefinition(props),
      ].filter(Boolean),
    [props]
  );

  return (
    <InventoryTabs
      variant={Variant.SECONDARY}
      routes={routes}
      actions={
        [ProfileType.AssetCollection, ProfileType.Repository].includes(props.profileType) && (
          <DownloadSBOMContainer>
            <DownloadSBOMButton profileKey={props.profile.key} profileType={props.profileType} />
          </DownloadSBOMContainer>
        )
      }
    />
  );
}

const DownloadSBOMContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;
