import _ from 'lodash';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutLightweightFindingCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/about-lightweight-finding-card';
import { AffectedAssetsLightweightCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/affected-assets-lightweight-card';
import { useFindingContext } from '@src-v2/containers/finding-pane/finding-context-provider';
import {
  AssociatedObject,
  AssociatedObjectRole,
} from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RelatedAssetsLightweightCard } from '../entity-pane/lightweight-finding/evidence-tab/related-assets-lightweight-card';

export const FindingPaneContent = (props: ControlledCardProps) => {
  const { finding } = useFindingContext();
  const { associatedObjects } = finding;

  const groupedByFindings = _.groupBy(
    associatedObjects,
    object => object.associatedObjectRole
  ) as Record<AssociatedObjectRole, AssociatedObject[]>;
  return (
    <>
      <AboutLightweightFindingCard finding={finding} type="finding" {...props} />
      {Boolean(groupedByFindings.Subject?.length) && (
        <AffectedAssetsLightweightCard associatedObjects={groupedByFindings.Subject} {...props} />
      )}
      {Boolean(groupedByFindings.Related?.length) && (
        <RelatedAssetsLightweightCard associatedObjects={groupedByFindings.Related} {...props} />
      )}
    </>
  );
};
