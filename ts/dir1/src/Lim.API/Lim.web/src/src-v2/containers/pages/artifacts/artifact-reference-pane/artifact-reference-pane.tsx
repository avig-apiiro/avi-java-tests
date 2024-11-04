import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { Circle } from '@src-v2/components/circles';
import { SvgIcon } from '@src-v2/components/icons';
import { Pane, PaneProps } from '@src-v2/components/panes/pane';
import { PaneBody } from '@src-v2/components/panes/pane-body';
import { PaneStickyHeader } from '@src-v2/components/panes/pane-sticky-header';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading3 } from '@src-v2/components/typography';
import { ArtifactReferencePaneContent } from '@src-v2/containers/pages/artifacts/artifact-reference-pane/artifact-reference-pane-content';
import {
  ArtifactReferenceContextProvider,
  useArtifactReferenceContextProvider,
} from '@src-v2/containers/pages/artifacts/artifact-reference-pane/use-artifact-reference-pane-context';
import { useDetectScrolling } from '@src-v2/hooks/dom-events/use-detect-scrolling';
import { ArtifactDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function ArtifactReferencePane({
  artifactDataModelReference,
  ...props
}: {
  artifactDataModelReference: ArtifactDataModelReference;
} & PaneProps) {
  const [scrolled, onScroll] = useDetectScrolling();

  return (
    <Pane {...props}>
      <AsyncBoundary>
        <ArtifactReferenceContextProvider artifactDataModelReference={artifactDataModelReference}>
          <PaneStickyHeader scrolled={scrolled}>
            <ArtifactReferencePaneHeader />
          </PaneStickyHeader>
          <ArtifactReferencePaneBody onScroll={onScroll}>
            <AsyncBoundary>
              <CollapsibleCardsController>
                {props => <ArtifactReferencePaneContent {...props} />}
              </CollapsibleCardsController>
            </AsyncBoundary>
          </ArtifactReferencePaneBody>
        </ArtifactReferenceContextProvider>
      </AsyncBoundary>
    </Pane>
  );
}

const ArtifactReferencePaneHeader = () => {
  const { artifact } = useArtifactReferenceContextProvider();

  return (
    <ArtifactReferenceWrapper>
      <Circle size={Size.XXLARGE}>
        <SvgIcon name="ContainerImage" size={Size.XXLARGE} />
      </Circle>
      <Heading3>{artifact.packageId}</Heading3>
    </ArtifactReferenceWrapper>
  );
};

const ArtifactReferenceWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
`;

const ArtifactReferencePaneBody = styled(PaneBody)`
  padding-top: 4rem;
`;
