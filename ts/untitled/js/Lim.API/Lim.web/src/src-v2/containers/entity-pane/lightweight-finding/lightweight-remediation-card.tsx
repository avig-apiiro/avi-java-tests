import styled from 'styled-components';
import { Card } from '@src-v2/components/cards';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading4 } from '@src-v2/components/typography';
import { useLightweightFindingPaneContext } from '@src-v2/containers/entity-pane/lightweight-finding/use-lightweight-finding-pane-context';
import { HtmlMarkdown } from '@src/src-v2/components/html-markdown';

export const LightweightRemediationCard = () => {
  const { finding } = useLightweightFindingPaneContext();
  const { finding: findingObj } = finding;

  return (
    <>
      {findingObj.remediation?.descriptionMarkdown && (
        <RemediationCard>
          <Heading4>
            Remediation suggestion by
            <VendorIcon name={findingObj.sourceProviders[0]} size={Size.SMALL} />
            {findingObj.sourceProviders[0]}
          </Heading4>
          <HtmlMarkdown>{findingObj?.remediation?.descriptionMarkdown}</HtmlMarkdown>
        </RemediationCard>
      )}
    </>
  );
};

const RemediationCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Heading4} {
    display: flex;
    gap: 1rem;
  }
`;
