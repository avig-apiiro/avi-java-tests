import { useCallback } from 'react';
import { PaneProps } from '@src-v2/components/panes/pane';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { CodeModulePane } from '@src-v2/containers/code-module-pane/code-module-pane';
import { DeveloperPane } from '@src-v2/containers/developer-pane/developer-pane';
import { entityTypeToPane } from '@src-v2/containers/entity-pane/entity-type-to-pane';
import { useRiskTypeToPane } from '@src-v2/containers/entity-pane/use-risk-type-to-pane';
import { FindingPane } from '@src-v2/containers/finding-pane/finding-pane';
import { ProcessedFindingPane } from '@src-v2/containers/finding-pane/processed-finding-pane';
import { ArtifactReferencePane } from '@src-v2/containers/pages/artifacts/artifact-reference-pane/artifact-reference-pane';
import { PrScanPane } from '@src-v2/containers/pr-logs/pane/pr-scan-pane';
import { RepositoryPane } from '@src-v2/containers/repository-pane/repository-pane';
import { useInject } from '@src-v2/hooks';
import {
  ArtifactDataModelReference,
  BaseDataModelReference,
  DeveloperDataModelReference,
  DiffableEntityDataModelReference,
  FindingDataModelReference,
  ModuleDataModelReference,
  PrScanDataModelReference,
  RepositoryDataModelReference,
  RiskDataModelReference,
} from '@src-v2/types/data-model-reference/data-model-reference';
import { isTypeOf } from '@src-v2/utils/ts-utils';
import { primaryPaneLevel } from '@src/blocks/Pane/model';
import { openRiskTriggerPane } from '@src/blocks/RiskPosture/blocks/DetailsPane/TriggerDisplayUtils';

export function useOpenDataModelReferencePane() {
  const { risks, profiles, asyncCache } = useInject();
  const { pushPane } = usePaneState();
  const getRiskPane = useRiskTypeToPane();

  const handleOpenRiskPane = useCallback(
    async (riskDataModelReference: RiskDataModelReference, paneProps: PaneProps) => {
      const trigger = await asyncCache.suspend(risks.getTrigger, {
        key: riskDataModelReference.riskTriggerSummaryKey,
      });
      const Pane = getRiskPane(trigger.elementType);
      pushPane(<Pane {...paneProps} triggerKey={trigger.key} />);
    },
    [risks, pushPane]
  );

  const handleOpenDiffablePane = useCallback(
    async (diffableDataModelReference: DiffableEntityDataModelReference, paneProps: PaneProps) => {
      const Pane = entityTypeToPane[diffableDataModelReference.inventoryTableEntityType];
      if (Pane) {
        pushPane(<Pane {...paneProps} dataModelReference={diffableDataModelReference} />);
        return;
      }

      const profile = await (
        diffableDataModelReference.diffableEntityType === 'Issue'
          ? profiles.getProjectProfile
          : profiles.getRepositoryProfile
      )({
        key: diffableDataModelReference.containingProfileId,
      });

      openRiskTriggerPane({
        trigger: {
          elementType: diffableDataModelReference.diffableEntityType,
          elementKey: diffableDataModelReference.diffableEntityId,
          diffableDataModelReference,
        },
        level: primaryPaneLevel,
        ruleKey: null,
        profile,
        profileType: diffableDataModelReference.containingProfileType,
        relevantPath: window.location.pathname.split('/').pop(),
        onClose: () => {},
      });
    },
    [profiles]
  );

  const handleOpenModulePane = useCallback(
    (moduleDataModelReference: ModuleDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <CodeModulePane
          {...paneProps}
          repositoryKey={moduleDataModelReference.repositoryKey}
          moduleKey={moduleDataModelReference.moduleKey}
        />
      ),
    [pushPane]
  );

  const handleOpenPullRequestScanPane = useCallback(
    (prScanDataModelReference: PrScanDataModelReference, paneProps: PaneProps) =>
      pushPane(<PrScanPane {...paneProps} scanKey={prScanDataModelReference.scanKey} />),
    [pushPane]
  );

  const handleOpenRepositoryPane = useCallback(
    (repositoryDataModelReference: RepositoryDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <RepositoryPane {...paneProps} repositoryKey={repositoryDataModelReference.repositoryKey} />
      ),
    [pushPane]
  );

  const handleOpenDeveloperPane = useCallback(
    (developerDataModelReference: DeveloperDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <DeveloperPane
          {...paneProps}
          developerProfileKey={developerDataModelReference.developerProfileKey}
        />
      ),
    [pushPane]
  );

  const handleOpenFindingPane = useCallback(
    (findingDataModelReference: FindingDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <FindingPane {...paneProps} findingDataModelReference={findingDataModelReference} />
      ),
    [pushPane]
  );

  const handleOpenProcessedFindingPane = useCallback(
    (findingDataModelReference: FindingDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <ProcessedFindingPane
          {...paneProps}
          findingDataModelReference={findingDataModelReference}
        />
      ),
    [pushPane]
  );

  const handleOpenArtifactReferencePane = useCallback(
    (artifactDataModelReference: ArtifactDataModelReference, paneProps: PaneProps) =>
      pushPane(
        <ArtifactReferencePane
          {...paneProps}
          artifactDataModelReference={artifactDataModelReference}
        />
      ),
    [pushPane]
  );

  return useCallback(
    (dataModelReference: BaseDataModelReference, paneProps: PaneProps = {}) => {
      if (isTypeOf<RiskDataModelReference>(dataModelReference, 'riskTriggerSummaryKey')) {
        return handleOpenRiskPane(dataModelReference, paneProps);
      }
      if (isTypeOf<DiffableEntityDataModelReference>(dataModelReference, 'containingProfileType')) {
        return handleOpenDiffablePane(dataModelReference, paneProps);
      }
      if (isTypeOf<ModuleDataModelReference>(dataModelReference, 'moduleKey')) {
        return handleOpenModulePane(dataModelReference, paneProps);
      }
      if (isTypeOf<PrScanDataModelReference>(dataModelReference, 'scanKey')) {
        return handleOpenPullRequestScanPane(dataModelReference, paneProps);
      }
      if (isTypeOf<RepositoryDataModelReference>(dataModelReference, 'repositoryKey')) {
        return handleOpenRepositoryPane(dataModelReference, paneProps);
      }
      if (isTypeOf<DeveloperDataModelReference>(dataModelReference, 'developerProfileKey')) {
        return handleOpenDeveloperPane(dataModelReference, paneProps);
      }
      if (isTypeOf<FindingDataModelReference>(dataModelReference, 'findingType')) {
        if (dataModelReference.findingType === 'ProcessedDependencyFinding') {
          return handleOpenProcessedFindingPane(dataModelReference, paneProps);
        }
        return handleOpenFindingPane(dataModelReference, paneProps);
      }
      if (
        isTypeOf<ArtifactDataModelReference>(dataModelReference, 'artifactMultiSourcedEntityKey')
      ) {
        return handleOpenArtifactReferencePane(dataModelReference, paneProps);
      }
    },
    [handleOpenRiskPane, handleOpenDiffablePane]
  );
}
