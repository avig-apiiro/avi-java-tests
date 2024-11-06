import { FC, ReactNode } from 'react';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiffableEntityPaneHeader } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane-header';
import { DiffableEntityContextProvider } from '@src-v2/components/entity-pane/entity-context-provider';
import { TimelineTab } from '@src-v2/components/entity-pane/timeline/timeline-tab';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';
import { GetInventoryParams } from '@src-v2/services';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export function DiffableEntityPane<TElement extends BaseElement>({
  header = <DiffableEntityPaneHeader />,
  navigationTab = ['profile', 'timeline'],
  dataModelReference,
  elementDataFetcher,
  children,
  ...props
}: {
  header?: ReactNode;
  navigationTab?: string[];
  dataModelReference: DiffableEntityDataModelReference;
  elementDataFetcher?: (params: GetInventoryParams) => Promise<TElement>;
  children: FC<ControlledCardProps>;
} & Omit<PaneProps, 'children'>) {
  const { inventory } = useInject();
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <DiffableEntityContextProvider
          dataModelReference={dataModelReference}
          elementDataFetcher={elementDataFetcher ?? inventory.getInventoryElement}>
          <PaneStickyHeader scrolled={scrolled} navigation={navigationTab}>
            {header}
          </PaneStickyHeader>
          <PaneBody onScroll={onScroll}>
            <AsyncBoundary>
              <TabsRouter>{children}</TabsRouter>
            </AsyncBoundary>
          </PaneBody>
        </DiffableEntityContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

function TabsRouter({ children }: { children: FC<ControlledCardProps> }) {
  const {
    queryParams: { pane = 'profile' },
  } = useQueryParams();

  switch (pane) {
    case 'profile':
      return <CollapsibleCardsController>{props => children(props)}</CollapsibleCardsController>;
    case 'timeline':
      return <TimelineTab />;
    // no default
  }
}
