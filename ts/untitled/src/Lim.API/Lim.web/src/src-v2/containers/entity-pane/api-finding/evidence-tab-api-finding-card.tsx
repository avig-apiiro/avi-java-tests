import _ from 'lodash';
import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { useApiFindingsPaneContext } from '@src-v2/containers/entity-pane/api-finding/use-api-findings-pane-context';
import { EndpointDetailsCard } from '@src-v2/containers/entity-pane/api/main-tab/endpoint-details-card';
import { RuntimeFindingCard } from '@src-v2/containers/entity-pane/api/main-tab/runtime-findings-card';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function EvidenceTabApiFindingCard(props: ControlledCardProps) {
  const { application } = useInject();
  const { element, risk } = useApiFindingsPaneContext();

  const [relatedEndpoint = {}] = element.relatedEndpoints || [];

  return (
    <>
      {application.isFeatureEnabled(FeatureFlag.AkamaiInternetExposed) &&
        !_.isEmpty(relatedEndpoint) && <EndpointDetailsCard {...props} />}
      {Boolean(risk) && (
        <RuntimeFindingCard
          {...props}
          provider={element.provider}
          finding={element}
          lastScanTime={element.lastScanTime}
        />
      )}
      {!risk && <ContributorsCard />}
    </>
  );
}
