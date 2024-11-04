import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';

export function AboutThisProtobufMessage(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext<
    BaseElement & { content: { displayName: string; type: string }[] }
  >();

  return (
    <ControlledCard {...props} title="About this Protobuf message">
      {element.codeReference && (
        <EvidenceLine label="Introduced through">
          <CodeReferenceLink repository={relatedProfile} codeReference={element.codeReference} />
        </EvidenceLine>
      )}
      {Boolean(element.content?.length) && (
        <EvidenceLine label="Fields">
          <UnorderedList>
            {element.content.map(field => (
              <ListItem key={field.displayName}>
                {field.displayName}:&nbsp;<FieldType>{field.type}</FieldType>
              </ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}
    </ControlledCard>
  );
}

const FieldType = styled.span`
  color: var(--color-blue-gray-60);
  font-weight: 300;
`;
