import { FC, useCallback } from 'react';
import { RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { ApiFindingsRiskPane } from '@src-v2/containers/entity-pane/api-finding/api-findings-risk-pane';
import { ApiRiskPane } from '@src-v2/containers/entity-pane/api/api-risk-pane';
import { BranchProtectionRiskPane } from '@src-v2/containers/entity-pane/branch-protection/branch-protection-risk-pane';
import { ContributorNotPushingCodeRiskPane } from '@src-v2/containers/entity-pane/inactive-user/contributor-not-pushing-code-risk-pane';
import { InactiveAdminRiskPane } from '@src-v2/containers/entity-pane/inactive-user/inactive-admin-risk-pane';
import { LightweightFindingPane } from '@src-v2/containers/entity-pane/lightweight-finding/lightweight-finding-pane';
import { SastRiskPane } from '@src-v2/containers/entity-pane/sast/sast-risk-pane';
import { PipelineScaRiskPane } from '@src-v2/containers/entity-pane/sca/pipeline-sca-risk-pane';
import { ScaRiskPane } from '@src-v2/containers/entity-pane/sca/sca-risk-pane';
import { SecretsRiskPane } from '@src-v2/containers/entity-pane/secrets/secrets-risk-pane';
import { SensitiveDataRiskPane } from '@src-v2/containers/entity-pane/sensitive-data/sensitive-data-risk-pane';
import { UserStoryRiskPane } from '@src-v2/containers/entity-pane/user-story/user-story-risk-pane';
import { ArtifactPane } from '@src-v2/containers/pages/artifacts/artifact-pane/artifact-pane';
import ioc from '@src-v2/ioc';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskTriggerElementType } from '@src-v2/types/enums/risk-trigger-element-type';
import { LegacyRiskPane } from '@src/blocks/RiskPosture/legacy-risk-pane';

export function useRiskTypeToPane() {
  const riskTypeToPane: {
    [key in keyof typeof RiskTriggerElementType]: FC<RiskPaneProps>;
  } = {
    Unknown: LegacyRiskPane,
    Api: ApiRiskPane,
    DataModel: LegacyRiskPane,
    SensitiveData: SensitiveDataRiskPane,
    Dependency: ScaRiskPane,
    PipelineDependency: PipelineScaRiskPane,
    Secret: SecretsRiskPane,
    FrameworkUsage: LegacyRiskPane,
    Issue: LegacyRiskPane,
    UserStory: ioc.application.isFeatureEnabled(FeatureFlag.DesignRisksV3)
      ? UserStoryRiskPane
      : LegacyRiskPane,
    ContributorNotPushingCode: ContributorNotPushingCodeRiskPane,
    AdminNotPerformingActivity: InactiveAdminRiskPane,
    Framework: LegacyRiskPane,
    LicenseWithDependencies: LegacyRiskPane,
    RbacRole: LegacyRiskPane,
    ElementMissing: LegacyRiskPane,
    UserFacing: LegacyRiskPane,
    TerraformResource: LegacyRiskPane,
    GqlObject: LegacyRiskPane,
    GqlOperation: LegacyRiskPane,
    CodeFinding: SastRiskPane,
    CicdPipelineDeclarationCodeFindings: LegacyRiskPane,
    ServerlessFunction: LegacyRiskPane,
    ProtobufMessage: LegacyRiskPane,
    ProtobufService: LegacyRiskPane,
    ExternalGeneralFinding: LegacyRiskPane,
    ApiFinding: ApiFindingsRiskPane,
    BranchProtection: BranchProtectionRiskPane,
    LightweightFinding: LightweightFindingPane,
    ProcessedFinding: LightweightFindingPane,
    ProcessedDependencyFinding: ArtifactPane,
    DockerFile: LegacyRiskPane,
  };

  return useCallback(
    (key: keyof typeof RiskTriggerElementType) => riskTypeToPane[key],
    [riskTypeToPane]
  );
}
