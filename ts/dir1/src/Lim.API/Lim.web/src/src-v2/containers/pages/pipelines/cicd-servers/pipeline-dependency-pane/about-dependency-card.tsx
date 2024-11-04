import styled from 'styled-components';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { usePipelineDependencyContext } from '@src-v2/containers/pages/pipelines/cicd-servers/pipeline-dependency-pane/pipeline-dependency-context-provider';

export function AboutDependencyCard(props: ControlledCardProps) {
  const {
    serverDependencyInfo: { dependency },
  } = usePipelineDependencyContext();

  return (
    <ControlledCard {...props} title="About this dependency">
      <CardBody>
        <EvidenceLine label="Version">{dependency.version}</EvidenceLine>
        {Boolean(dependency.insights?.length) && (
          <EvidenceLine label="Insights">
            <ElementInsights insights={dependency.insights} />
          </EvidenceLine>
        )}
        <EvidenceLine label="Technology">
          <VendorIcon name={dependency.provider} size={Size.XSMALL} /> {dependency.cicdTechnology}
        </EvidenceLine>
      </CardBody>
    </ControlledCard>
  );
}

const CardBody = styled.div`
  padding: 0 0 4rem;
`;
