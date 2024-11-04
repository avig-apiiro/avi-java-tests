import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { AboutApiRiskCard } from '@src-v2/containers/entity-pane/api/main-tab/about-api-risk-card';
import { ApiGatewayCard } from '@src-v2/containers/entity-pane/api/main-tab/api-gateway-card';
import { DataModelsCard } from '@src-v2/containers/entity-pane/api/main-tab/data-models-card';
import { MatchedEndpointsCard } from '@src-v2/containers/entity-pane/api/main-tab/matched-endpoints-card';
import { RelatedSastFindings } from '@src-v2/containers/entity-pane/api/main-tab/related-sast-findings';
import { RuntimeFindingCardFromSummaries } from '@src-v2/containers/entity-pane/api/main-tab/runtime-findings-card';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export function ApiMainTab(props: ControlledCardProps) {
  const { application } = useInject();
  const { element, risk } = useApiPaneContext();
  const showExposureGraph = shouldShowExposureGraph(risk, application);

  const hasDataModels = Boolean(
    (element.involvedDataModels?.length ?? 0) + (element.exposedDataModels?.length ?? 0)
  );
  const { relatedEndpoints } = element;

  return (
    <>
      <AboutApiRiskCard {...props} />
      {application.isFeatureEnabled(FeatureFlag.AkamaiInternetExposed) &&
        relatedEndpoints?.length > 0 && <MatchedEndpointsCard {...props} />}
      {showExposureGraph && <ExposurePathCard {...props} />}
      {hasDataModels && <DataModelsCard {...props} />}
      {Boolean(risk) && <RelatedSastFindings {...props} />}

      {element.apiFindingsSummaries?.map(summary => (
        <RuntimeFindingCardFromSummaries
          {...props}
          key={summary.provider}
          findingsSummary={summary}
        />
      ))}

      {element.apiGatewaySummary && <ApiGatewayCard {...props} />}

      {!risk && <ContributorsCard />}
    </>
  );
}
