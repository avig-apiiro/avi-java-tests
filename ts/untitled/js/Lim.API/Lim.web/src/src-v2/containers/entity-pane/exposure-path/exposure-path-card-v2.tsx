import { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  AnalyticsLayer,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1 } from '@src-v2/components/typography';
import { ExposurePath } from '@src-v2/containers/entity-pane/exposure-path/exposure-path';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useResizeObserver } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { openShowOnClusterMap } from '@src/cluster-map-work/containers/panes/ShowOnClusterClusterMap';

export const ExposurePathCardV2 = (props: ControlledCardProps) => {
  const { rbac, application } = useInject();
  const { risk } = useEntityPaneContext();
  const trackAnalytics = useTrackAnalytics();
  const paneState = usePaneState();

  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(null);

  const shouldShowExposurePathRiskyTickets =
    application.isFeatureEnabled(FeatureFlag.PocExposurePathRiskyTickets) &&
    risk.riskType === 'Issue';

  const shouldShowOnClusterButton = useMemo(
    () =>
      risk?.insights.some(
        insight => insight.badge === 'Internet exposed' || insight.badge === 'Deployed'
      ),
    [risk]
  );

  const handleShowOnCluster = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Show on cluster',
    });
    openShowOnClusterMap(
      {
        annotatedRepositoryAndModuleReferences: [risk],
        title: risk.riskName,
        selectedNode: risk.exposurePath.clusterInsights.resourceName.name,
      },
      paneState
    );
  }, [risk]);

  useResizeObserver(
    containerRef,
    useCallback(({ contentRect }) => {
      if (contentRect.width !== containerWidth) {
        setContainerWidth(contentRect.width);
      }
    }, [])
  );

  const { containersCount, ingressesCount, accountsCount, accountId } = risk.exposurePath;

  return (
    <AnalyticsLayer
      analyticsData={{
        [AnalyticsDataField.EntryPoint]: 'Exposure path',
        [AnalyticsDataField.RiskCategory]: risk.riskCategory,
        [AnalyticsDataField.ExposurePathExposure]: risk.exposurePath.analyticsExposure,
        [AnalyticsDataField.Context]: risk.riskName,
      }}>
      <ControlledCard {...props} title="Exposure path" defaultOpen>
        <ExposurePathContainer ref={containerRef}>
          {rbac.canEdit(resourceTypes.Global) &&
            shouldShowOnClusterButton &&
            !shouldShowExposurePathRiskyTickets && (
              <TopLine>
                <ShowOnCluster
                  onClick={handleShowOnCluster}
                  underline
                  showArrow="internal"
                  size={Size.XXSMALL}>
                  Show on cluster
                </ShowOnCluster>
              </TopLine>
            )}
          {containerWidth && (
            <ExposurePath exposurePath={risk.exposurePath} canvasWidth={containerWidth} />
          )}
        </ExposurePathContainer>
        <BottomLineContainer>
          <Caption1>Showing 1 path</Caption1>
          {accountId && <Caption1> for account ID: {accountId}</Caption1>}
          {(containersCount > 0 || ingressesCount > 0) && (
            <>
              <DotSeparator />
              <Caption1>Also found on: </Caption1>
              {containersCount > 0 && (
                <Caption1>
                  {containersCount} {pluralFormat(containersCount, 'container')}
                </Caption1>
              )}
              {containersCount > 0 && ingressesCount > 0 && <Caption1>with </Caption1>}
              {ingressesCount > 0 && (
                <Caption1>
                  {ingressesCount} {pluralFormat(ingressesCount, 'ingress')}
                </Caption1>
              )}
              {accountsCount > 0 && (
                <Caption1>
                  in {accountsCount} {pluralFormat(accountsCount, 'account')}
                </Caption1>
              )}
            </>
          )}
        </BottomLineContainer>
      </ControlledCard>
    </AnalyticsLayer>
  );
};

const DotSeparator = styled.label`
  margin: 0 3rem;

  &:after {
    content: ' \\B7 ';
  }
`;

const ExposurePathContainer = styled.div`
  height: 98rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--color-blue-gray-30);
  border-radius: 12px 12px 0 0;
  border-bottom: none;
`;

const BottomLineContainer = styled.div`
  height: 6rem;
  display: flex;
  padding-left: 4rem;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-blue-gray-30);
  border-radius: 0 0 12px 12px;
`;

const ShowOnCluster = styled(TextButton)`
  width: 34rem;
  height: 8rem;
  color: var(--color-blue-gray-60);
  border-bottom: 0.25rem solid var(--color-blue-gray-30);
  border-left: 0.25rem solid var(--color-blue-gray-30);
  background-color: var(--color-white);
  border-radius: 0 12px 0 12px;
  padding: 2rem 3rem;
`;

const TopLine = styled.div`
  width: 100%;
  position: absolute;
  display: flex;

  ${ShowOnCluster} {
    margin-left: auto;
    z-index: 1;
  }
`;
