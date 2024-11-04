import styled from 'styled-components';
import { CollapsibleCard } from '@src-v2/components/cards';
import { Collapsible } from '@src-v2/components/collapsible';
import { HtmlSection } from '@src-v2/containers/entity-pane/sast/html-section';
import { useSastPaneContext } from '@src-v2/containers/entity-pane/sast/use-sast-pane-context';

export const SastRemediationCard = () => {
  const { element } = useSastPaneContext();

  return (
    <>
      {element.remediation && (
        <RemediationCard defaultOpen title="How to fix this risk?">
          <HtmlSection dangerouslySetInnerHTML={{ __html: element.remediation }} />
        </RemediationCard>
      )}
    </>
  );
};

const RemediationCard = styled(CollapsibleCard)`
  padding: var(--card-padding, 6rem);

  ${Collapsible.Head} {
    padding: 0;
  }
`;
