import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { PaneProps } from '@src-v2/components/panes/pane';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { humanize } from '@src-v2/utils/string-utils';

export function DataModelEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisDataModelCard {...childProps} />
          <ContributorsCard />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisDataModelCard(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext();

  return (
    <ControlledCard {...props} title="About this data model">
      {element.codeReference && (
        <EvidenceLine label="Introduced through">
          <CodeReferenceLink repository={relatedProfile} codeReference={element.codeReference} />
        </EvidenceLine>
      )}
      {Object.entries(element).map(
        ([key, value]) =>
          (typeof value === 'string' || typeof value === 'number') && (
            <EvidenceLine key={key} label={humanize(key)}>
              {value}
            </EvidenceLine>
          )
      )}
    </ControlledCard>
  );
}
