import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { Divider } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/affected-asset-card-content';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { ElementSeparator } from '@src/src-v2/components/element-separator';

export const RelatedAssetCardContent = ({
  associatedObjects,
}: {
  associatedObjects: AssociatedObject[];
}) => (
  <LightWeightRelatedAssetWrapper>
    <ElementSeparator separator={<Divider />}>
      {associatedObjects.map(object => (
        <RelatedAsset key={object.identifier} associatedObject={object} />
      ))}
    </ElementSeparator>
  </LightWeightRelatedAssetWrapper>
);

export const RelatedAsset = ({ associatedObject }: { associatedObject: AssociatedObject }) => (
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
      <EvidenceLine isExtendedWidth label="Asset identifier">
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
  </EvidenceLinesWrapper>
);

export const LightWeightRelatedAssetWrapper = styled.div``;
