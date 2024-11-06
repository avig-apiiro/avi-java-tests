import { useCallback } from 'react';
import styled from 'styled-components';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { RiskPane, RiskPaneProps } from '@src-v2/components/entity-pane/risk-pane/risk-pane';
import { RiskPaneHeader } from '@src-v2/components/entity-pane/risk-pane/risk-pane-header';
import { RiskPaneTabsRouter } from '@src-v2/components/entity-pane/risk-pane/risk-pane-tabs-router';
import { SvgIcon } from '@src-v2/components/icons';
import { SubHeading3 } from '@src-v2/components/typography';
import { ArtifactEvidenceTab } from '@src-v2/containers/pages/artifacts/artifact-pane/evidence-tab/artifact-evidence-tab';
import { ArtifactRelatedFindingTab } from '@src-v2/containers/pages/artifacts/artifact-pane/related-finding/artifact-related-finding-tab';
import { ArtifactRemediationTab } from '@src-v2/containers/pages/artifacts/artifact-pane/remediation-tab/artifact-remediation-tab';
import { useInject } from '@src/src-v2/hooks';

export const ArtifactPane = (props: RiskPaneProps) => {
  const { findings } = useInject();

  const findingDataFetcher = useCallback(
    ({ dataModelReference }) => findings.getFinding(dataModelReference),
    []
  );

  return (
    <RiskPane
      {...props}
      navigation={['evidence', 'relatedFindings', 'remediation', 'timeline']}
      header={<RiskPaneHeader subtitle={RiskSubtitle} />}
      findingDataFetcher={findingDataFetcher}>
      <RiskPaneTabsRouter
        evidence={ArtifactEvidenceTab}
        relatedFinding={ArtifactRelatedFindingTab}
        remediate={ArtifactRemediationTab}
      />
    </RiskPane>
  );
};

const RiskSubtitle = () => (
  <RiskSubtitleStack>
    <IconWrapper name="Dependency" />
    <SubHeading3>{useEntityPaneContext().risk.riskName}</SubHeading3>
  </RiskSubtitleStack>
);

const RiskSubtitleStack = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
`;
