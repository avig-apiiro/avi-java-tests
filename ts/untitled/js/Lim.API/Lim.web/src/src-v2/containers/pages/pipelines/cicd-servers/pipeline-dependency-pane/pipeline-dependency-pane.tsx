import { FC } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { PipelineDependencyContextProvider } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-context-provider';
import { PipelineDependencyPaneContent } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-pane-content';
import { PipelineDependencyPaneHeader } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-pane-header';
import { useQueryParams } from '@src-v2/hooks';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';

export function PipelineDependencyPane({
  name,
  version,
  serverUrl,
  ...props
}: { name: string; version: string; serverUrl: string } & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <PipelineDependencyContextProvider name={name} version={version} serverUrl={serverUrl}>
          <PaneStickyHeader scrolled={scrolled} navigation={['profile']}>
            <PipelineDependencyPaneHeader />
          </PaneStickyHeader>
          <PaneBody onScroll={onScroll}>
            <AsyncBoundary>
              <TabsRouter>{props => <PipelineDependencyPaneContent {...props} />}</TabsRouter>
            </AsyncBoundary>
          </PaneBody>
        </PipelineDependencyContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

function TabsRouter({ children }: { children: FC<ControlledCardProps> }) {
  const {
    queryParams: { pane = 'profile' },
  } = useQueryParams();

  // eslint-disable-next-line default-case
  switch (pane) {
    case 'profile':
      return <CollapsibleCardsController>{props => children(props)}</CollapsibleCardsController>;
  }
}
