import { format } from 'date-fns';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Divider } from '@src-v2/components/divider';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { ComplianceFrameworkReferences } from '@src-v2/components/entity-pane/evidence/evidence-compliance-framework-references';
import {
  DiscoveredEvidenceLine,
  FirstDetectedEvidenceLine,
  FirstOccurenceEvidenceLine,
} from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { ExternalLink, Heading5 } from '@src-v2/components/typography';
import { useSastPaneContext } from '@src-v2/containers/entity-pane/sast/use-sast-pane-context';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { isEmptyDate } from '@src-v2/utils/datetime-utils';
import { RiskTag } from '@src/src-v2/components/tags';
import { ExpandableDescription } from '../expandable-description';

const TagKeys = [
  'externalStatus',
  'url',
  'reportUrl',
  'FirstOccurrenceTime',
  'latestDetectionTime',
  'externalType',
  'Category',
  'firstDetectionTime',
  'additionalReferenceUrls',
  'externalSeverity',
  'likelihood',
  'Severity',
  'Owasp',
  'References',
  'Likelihood',
  'Tool',
  'State',
] as const;

const AboutCardContent = observer(() => {
  const { element, relatedProfile, risk } = useSastPaneContext();
  const trackAnalytics = useTrackAnalytics();

  const handleCodeReferencedClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'About SAST card',
      [AnalyticsDataField.EntryPoint]: 'About risk card',
    });
  }, [trackAnalytics]);

  return (
    <EvidenceLinesWrapper>
      {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
      {risk && <DiscoveredEvidenceLine isExtendedWidth risk={risk} />}
      {risk && <DueDateEvidenceLine isExtendedWidth risk={risk} />}
      {element.issueTitle && (
        <EvidenceLine isExtendedWidth label="Finding name">
          {element.issueTitle}
        </EvidenceLine>
      )}
      {Boolean(element.codeReference?.relativeFilePath) && (
        <EvidenceLine isExtendedWidth label="Path">
          <CodeReferenceLink
            repository={relatedProfile}
            codeReference={element.codeReference}
            onClick={handleCodeReferencedClick}
            showLineNumber
          />
        </EvidenceLine>
      )}
      {Boolean(element.insights.length) && (
        <EvidenceLine isExtendedWidth label="Insights">
          <ElementInsights insights={element.insights} />
        </EvidenceLine>
      )}
      {Boolean(risk?.providers?.length) && (
        <SourceEvidenceLine isExtendedWidth providers={risk.providers} />
      )}
      {element.description && (
        <EvidenceLine isExtendedWidth label="Description">
          <ExpandableDescription maxPreviewChars={250}>{element.description}</ExpandableDescription>
        </EvidenceLine>
      )}
      {element.complianceFrameworkReferences?.length > 0 && (
        <>
          <Heading5>Issue identifiers and compliance</Heading5>
          <ComplianceFrameworkReferences references={element.complianceFrameworkReferences} />
        </>
      )}
    </EvidenceLinesWrapper>
  );
});

const ExtendedAboutCardContent = () => {
  const { element } = useSastPaneContext();

  // All this logic will be removed when backend will do it from their side - https://apiiro.atlassian.net/browse/LIM-18287
  const extractMissingTags = useCallback(
    <T extends Record<string, string>>(
      obj: T,
      allowedKeys: typeof TagKeys
    ): Record<string, string> => {
      const missingTags: Record<string, string> = {};

      for (const key in obj) {
        if (!allowedKeys.includes(key as (typeof TagKeys)[number]) && obj[key]) {
          missingTags[key] = obj[key];
        }
      }

      return missingTags;
    },
    [element.tags]
  );

  const missingTags = extractMissingTags(element.tags, TagKeys);

  return (
    <EvidenceLinesWrapper>
      <Divider />
      <Heading5>Additional information from {getProviderDisplayName(element.provider)}:</Heading5>
      {!_.isEmpty(element.additionalReferenceUrls) && (
        <EvidenceLine isExtendedWidth label="References">
          <ReferencesWrapper>
            {element.additionalReferenceUrls.map(reference => (
              <>
                <ExternalLink href={reference} key={reference}>
                  {reference}
                </ExternalLink>
              </>
            ))}
          </ReferencesWrapper>
        </EvidenceLine>
      )}
      {element.externalSeverity && (
        <EvidenceLine isExtendedWidth label="Severity">
          <RiskTag riskLevel={_.camelCase(element.severity.toString())}>
            {element.externalSeverity}
          </RiskTag>
        </EvidenceLine>
      )}
      {element.likelihood && (
        <EvidenceLine isExtendedWidth label="Likelihood">
          {element.likelihood}
        </EvidenceLine>
      )}
      {!isEmptyDate(element.latestDetectionTime) && (
        <EvidenceLine isExtendedWidth label="Latest scan">
          {format(new Date(element.latestDetectionTime), 'MMM d, yyyy')}
        </EvidenceLine>
      )}
      <FirstDetectedEvidenceLine isExtendedWidth firstDetectionTime={element.firstDetectionTime} />
      <FirstOccurenceEvidenceLine isExtendedWidth firstOccurenceTime={element.FirstOccurenceTime} />
      {Boolean(element.url) && (
        <EvidenceLine isExtendedWidth label="Finding link">
          <ExternalLink href={element.url}>
            View in {getProviderDisplayName(element.provider)}
          </ExternalLink>
        </EvidenceLine>
      )}
      {element.externalType && (
        <EvidenceLine isExtendedWidth label="Finding type">
          {element.externalType}
        </EvidenceLine>
      )}
      {element.externalStatus && (
        <EvidenceLine isExtendedWidth label="Status">
          {element.externalStatus}
        </EvidenceLine>
      )}
      {element.reportUrl && (
        <EvidenceLine isExtendedWidth label="Report">
          <ExternalLink href={element.reportUrl}>{element.reportUrl}</ExternalLink>
        </EvidenceLine>
      )}
      {!_.isEmpty(missingTags) &&
        Object.keys(missingTags).map(missingTag => (
          <EvidenceLine
            isExtendedWidth
            label={_.capitalize(_.lowerCase(missingTag))}
            key={missingTag}>
            {missingTags[missingTag]}
          </EvidenceLine>
        ))}
    </EvidenceLinesWrapper>
  );
};

export const AboutSastCard = ({ ...props }: ControlledCardProps) => {
  const { element } = useSastPaneContext();

  const renderSection = Boolean(
    !_.isEmpty(element.additionalReferenceUrls) ||
      element.externalSeverity ||
      element.likelihood ||
      !isEmptyDate(element.latestDetectionTime) ||
      !isEmptyDate(element.firstDetectionTime) ||
      !isEmptyDate(element.FirstOccurenceTime) ||
      element.url ||
      element.externalType ||
      element.externalStatus
  );

  return (
    <ControlledCard
      {...props}
      title="About this risk"
      nestedContent={renderSection ? <ExtendedAboutCardContent /> : null}>
      <AboutCardContent />
    </ControlledCard>
  );
};

const ReferencesWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
