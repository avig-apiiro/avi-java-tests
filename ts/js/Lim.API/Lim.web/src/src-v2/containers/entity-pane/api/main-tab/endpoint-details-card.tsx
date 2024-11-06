import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { ExternalLink } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';

export const EndpointDetailsCard = (props: ControlledCardProps) => {
  const { element } = useApiPaneContext();
  const [relatedEndpoint] = element.relatedEndpoints;

  return (
    <ControlledCard title="Endpoint details" {...props}>
      <EvidenceLinesWrapper>
        <EvidenceLine isExtendedWidth label="Name">
          <ExternalLink href={relatedEndpoint.externalUrl}>
            {relatedEndpoint.method} {relatedEndpoint.route}
          </ExternalLink>
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Service">
          <ExternalLink href={relatedEndpoint.serviceExternalUrl}>
            {relatedEndpoint.serviceName}
          </ExternalLink>
        </EvidenceLine>
        {/*<EvidenceLine isExtendedWidth label="Calles">*/}
        {/*  Calles:*/}
        {/*</EvidenceLine>*/}
        {/*<EvidenceLine isExtendedWidth label="First seen">*/}
        {/*  First seen:*/}
        {/*</EvidenceLine>*/}
        {/*<EvidenceLine isExtendedWidth label="Last seen">*/}
        {/*  Last seen:*/}
        {/*</EvidenceLine>*/}
        <SourceEvidenceLine isExtendedWidth providers={[relatedEndpoint.provider]} />
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
};
