import { first } from 'lodash';
import sortBy from 'lodash/sortBy';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { ClusterGraph } from '@src-v2/containers/entity-pane/exposure-path/cluster-graph';
import { ExposurePathCardV2 } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card-v2';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { pocInsightsData } from '@src-v2/utils/exposure-path-poc';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { openShowOnClusterMap } from '@src/cluster-map-work/containers/panes/ShowOnClusterClusterMap';

export const ExposurePathCard = (props: ControlledCardProps) => {
  const { application } = useInject();
  const { risk } = useEntityPaneContext();

  return application.isFeatureEnabled(FeatureFlag.ExposurePathV2) ? (
    risk.exposurePath ? (
      <ExposurePathCardV2 {...props} />
    ) : null
  ) : (
    <ExposurePathCardV1 {...props} />
  );
};

const ExposurePathCardV1 = (props: ControlledCardProps) => {
  const { rbac, application } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const { risk } = useEntityPaneContext();
  const paneState = usePaneState();

  const shouldShowExposurePathRiskyTickets =
    application.isFeatureEnabled(FeatureFlag.PocExposurePathRiskyTickets) &&
    risk.riskType === 'Issue';

  const internetExposedInsight = useMemo(() => {
    if (shouldShowExposurePathRiskyTickets) {
      return pocInsightsData('Internet exposed');
    }
    return risk.insights.find(insight => insight.badge === 'Internet exposed');
  }, [shouldShowExposurePathRiskyTickets, pocInsightsData, risk]);

  const internetExposedInsightReason = useMemo(
    () =>
      internetExposedInsight?.insights?.reasons?.find(reason =>
        Boolean(reason.insights?.clusterInsights?.length)
      ),
    [risk]
  );

  const deployedInsight = useMemo(() => {
    if (shouldShowExposurePathRiskyTickets) {
      return pocInsightsData('Deployed');
    }
    return risk.insights.find(insight => insight.badge === 'Deployed');
  }, [risk]);

  const deployedInsightReason = useMemo(
    () =>
      deployedInsight?.insights?.reasons?.find(reason =>
        Boolean(reason.insights?.clusterInsights?.length)
      ),
    [risk]
  );

  const clusterInsights = first(
    sortBy(
      internetExposedInsightReason?.insights?.clusterInsights ||
        deployedInsightReason?.insights?.clusterInsights,
      clusterInsight =>
        clusterInsight.insight?.exposedBy?.find(
          exposedBy => exposedBy.resourceName?.typeName === 'Ingress'
        )
    )
  );
  const containerNodeTitle = clusterInsights?.resourceName?.name;

  const handleShowOnCluster = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Show on cluster',
    });
    openShowOnClusterMap(
      {
        annotatedRepositoryAndModuleReferences: [risk],
        title: risk.riskName,
        selectedNode: containerNodeTitle,
      },
      paneState
    );
  }, [risk, containerNodeTitle]);

  const { containersCount, ingressesCount, externalGatewaysCount } =
    internetExposedInsightReason?.insights ?? deployedInsightReason?.insights ?? {};

  return (
    <ControlledCard {...props} title="Exposure path">
      <EvidenceAndClusterLine>
        <EvidenceLine label="Showing 1 path" isExtendedWidth />
        {rbac.canEdit(resourceTypes.Global) && !shouldShowExposurePathRiskyTickets && (
          <TextButton onClick={handleShowOnCluster} underline>
            Show on cluster
          </TextButton>
        )}
      </EvidenceAndClusterLine>
      <EvidenceLine label="Also found on">
        {containersCount} {pluralFormat(containersCount, 'container', 'containers')}
        {ingressesCount > 0 ? (
          <>
            {' '}
            with {ingressesCount} {pluralFormat(ingressesCount, 'ingress', 'ingresses')}
          </>
        ) : (
          externalGatewaysCount > 0 && (
            <>
              {' '}
              with {externalGatewaysCount}{' '}
              {pluralFormat(externalGatewaysCount, 'external gateway', 'external gateways')}
            </>
          )
        )}
      </EvidenceLine>
      <ClusterGraph />
    </ControlledCard>
  );
};

const EvidenceAndClusterLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  ${EvidenceLine} {
    margin-bottom: 2rem;
  }
`;
