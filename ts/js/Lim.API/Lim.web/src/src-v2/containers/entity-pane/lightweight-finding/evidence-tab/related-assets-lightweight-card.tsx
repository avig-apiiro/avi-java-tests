import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ExtendedRelatedCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/extended-related-card-content';
import { RelatedAssetCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/related-asset-card-content';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const RelatedAssetsLightweightCard = ({
  associatedObjects,
  ...props
}: ControlledCardProps & { associatedObjects: AssociatedObject[] }) => (
  <ControlledCard
    {...props}
    title={
      associatedObjects.length === 1
        ? 'Related asset'
        : `Related assets (${associatedObjects.length})`
    }
    nestedContent={
      associatedObjects.length > 2 ? (
        <ExtendedRelatedCardContent
          associatedObjects={associatedObjects.slice(2, associatedObjects.length)}
        />
      ) : null
    }>
    <RelatedAssetCardContent associatedObjects={associatedObjects.slice(0, 2)} />
  </ControlledCard>
);
