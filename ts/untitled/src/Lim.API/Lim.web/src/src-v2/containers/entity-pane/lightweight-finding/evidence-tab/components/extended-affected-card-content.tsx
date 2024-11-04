import styled from 'styled-components';
import {
  AffectedAsset,
  Divider,
  LightWeightAffectedAssetWrapper,
} from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/affected-asset-card-content';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const ExtendedAffectedCardContent = ({
  associatedObjects,
}: {
  associatedObjects: AssociatedObject[];
}) => (
  <LightWeightAffectedAssetWrapper>
    <Divider />
    {associatedObjects.map((object, index) => (
      <AffectedAssetWrapper key={`${object.identifier} - ${index}`}>
        <AffectedAsset associatedObject={object} />
        {index < associatedObjects.length - 1 && <Divider />}
      </AffectedAssetWrapper>
    ))}
  </LightWeightAffectedAssetWrapper>
);

const AffectedAssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
