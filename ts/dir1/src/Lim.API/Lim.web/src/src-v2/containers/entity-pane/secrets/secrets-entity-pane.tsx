import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { PaneProps } from '@src-v2/components/panes/pane';
import { AboutSecretCard } from '@src-v2/containers/entity-pane/secrets/main-tab/about-this-secret-card';
import { useInject } from '@src-v2/hooks';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';

export function SecretsEntityPane({
  dataModelReference,
  ...props
}: { dataModelReference: DiffableEntityDataModelReference } & PaneProps) {
  const { inventory } = useInject();

  return (
    <DiffableEntityPane
      {...props}
      dataModelReference={dataModelReference}
      elementDataFetcher={inventory.getSecretElement}>
      {props => (
        <>
          <AboutSecretCard {...props} />
          <ContributorsCard />
        </>
      )}
    </DiffableEntityPane>
  );
}
