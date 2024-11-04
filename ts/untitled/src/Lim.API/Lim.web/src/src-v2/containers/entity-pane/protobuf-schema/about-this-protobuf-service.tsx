import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { HighlightedCode } from '@src-v2/containers/commit/common-componnets';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export function AboutThisProtobufService(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext<
    BaseElement & { statements: { name: string; clientRequest: string; serverRequest: string }[] }
  >();

  return (
    <ControlledCard {...props} title="About this Protobuf service">
      {element.codeReference && (
        <EvidenceLine label="Introduced through">
          <CodeReferenceLink repository={relatedProfile} codeReference={element.codeReference} />
        </EvidenceLine>
      )}

      {Boolean(element.statements?.length) && (
        <EvidenceLine label="Statements">
          <UnorderedList>
            {element.statements.map((statement, index) => (
              <ListItem key={index}>
                <StatementCode
                  language="protobuf"
                  code={`${statement.name}(${statement.clientRequest}) returns (${statement.serverRequest})`}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}
    </ControlledCard>
  );
}

const StatementCode = styled(HighlightedCode)`
  white-space: pre-wrap;
`;
