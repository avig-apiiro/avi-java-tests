import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { DiffableEntityPane } from '@src-v2/components/entity-pane/diffable-entity/diffable-entity-pane';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import {
  CenteredEvidenceLine,
  EvidenceLine,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { SvgIcon } from '@src-v2/components/icons';
import { PaneProps } from '@src-v2/components/panes/pane';
import { Size } from '@src-v2/components/types/enums/size';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { CodeFrameworkType } from '@src-v2/types/enums/code-framework-type';
import { FrameworkUsageElement } from '@src-v2/types/inventory-elements/framework-usage-element';

export function FrameworkUsageEntityPane(
  props: { dataModelReference: DiffableEntityDataModelReference } & PaneProps
) {
  return (
    <DiffableEntityPane {...props}>
      {childProps => (
        <>
          <AboutThisFrameworkCard {...childProps} />
        </>
      )}
    </DiffableEntityPane>
  );
}

function AboutThisFrameworkCard(props: ControlledCardProps) {
  const { element, relatedProfile, risk } = useEntityPaneContext<FrameworkUsageElement>();

  return (
    <ControlledCard {...props} title="About this Technology">
      <AboutThisFrameworkContent
        element={element}
        relatedProfile={relatedProfile}
        moduleName={risk?.moduleName}
      />
    </ControlledCard>
  );
}

export const AboutThisFrameworkContent = ({ element, relatedProfile, moduleName }) => (
  <>
    {element.type && (
      <EvidenceLine label="Framework type">{CodeFrameworkType[element.type]}</EvidenceLine>
    )}
    {Boolean(element.insights?.length) && (
      <EvidenceLine label="Insights">
        <ElementInsights insights={element.insights} />
      </EvidenceLine>
    )}
    {moduleName && (
      <CenteredEvidenceLine label="Code module">
        <SvgIcon size={Size.XXSMALL} name="Module" /> {moduleName}
      </CenteredEvidenceLine>
    )}
    <EvidenceLine label="Introduced through">
      <CodeReferenceLink codeReference={element.codeReference} repository={relatedProfile} />
    </EvidenceLine>
  </>
);
