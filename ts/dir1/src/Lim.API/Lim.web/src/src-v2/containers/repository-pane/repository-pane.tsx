import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { AboutRepositoryCard } from '@src-v2/containers/repository-pane/about-repository-card';
import { AttackSurfaceCard } from '@src-v2/containers/repository-pane/attack-surface-card';
import { RepositoryContextProvider } from '@src-v2/containers/repository-pane/repository-context-provider';
import { RepositoryPaneHeader } from '@src-v2/containers/repository-pane/repository-pane-header';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';

export function RepositoryPane({ repositoryKey, ...props }: { repositoryKey: string } & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <RepositoryContextProvider repositoryKey={repositoryKey}>
          <PaneStickyHeader scrolled={scrolled}>
            <RepositoryPaneHeader />
          </PaneStickyHeader>

          <RepositoryPaneBody onScroll={onScroll}>
            <AboutRepositoryCard />
            <AttackSurfaceCard />
          </RepositoryPaneBody>
        </RepositoryContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

const RepositoryPaneBody = styled(PaneBody)`
  padding-top: 4rem;
`;
