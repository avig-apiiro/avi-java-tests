import styled from 'styled-components';
import { Divider } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/affected-asset-card-content';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { LightWeightRelatedAssetWrapper, RelatedAsset } from './related-asset-card-content';

export const ExtendedRelatedCardContent = ({
  associatedObjects,
}: {
  associatedObjects: AssociatedObject[];
}) => (
  <LightWeightRelatedAssetWrapper>
    <Divider />
    {associatedObjects.map((object, index) => (
      <RelatedAssetWrapper key={`${object.identifier} - ${index}`}>
        <RelatedAsset associatedObject={object} />
        {index < associatedObjects.length - 1 && <Divider />}
      </RelatedAssetWrapper>
    ))}
  </LightWeightRelatedAssetWrapper>
);

const RelatedAssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
