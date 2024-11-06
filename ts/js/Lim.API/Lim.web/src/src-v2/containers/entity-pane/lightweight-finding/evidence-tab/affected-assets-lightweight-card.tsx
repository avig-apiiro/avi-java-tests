import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AffectedAssetCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/affected-asset-card-content';
import { ExtendedAffectedCardContent } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/components/extended-affected-card-content';
import { AssociatedObject } from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const AffectedAssetsLightweightCard = ({
  associatedObjects,
  ...props
}: ControlledCardProps & { associatedObjects: AssociatedObject[] }) => (
  <ControlledCard
    {...props}
    title={
      associatedObjects.length === 1
        ? 'Affected asset'
        : `Affected assets (${associatedObjects.length})`
    }
    nestedContent={
      associatedObjects.length > 2 ? (
        <ExtendedAffectedCardContent
          associatedObjects={associatedObjects.slice(2, associatedObjects.length)}
        />
      ) : null
    }>
    <AffectedAssetCardContent associatedObjects={associatedObjects.slice(0, 2)} />
  </ControlledCard>
);
