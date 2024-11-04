import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { ClampText } from '@src-v2/components/clamp-text';
import { Divider as BaseDivider } from '@src-v2/components/divider';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading5 } from '@src-v2/components/typography';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { ElementSeparator } from '@src/src-v2/components/element-separator';

export const AffectedAssetCardContent = ({
  associatedObjects,
}: {
  associatedObjects: AssociatedObject[];
}) => (
  <LightWeightAffectedAssetWrapper>
    <ElementSeparator separator={<Divider />}>
      {associatedObjects.map(object => (
        <AffectedAsset key={object.identifier} associatedObject={object} />
      ))}
    </ElementSeparator>
  </LightWeightAffectedAssetWrapper>
);

export const AffectedAsset = ({ associatedObject }: { associatedObject: AssociatedObject }) => (
  <EvidenceLinesWrapper>
    <EvidenceLine isExtendedWidth label="Name">
      <ClampText>{associatedObject.name}</ClampText>
    </EvidenceLine>
    {Boolean(associatedObject.type || associatedObject.referencedEntity) && (
      <EvidenceLine isExtendedWidth label="Type">
        {associatedObject.type || (associatedObject.referencedEntity && 'Repository')}
      </EvidenceLine>
    )}
    {(associatedObject.iPs?.length ?? 0) > 0 && (
      <EvidenceLine isExtendedWidth label="IP address">
        <ClampText>{associatedObject.iPs.join(', ')}</ClampText>
      </EvidenceLine>
    )}
    {Boolean(associatedObject.identifier) && (
      <EvidenceLine isExtendedWidth label="Identifier">
        <ClampText>
          {associatedObject.identifier || associatedObject.referencedEntity?.identifier}
        </ClampText>
      </EvidenceLine>
    )}
    {Boolean(associatedObject.importance) && associatedObject.importance !== 'NoData' && (
      <EvidenceLine isExtendedWidth label="Importance">
        <ClampText>{associatedObject.importance}</ClampText>
      </EvidenceLine>
    )}
    {Boolean(associatedObject.assetTags?.length) && (
      <EvidenceLine isExtendedWidth label="Asset tags">
        <AssetTagsWrapper>
          {associatedObject.assetTags?.map(({ key, value }) => (
            <Badge key={key} size={Size.XSMALL}>
              <Heading5>
                <ClampText>{key}</ClampText>
              </Heading5>
              :&nbsp;
              <ClampText>{value}</ClampText>
            </Badge>
          ))}
        </AssetTagsWrapper>
      </EvidenceLine>
    )}
  </EvidenceLinesWrapper>
);

const AssetTagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  overflow: hidden;

  ${Badge} {
    max-width: 70rem;
    font-size: var(--font-size-s);
  }
`;

export const LightWeightAffectedAssetWrapper = styled.div``;

export const Divider = styled(BaseDivider)`
  margin: 4rem 0;
`;
