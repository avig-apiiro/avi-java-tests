import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { Heading3 } from '@src-v2/components/typography';
import {
  FindingContextProvider,
  useFindingContext,
} from '@src-v2/containers/finding-pane/finding-context-provider';
import { ProcessedFindingPaneContent } from '@src-v2/containers/finding-pane/processed-finding-pane-content';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';
import { FindingDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { Menu } from '@src/src-v2/components/entity-pane/risk-pane/risk-pane-actions';

export function ProcessedFindingPane({
  findingDataModelReference,
  ...props
}: {
  findingDataModelReference: FindingDataModelReference;
} & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <FindingContextProvider findingDataModelReference={findingDataModelReference}>
          <PaneStickyHeader scrolled={scrolled}>
            <FindingPaneHeader {...props} />
          </PaneStickyHeader>
          <FindingPaneBody onScroll={onScroll}>
            <AsyncBoundary>
              <CollapsibleCardsController>
                {props => <ProcessedFindingPaneContent {...props} />}
              </CollapsibleCardsController>
            </AsyncBoundary>
          </FindingPaneBody>
        </FindingContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

const FindingPaneHeader = props => {
  const { finding } = useFindingContext();

  return (
    <FindingHeaderWrapper {...props}>
      <Heading3>{finding.finding.title}</Heading3>
      {/*This will be uncommented when BE will be ready - Will be displayed only for manual finding */}
      {/*<FindingPaneActions {...props} />*/}
    </FindingHeaderWrapper>
  );
};

const FindingHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;

  ${Menu} {
    align-self: flex-end;
  }
`;

const FindingPaneBody = styled(PaneBody)`
  padding-top: 4rem;
`;
