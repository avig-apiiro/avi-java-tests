import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { PaneProps } from '@src-v2/components/panes/pane';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { DockerFileElement } from '@src-v2/types/inventory-elements/docker-file-element';

export function DockerFileEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => <AboutThisDockerFileCard {...childProps} />}
    </DiffableEntityPane>
  );
}

function AboutThisDockerFileCard(props: ControlledCardProps) {
  const { element, relatedProfile } = useEntityPaneContext<DockerFileElement>();

  return (
    <ControlledCard {...props} title="About this Docker file">
      {element.codeReference && (
        <EvidenceLine label="Introduced through">
          <CodeReferenceLink codeReference={element.codeReference} repository={relatedProfile} />
        </EvidenceLine>
      )}
      {Boolean(element.insights?.length) && (
        <EvidenceLine label="Insights">
          <ElementInsights insights={element.insights} />
        </EvidenceLine>
      )}
      {Boolean(element.involvedModules?.length) && (
        <EvidenceLine label="Involved modules">
          <UnorderedList>
            {element.involvedModules.map(module => (
              <ListItem key={module.key}>{module.name}</ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}
      {Boolean(element.baseDockerImages?.length) && (
        <EvidenceLine label="Base images">
          <UnorderedList>
            {element.baseDockerImages.map(image => (
              <ListItem key={image}>{image}</ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}
      {Boolean(element.exposedPorts?.length) && (
        <EvidenceLine label="Exposed ports">{element.exposedPorts.join(', ')}</EvidenceLine>
      )}
      {Boolean(element.relatedDockerImageNames?.length) && (
        <EvidenceLine label="Related image names">
          <UnorderedList>
            {element.relatedDockerImageNames.map(image => (
              <ListItem key={image}>{image}</ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}

      {Boolean(element.users?.length) && (
        <EvidenceLine label="Image is running with user">
          <UnorderedList>
            {element.users.map(username => (
              <ListItem key={username}>{username}</ListItem>
            ))}
          </UnorderedList>
        </EvidenceLine>
      )}
    </ControlledCard>
  );
}
