import { useCallback } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { AboutThisFrameworkContent } from '@src-v2/containers/entity-pane/framework-usage/framework-usage-entity-pane';
import { useInject } from '@src-v2/hooks';
import { EntityType } from '@src-v2/types/enums/entity-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { StyledProps } from '@src-v2/types/styled';
import { TRIGGER_TYPE_TO_INVENTORY_ROUTE } from '@src/blocks/RiskPosture/blocks/DetailsPane/TriggerDataUtils';
import { LegacyApiPane, LegacyRuntimeFindingsCards } from '@src/components/Panes/ApiPane';
import { LegacyDataModelPane } from '@src/components/Panes/DataModelPane';
import { LegacyFindingPane } from '@src/components/Panes/FindingPane';
import { LegacyFrameworkPane } from '@src/components/Panes/FrameworkPane';
import { LegacyGqlObjectPane } from '@src/components/Panes/GqlObjectPane';
import { LegacyGqlOperationPane } from '@src/components/Panes/GqlOperationPane';
import { LegacyIssuePane } from '@src/components/Panes/IssuePane';
import { LegacyRiskyLicensePane } from '@src/components/Panes/RiskyLicensePane';
import { LegacySensitiveDataPane } from '@src/components/Panes/SensitiveDataPane';
import { LegacyTerraformModuleHighlightsPane } from '@src/components/Panes/TerraformModuleHighlightsPane';

export function LegacyRiskPane(props: RiskPaneProps) {
  const { inventory } = useInject();
  const fetchInventory = useCallback(
    ({ risk: fetchedRisk }: { risk: RiskTriggerSummaryResponse }) => {
      if (!Object.keys(TRIGGER_TYPE_TO_INVENTORY_ROUTE).includes(fetchedRisk.elementType)) {
        return Promise.resolve<BaseElement>({
          displayName: fetchedRisk.riskName,
          entityId: fetchedRisk.elementKey,
          entityType: EntityType[fetchedRisk.elementType?.toString()] ?? EntityType.None,
          codeReference: null,
          insights: null,
        });
      }

      return inventory.getInventoryElement(
        fetchedRisk.primaryDataModelReference
          ? {
              reference: fetchedRisk.primaryDataModelReference,
            }
          : {
              profileKey: fetchedRisk.profile.key,
              profileType: fetchedRisk.profile.profileType,
              elementKey: fetchedRisk.elementKey,
              elementType: fetchedRisk.elementType,
            }
      );
    },
    []
  );

  return (
    <RiskPane {...props} header={<RiskPaneHeader />} elementDataFetcher={fetchInventory}>
      <RiskPaneTabsRouter evidence={LegacyEvidenceTab} remediate={null} />
    </RiskPane>
  );
}

function LegacyEvidenceTab(props: ControlledCardProps) {
  const { risk, element } = useEntityPaneContext();
  const { application } = useInject();
  const showExposureGraph = shouldShowExposureGraph(risk, application);
  return (
    <>
      <ConditionalCard {...props}>
        <LegacyRiskBody />
      </ConditionalCard>

      {risk.elementType === 'Api' && (
        <AsyncBoundary>
          <LegacyRuntimeFindingsCards {...props} risk={risk} api={element} />
        </AsyncBoundary>
      )}

      {(risk.elementType === 'SensitiveData' || risk.elementType === 'FrameworkUsage') &&
        showExposureGraph && <ExposurePathCard {...props} />}
    </>
  );
}

function ConditionalCard({ children, ...props }: StyledProps<ControlledCardProps>) {
  const { risk } = useEntityPaneContext();
  return (children as any).type?.() !== null ? (
    <ControlledCard {...props} title="About this risk">
      <RiskLevelWidget risk={risk} />
      <DiscoveredEvidenceLine risk={risk} />
      <DueDateEvidenceLine risk={risk} />
      {children}
    </ControlledCard>
  ) : null;
}

function LegacyRiskBody() {
  const { risk, element } = useEntityPaneContext<BaseElement, RiskTriggerSummaryResponse>();

  switch (risk.elementType) {
    case 'Api':
      return <LegacyApiPane api={element} profile={risk.profile} />;
    case 'Issue':
    case 'UserStory':
      return <LegacyIssuePane issue={element} risk={risk} />;
    case 'DataModel':
      return <LegacyDataModelPane dataModel={element} />;
    case 'SensitiveData':
      return <LegacySensitiveDataPane sensitiveData={element} risk={risk} />;
    case 'TerraformResource':
      return (
        <LegacyTerraformModuleHighlightsPane
          resource={element}
          repository={(risk.profile as any).repository}
        />
      );
    case 'GqlObject':
      return (
        <LegacyGqlObjectPane gqlObject={element} repository={(risk.profile as any).repository} />
      );
    case 'GqlOperation':
      return (
        <LegacyGqlOperationPane
          gqlOperation={element}
          repository={(risk.profile as any).repository}
        />
      );
    case 'LicenseWithDependencies':
      return <LegacyRiskyLicensePane license={element} />;
    case 'Framework':
      return <LegacyFrameworkPane element={element} risk={risk} />;
    case 'CodeFinding':
    case 'CicdPipelineDeclarationCodeFindings':
      return <LegacyFindingPane finding={element} repository={(risk.profile as any).repository} />;
    case 'FrameworkUsage':
      return (
        <AboutThisFrameworkContent
          element={element}
          relatedProfile={risk.profile}
          moduleName={risk.moduleName}
        />
      );
    default:
      return null;
  }
}
