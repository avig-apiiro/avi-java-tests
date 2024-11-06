import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Avatar } from '@src-v2/components/avatar';
import { Card } from '@src-v2/components/cards';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { CardTitle, PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { Link, Title } from '@src-v2/components/typography';
import {
  DeveloperContextProvider,
  useDeveloperContext,
} from '@src-v2/containers/developer-pane/developer-context-provider';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';

export function DeveloperPane({
  developerProfileKey,
  ...props
}: { developerProfileKey: string } & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <DeveloperContextProvider developerProfileKey={developerProfileKey}>
          <PaneStickyHeader scrolled={scrolled}>
            <DeveloperPaneHeader />
          </PaneStickyHeader>

          <DeveloperPaneBody onScroll={onScroll}>
            <AboutThisDeveloperCard />
          </DeveloperPaneBody>
        </DeveloperContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

const DeveloperPaneHeader = styled(props => {
  const { developer } = useDeveloperContext();

  return (
    <div {...props}>
      <Avatar
        username={developer.username}
        identityKey={developer.identityKey}
        size={Size.MEDIUM}
      />
      <Title>{developer.username}</Title>
    </div>
  );
})`
  display: flex;
  align-items: center;
  gap: 1rem;

  ${Title} {
    font-size: var(--font-size-l);
  }
`;

const DeveloperPaneBody = styled(PaneBody)`
  padding-top: 4rem;
`;

function AboutThisDeveloperCard() {
  const { developer } = useDeveloperContext();

  return (
    <Card>
      <CardTitle>About this contributor</CardTitle>
      <EvidenceLine label="Active since">
        <DateTime date={developer.activeSince} />
      </EvidenceLine>
      <EvidenceLine label="Last activity">
        <DateTime date={developer.lastActivity} />
      </EvidenceLine>
      <EvidenceLine label="Number of commits">{developer.commitsCount}</EvidenceLine>
      <EvidenceLine label="Number of pull requests">
        {developer.authoredPullRequestsCount + developer.reviewedPullRequestsCount}
      </EvidenceLine>
      <EvidenceLine label="Contributor profile">
        <Link to={`/users/contributors/${developer.identityKey}`}>{developer.username}</Link>
      </EvidenceLine>
    </Card>
  );
}
