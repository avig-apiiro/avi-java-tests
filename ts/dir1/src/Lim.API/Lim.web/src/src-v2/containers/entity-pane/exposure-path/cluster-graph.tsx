import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { CodeBadge } from '@src-v2/components/badges';
import { VendorState } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { Size } from '@src-v2/components/types/enums/size';
import {
  ClusterGraphNode,
  DashedLineWithTitle,
} from '@src-v2/containers/entity-pane/exposure-path/cluster-graph-node';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { DependencyElement, SecretElement } from '@src-v2/types/inventory-elements';
import { ApiElementResponse } from '@src-v2/types/inventory-elements/api/api-element-response';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { CodeFindings } from '@src-v2/types/inventory-elements/code-findings';
import { ApiRiskTriggerSummary } from '@src-v2/types/risks/risk-types/api-risk-trigger-summary';
import {
  ContainerToCodeMatchingMock,
  DashedLineWithTitleAndGraphTooltip,
  getRepositoryRiskyTickets,
  pocInsightsData,
} from '@src-v2/utils/exposure-path-poc';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export const ClusterGraph = () => {
  const { application } = useInject();
  const { element, relatedProfile, risk } = useEntityPaneContext();

  const shouldShowExposurePathRiskyTickets =
    application.isFeatureEnabled(FeatureFlag.PocExposurePathRiskyTickets) &&
    risk.riskType === 'Issue';

  const internetExposedInsight = useMemo(() => {
    if (shouldShowExposurePathRiskyTickets) {
      return pocInsightsData('Internet exposed');
    }
    return risk.insights.find(insight => insight.badge === 'Internet exposed');
  }, [shouldShowExposurePathRiskyTickets, pocInsightsData, risk]);

  const deployedInsight = useMemo(() => {
    if (shouldShowExposurePathRiskyTickets) {
      return pocInsightsData('Deployed');
    }
    return risk.insights.find(insight => insight.badge === 'Deployed');
  }, [risk]);

  const hasAssociatedAPIInsight = useMemo(
    () => risk.insights.find(insight => insight.badge === 'Has associated APIs'),
    [risk]
  );

  const clusterInsights = useMemo(
    () =>
      _.first(
        _.sortBy(
          internetExposedInsight?.insights?.reasons.find(
            reason => reason._t === 'ClusterInsightsInsightReasoning'
          )?.insights.clusterInsights ||
            deployedInsight?.insights?.reasons.find(
              reason => reason._t === 'ClusterInsightsInsightReasoning'
            )?.insights?.clusterInsights,
          clusterInsight =>
            clusterInsight.insight?.exposedBy?.find(
              exposedBy => exposedBy.resourceName?.typeName === 'Ingress'
            )
        )
      ),
    [internetExposedInsight, deployedInsight]
  );

  const exposedBy = useMemo(
    () =>
      _.last(
        _.sortBy(
          clusterInsights?.insight?.exposedBy,
          exposedBy => exposedBy.resourceName?.typeName === 'Ingress'
        )
      ),
    [clusterInsights]
  );

  const isSastRisk = risk.riskCategory === 'SAST Findings';

  const isExposedByIngress = exposedBy?.resourceName.typeName === 'Ingress';

  const numOfPresentedNodes = useMemo(
    () => 3 + (internetExposedInsight ? 1 : 0) + (risk.moduleName ? 1 : 0) + (isSastRisk ? 1 : 0),
    [risk]
  );

  const vendorState = useMemo(() => {
    return ['High', 'Critical'].includes(risk.riskLevel.toString())
      ? VendorState.Error
      : 'Medium' === risk.riskLevel.toString() || 'Low' === risk.riskLevel.toString()
        ? VendorState.Warning
        : VendorState.Attention;
  }, [risk]);

  const riskClusterGraphNodeName = useMemo(() => {
    switch (risk.riskType) {
      case 'Dependency':
        return (element as DependencyElement).dependencyType
          ? (element as DependencyElement).dependencyType
          : 'Package';
      case 'Api':
        return (element as ApiElementResponse).entityType
          ? (element as ApiElementResponse).entityType
          : 'API';
      case 'Secret':
        return (element as SecretElement).platform === 'None'
          ? 'Lock'
          : (element as SecretElement).platform;
      case 'Finding':
        return hasAssociatedAPIInsight && hasRelatedApis(element) ? 'Api' : 'Code';
      case 'SensitiveData':
        return 'SensitiveData';
      case 'FrameworkUsage':
        return 'Technology';
      case 'Issue':
        return relatedProfile.vendor;
      default:
        return 'None';
    }
  }, [risk]);

  const riskClusterNodeTitle = useMemo(() => {
    switch (risk.riskType) {
      case 'API':
        return risk.riskType.toUpperCase();
      case 'Finding':
        return hasAssociatedAPIInsight && hasRelatedApis(element) ? 'API' : 'Code';
      case 'FrameworkUsage':
        return 'Technology';
      case 'Issue':
        return 'Risky ticket';
      default:
        return risk.riskType;
    }
  }, [risk]);

  const apiSubTitle = (httpMethod: string, httpRoute: string) => (
    <ApiSubTitleContainer>
      {httpMethod && <CodeBadge size={Size.XXSMALL}>{httpMethod}</CodeBadge>}
      <ClampText>{httpRoute}</ClampText>
    </ApiSubTitleContainer>
  );

  const riskClusterNodeSubTitle = useMemo(() => {
    switch (risk.riskType) {
      case 'Api': {
        return apiSubTitle(
          (risk as ApiRiskTriggerSummary).httpMethod,
          (risk as ApiRiskTriggerSummary).httpRoute
        );
      }
      case 'Finding':
        return hasAssociatedAPIInsight && hasRelatedApis(element) ? (
          apiSubTitle(
            element.relatedEntities[0]?.relatedEntitySummaryInfo.httpMethod,
            element.relatedEntities[0]?.relatedEntitySummaryInfo.httpRoute
          )
        ) : (
          <ClampText lines={2}>{risk.riskName}</ClampText>
        );
      default:
        return <ClampText lines={2}>{risk.riskName}</ClampText>;
    }
  }, [risk]);

  const isVendorIconExist = useMemo(() => {
    switch (risk.riskType) {
      case 'Dependency':
        return Boolean((element as DependencyElement).dependencyType);
      case 'Secret':
        return Boolean((element as SecretElement).platform !== 'None');
      case 'Issue':
        return Boolean(relatedProfile.vendor);
      case 'Api':
      case 'Finding':
      default:
        return false;
    }
  }, [risk]);

  const containerSubTitle = useMemo(() => {
    return (
      <>
        <ClampText>{clusterInsights?.resourceName.name}</ClampText>

        {clusterInsights?.clusterName && (
          <ClampText>{`in ${clusterInsights?.clusterName}`}</ClampText>
        )}
      </>
    );
  }, [internetExposedInsight, deployedInsight]);

  const showCodeNodeForSast = isSastRisk && hasAssociatedAPIInsight;

  return (
    <ClusterGraphContainer>
      <ClusterGraphNode
        name={riskClusterGraphNodeName}
        title={riskClusterNodeTitle}
        subTitle={riskClusterNodeSubTitle}
        isVendor={isVendorIconExist}
        vendorState={!showCodeNodeForSast && vendorState}
        riskLevel={!showCodeNodeForSast && risk.riskLevel}
      />

      {showCodeNodeForSast && (
        <>
          <DashedLineWithTitle text="associated with" growFactor={numOfPresentedNodes} />
          <ClusterGraphNode
            name="Code"
            title="Code"
            subTitle={risk.riskName}
            isVendor={isVendorIconExist}
            vendorState={vendorState}
            riskLevel={risk.riskLevel}
          />
        </>
      )}

      <DashedLineWithTitle text="part of" growFactor={numOfPresentedNodes} />
      {Boolean(risk.moduleName) && (
        <>
          <ClusterGraphNode name="Module" title="Code module" subTitle={risk.moduleName} />
          <DashedLineWithTitle text="part of" growFactor={numOfPresentedNodes} />
        </>
      )}
      <ClusterGraphNode
        name={
          shouldShowExposurePathRiskyTickets
            ? getRepositoryRiskyTickets(risk.riskName).icon
            : relatedProfile.vendor
        }
        title="Repository"
        subTitle={
          shouldShowExposurePathRiskyTickets
            ? getRepositoryRiskyTickets(risk.riskName).name
            : `${relatedProfile.repositoryName} (${relatedProfile.referenceName})`
        }
        isVendor={true}
      />

      <DashedLineWithTitleAndGraphTooltip
        text="runs in"
        graph={
          application.isFeatureEnabled(FeatureFlag.PocExposurePathData) ? (
            <ContainerToCodeMatchingMock
              diagramTexts={{
                repositoryName: relatedProfile.repositoryName,
                containerName: clusterInsights?.resourceName.name,
              }}
            />
          ) : undefined
        }
        growFactor={numOfPresentedNodes}
      />
      <ClusterGraphNode name="Container" title="Container" subTitle={containerSubTitle} />
      {Boolean(internetExposedInsight) && (
        <>
          <DashedLineWithTitle text="exposed by" growFactor={numOfPresentedNodes} />
          <ClusterGraphNode
            name={isExposedByIngress ? 'Bidirectional' : 'ExternalGateway'}
            title={exposedBy?.resourceName?.typeName}
            subTitle={exposedBy?.resourceName?.name}
            icon={isExposedByIngress ? 'Earth' : ''}
          />
        </>
      )}
    </ClusterGraphContainer>
  );
};

const ClusterGraphContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 0;
`;

const ApiSubTitleContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

function hasRelatedApis(element: BaseElement): element is CodeFindings {
  return isTypeOf<CodeFindings>(element, 'relatedApis') && Boolean(element.relatedApis?.length);
}
