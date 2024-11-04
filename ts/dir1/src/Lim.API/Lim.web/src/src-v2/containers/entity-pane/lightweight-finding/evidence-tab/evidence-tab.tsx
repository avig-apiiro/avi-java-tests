import _ from 'lodash';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { AboutLightweightFindingCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/about-lightweight-finding-card';
import { AffectedAssetsLightweightCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/affected-assets-lightweight-card';
import { RelatedAssetsLightweightCard } from '@src-v2/containers/entity-pane/lightweight-finding/evidence-tab/related-assets-lightweight-card';
import { useLightweightFindingPaneContext } from '@src-v2/containers/entity-pane/lightweight-finding/use-lightweight-finding-pane-context';
import {
  AssociatedObject,
  AssociatedObjectRole,
} from '@src-v2/types/inventory-elements/lightweight-finding-response';

export const LightWeightEvidenceTab = (props: ControlledCardProps) => {
  const { finding, risk } = useLightweightFindingPaneContext();
  const { associatedObjects } = finding;

  const groupedByFindings = _.groupBy(
    associatedObjects,
    object => object.associatedObjectRole
  ) as Record<AssociatedObjectRole, AssociatedObject[]>;
  return (
    <>
      <AboutLightweightFindingCard finding={finding} risk={risk} {...props} />
      {Boolean(groupedByFindings.Subject?.length) && (
        <AffectedAssetsLightweightCard associatedObjects={groupedByFindings.Subject} {...props} />
      )}
      {Boolean(groupedByFindings.Related?.length) && (
        <RelatedAssetsLightweightCard associatedObjects={groupedByFindings.Related} {...props} />
      )}
    </>
  );
};
