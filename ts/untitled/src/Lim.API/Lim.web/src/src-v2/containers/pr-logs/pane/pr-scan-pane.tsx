import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ProfileRelatedPaneHeader } from '@src-v2/components/entity-pane/common/profile-related-pane-header';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { Heading3, SubHeading3 } from '@src-v2/components/typography';
import { AboutThisPrScanCard } from '@src-v2/containers/pr-logs/pane/about-this-pr-scan-card';
import { MaterialChangesCard } from '@src-v2/containers/pr-logs/pane/material-changes-card';
import {
  PrScanContextProvider,
  usePullRequestScanContext,
} from '@src-v2/containers/pr-logs/pane/pr-scan-context-provider';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';

type PrScanPaneProps = {
  scanKey: string;
} & PaneProps;

export const PrScanPane = ({ scanKey, ...props }: PrScanPaneProps) => {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <PrScanContextProvider scanKey={scanKey}>
          <PaneStickyHeader scrolled={scrolled} navigation={['profile']}>
            <PrScanPaneHeader />
          </PaneStickyHeader>

          <PaneContainer onScroll={onScroll}>
            <AboutThisPrScanCard />
            <MaterialChangesCard />
          </PaneContainer>
        </PrScanContextProvider>
      </AsyncBoundary>
    </Pane>
  );
};

const PrScanPaneHeader = () => {
  const { pullRequestScan } = usePullRequestScanContext();

  return (
    <ProfileRelatedPaneHeader
      repositoryProfile={pullRequestScan.repository}
      applications={pullRequestScan.applications}
      orgTeams={pullRequestScan.orgTeams}>
      <HeaderContainer>
        <Heading3>{pullRequestScan.title}</Heading3>
        <SubHeading3>{pullRequestScan.candidate.identifier}</SubHeading3>
      </HeaderContainer>
    </ProfileRelatedPaneHeader>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PaneContainer = styled(PaneBody)`
  padding-top: 4rem;
`;
