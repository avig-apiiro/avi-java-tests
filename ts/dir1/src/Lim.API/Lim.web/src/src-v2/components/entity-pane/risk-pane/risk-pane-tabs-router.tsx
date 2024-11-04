import { FC } from 'react';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceTab } from '@src-v2/components/entity-pane/evidence/evidence-tab';
import { WhatToDoCard } from '@src-v2/components/entity-pane/remediation/what-to-do-card';
import { TimelineTab } from '@src-v2/components/entity-pane/timeline/timeline-tab';
import { useQueryParams } from '@src-v2/hooks';
import { ContributorsCard } from '../remediation/contributors-card';

export const RiskPaneTabsRouter = ({
  evidence: Evidence,
  remediate: Remediate,
  relatedFinding: RelatedFinding,
  codeOwnerIsRepoAdmin,
}: {
  evidence: FC<ControlledCardProps>;
  remediate: FC;
  relatedFinding?: FC<ControlledCardProps>;
  codeOwnerIsRepoAdmin?: boolean;
}) => {
  const {
    queryParams: { pane = 'evidence' },
  } = useQueryParams();
  const { relatedProfile, element } = useEntityPaneContext();

  switch (pane) {
    case 'remediation':
      return (
        <TabContainer>
          <AnalyticsLayer analyticsData={{ [AnalyticsDataField.EntryPoint]: 'Remediation tab' }}>
            {Remediate && <Remediate />}
            <WhatToDoCard />
            {relatedProfile && element && (
              <ContributorsCard codeOwnerIsRepoAdmin={codeOwnerIsRepoAdmin} />
            )}
          </AnalyticsLayer>
        </TabContainer>
      );
    case 'timeline':
      return <TimelineTab />;
    case 'relatedFindings':
      return (
        <CollapsibleCardsController>
          {props => (RelatedFinding ? <RelatedFinding {...props} /> : null)}
        </CollapsibleCardsController>
      );
    default:
      return <EvidenceTab>{props => <Evidence {...props} />}</EvidenceTab>;
  }
};

const TabContainer = styled.div`
  margin-top: 6rem;
`;
