import _ from 'lodash';
import { ReactNode, useCallback } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { VendorIcon } from '@src-v2/components/icons';
import { Link } from '@src-v2/components/typography';
import { AboutPackageCard } from '@src-v2/containers/entity-pane/sca/main-tab/about-package-card';
import { VulnerabilitiesCards } from '@src-v2/containers/entity-pane/sca/main-tab/vulnerabilities-card';
import { CiCdDependencyElement } from '@src-v2/types/inventory-elements';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const PipelineScaMainTab = (props: ControlledCardProps) => {
  const { risk, element, relatedProfile } = useEntityPaneContext<CiCdDependencyElement>();

  return (
    <>
      <PipelineAboutScaCard {...props}>
        <EvidenceLine label="Pipeline">
          {relatedProfile.vendor && <VendorIcon name={element.cicdPipelineTechnology} />}
          <Link
            to={`/profiles/repositories/${relatedProfile.key}/inventory/supplyChain/pipelines?pane=profile`}
            onClick={stopPropagation}>
            {element.id}
          </Link>
        </EvidenceLine>
      </PipelineAboutScaCard>
      {Boolean(element.dependencyFindings?.length) && (
        <VulnerabilitiesCards {...props} findings={element.dependencyFindings} />
      )}
      {element.packageDigest && <AboutPackageCard {...props} />}
      {!risk && <ContributorsCard />}
    </>
  );
};

export const PipelineAboutScaCard = ({
  children,
  ...props
}: ControlledCardProps & { children?: ReactNode }) => {
  const { risk, element, relatedProfile } = useEntityPaneContext<CiCdDependencyElement>();
  const trackAnalytics = useTrackAnalytics();

  const combinedInsights = _.unionBy(
    risk?.insights ?? [],
    element.insights ?? [],
    insight => insight.badge
  );

  const handleCodeReferencedClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'Pipeline SCA main tab',
      [AnalyticsDataField.EntryPoint]: 'About risk card',
    });
  }, [trackAnalytics]);

  return (
    // @ts-ignore
    <ControlledCard {...props} title={`About this ${risk ? 'risk' : 'dependency'}`}>
      {risk && <RiskLevelWidget risk={risk} />}
      {risk && <DiscoveredEvidenceLine risk={risk} />}
      {risk && <DueDateEvidenceLine risk={risk} />}
      {(element.resolvedVersion || element.version) && (
        <EvidenceLine label="Version">{element.resolvedVersion ?? element.version}</EvidenceLine>
      )}

      <>
        <EvidenceLine label="Technology">
          {element.technologyDescription} ({element.technologyDependencyDescription})
        </EvidenceLine>
        {element.codeReference && (
          <EvidenceLine label="Introduced through">
            <CodeReferenceLink
              repository={relatedProfile}
              codeReference={element.codeReference}
              onClick={handleCodeReferencedClick}
            />
          </EvidenceLine>
        )}
      </>

      {children}

      {Boolean(combinedInsights.length) && (
        <EvidenceLine label="Insights">
          <ElementInsights insights={combinedInsights} />
        </EvidenceLine>
      )}
      {Boolean(risk?.providers?.length) && <SourceEvidenceLine providers={risk.providers} />}

      {element.description && (
        <EvidenceLine label="Description">{element.description}</EvidenceLine>
      )}
    </ControlledCard>
  );
};
