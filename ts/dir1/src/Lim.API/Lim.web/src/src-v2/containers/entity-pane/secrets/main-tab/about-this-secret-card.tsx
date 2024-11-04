import { format } from 'date-fns';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Badge } from '@src-v2/components/badges';
import { TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Divider } from '@src-v2/components/divider';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import {
  DiscoveredEvidenceLine,
  FirstDetectedEvidenceLine,
} from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { ValidityIcon, getValidityMapper } from '@src-v2/components/risk/risk-validity';
import { InsightTag } from '@src-v2/components/tags';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { ExternalLink, Heading5, ListItem, UnorderedList } from '@src-v2/components/typography';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { useSecretsPaneContext } from '@src-v2/containers/entity-pane/secrets/use-secrets-pane-context';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { dateFormats } from '@src-v2/data/datetime';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useInject } from '@src-v2/hooks';
import { CodeOccurrence, SecretElement } from '@src-v2/types/inventory-elements';
import { isEmptyDate } from '@src-v2/utils/datetime-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { cutAroundCensoredValue } from '@src-v2/utils/secret-utils';
import { humanize } from '@src-v2/utils/string-utils';
import { openShowOnClusterMap } from '@src/cluster-map-work/containers/panes/ShowOnClusterClusterMap';

const MAX_PREVIEW_OCCURRENCES = 5;
const AboutCardContent = () => {
  const { element, risk, relatedProfile } = useSecretsPaneContext();
  const paneState = usePaneState();
  const trackAnalytics = useTrackAnalytics();
  // @ts-ignore
  const isExternalSecret = Boolean(!element.sources.includes('Apiiro'));
  const isNonCodeSecret = element.fileClassification.key === 'NonCode';
  const isDeletedIssueComment = element.displayName === 'Deleted Github Issue comment';

  const handleCodeReferencedClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'About this secret card',
      [AnalyticsDataField.EntryPoint]: 'Evidence',
    });
  }, [trackAnalytics]);

  const handleShowOnCluster = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Show on cluster',
    });

    openShowOnClusterMap(
      {
        annotatedRepositoryAndModuleReferences: [risk],
        title: risk.riskName,
      },
      paneState
    );
  }, [risk]);

  return (
    <EvidenceLinesWrapper>
      {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
      {risk && <DiscoveredEvidenceLine isExtendedWidth risk={risk} />}
      {risk && <DueDateEvidenceLine isExtendedWidth risk={risk} />}
      <EvidenceLine isExtendedWidth label="Validity">
        <ValidityIcon data-type={element.validity} name={getValidityMapper(element)?.icon} />{' '}
        {humanize(element.validity)}{' '}
        {element.validity !== 'Unknown' && element.validity !== 'NoValidator' && 'secret'}
        {element.validatedOn &&
          !isEmptyDate(element.validatedOn) &&
          element.validity !== 'Unknown' &&
          element.validity !== 'NoValidator' &&
          `. Last checked as ${_.lowerFirst(humanize(element.validity))}: ${format(
            element.validatedOn,
            dateFormats.usDateTime
          )}`}
      </EvidenceLine>
      {element.secretType && element.secretType.label !== 'External' ? (
        <EvidenceLine isExtendedWidth label="Secret type">
          <VendorIcon name={element.platform} /> {element.secretType.label}
        </EvidenceLine>
      ) : element.externalSecretType ? (
        <EvidenceLine isExtendedWidth label="Secret type">
          {element.externalSecretType}
        </EvidenceLine>
      ) : null}

      {element.exposure?.key && (
        <EvidenceLine isExtendedWidth label="Exposure">
          <InsightTag insight={{ badge: element.exposure.label, sentiment: 'Neutral' }} />
        </EvidenceLine>
      )}

      {!_.isEmpty(element.insights) &&
        element.insights.some(insight => insight.badge === 'Internet exposed') && (
          <EvidenceLine isExtendedWidth label="Clusters">
            <ShowOnClusterUnderlineButton onClick={handleShowOnCluster}>
              <ClusterIcon name="Cluster" />
              Show on cluster
            </ShowOnClusterUnderlineButton>
          </EvidenceLine>
        )}

      {!_.isEmpty(element.insights) && (
        <EvidenceLine isExtendedWidth label="Insights">
          <ElementInsights insights={element.insights} />
        </EvidenceLine>
      )}
      <EvidenceLine isExtendedWidth label="File type">
        {element.fileClassification.label}
      </EvidenceLine>
      {!_.isEmpty(element.environments) && (
        <EvidenceLine label="Environments">
          {element.environments.map(environment => (
            <Badge key={environment}>{environment}</Badge>
          ))}
        </EvidenceLine>
      )}
      <EvidenceLine isExtendedWidth label="Path">
        {element.codeReference?.relativeFilePath && !isExternalSecret ? (
          <CodeReferenceLink
            repository={relatedProfile}
            codeReference={element.codeReference}
            onClick={handleCodeReferencedClick}
            showLineNumberInLink={false}
          />
        ) : (
          <ExternalLink href={element.findingLocationUrl}>{element.displayName}</ExternalLink>
        )}
      </EvidenceLine>
      {!isDeletedIssueComment && (
        <EvidenceLine isExtendedWidth label="Appearances">
          <ContentContainer>
            Appears {pluralFormat(element.occurrencesCount, 'time', null, true)} in the file
            {Boolean(element.relatedFindingSummaryInfos?.length) && (
              <InfoTooltipWithHover
                content={
                  isNonCodeSecret
                    ? 'May include appearances in deleted resources'
                    : 'May include appearances in unmonitored branches and historical commits'
                }
              />
            )}
          </ContentContainer>
        </EvidenceLine>
      )}
      {!_.isEmpty(element.occurrences) && !isDeletedIssueComment && (
        <EvidenceLine isExtendedWidth label="Preview">
          <UnorderedListPreview>
            {element.occurrences.map((occurrence, index) => (
              <CensoredValueLine key={index}>
                <ExternalLink
                  href={
                    occurrence.url === null && (occurrence as CodeOccurrence).lineNumber
                      ? generateCodeReferenceUrl(relatedProfile, {
                          relativeFilePath: element.codeReference.relativeFilePath,
                          lineNumber: (occurrence as CodeOccurrence).lineNumber,
                        })
                      : occurrence.url
                  }>
                  {occurrence.displayName}:
                </ExternalLink>{' '}
                {cutAroundCensoredValue(occurrence.censoredValue)}
              </CensoredValueLine>
            ))}
            {element.occurrencesCount > MAX_PREVIEW_OCCURRENCES && (
              <CensoredValueLine>
                And {element.occurrencesCount - MAX_PREVIEW_OCCURRENCES} more
              </CensoredValueLine>
            )}
          </UnorderedListPreview>
        </EvidenceLine>
      )}
      {!_.isEmpty(element.sources) && (
        <SourceEvidenceLine isExtendedWidth providers={element.sources} />
      )}
    </EvidenceLinesWrapper>
  );
};

const UnorderedListPreview = styled(UnorderedList)`
  padding: 0;
`;

const ExtendedAboutExternalSecretCardContent = ({ element }: { element: SecretElement }) => (
  <EvidenceLinesWrapper>
    <Divider />
    {element.relatedFindingSummaryInfos.map(relatedFindingSummaryInfo => (
      <>
        <Heading5>
          Additional information from {getProviderDisplayName(relatedFindingSummaryInfo.provider)}:
        </Heading5>
        {relatedFindingSummaryInfo.externalSeverity && (
          <EvidenceLine isExtendedWidth label="Severity">
            {humanize(relatedFindingSummaryInfo.externalSeverity)}
          </EvidenceLine>
        )}
        {relatedFindingSummaryInfo.externalValidity && (
          <EvidenceLine isExtendedWidth label="Validity">
            {humanize(relatedFindingSummaryInfo.externalValidity)}
          </EvidenceLine>
        )}
        <FirstDetectedEvidenceLine
          isExtendedWidth
          firstDetectionTime={relatedFindingSummaryInfo.firstDetectionTime}
        />
        {Boolean(relatedFindingSummaryInfo.url) && (
          <EvidenceLine isExtendedWidth label="Finding link">
            <ExternalLink href={relatedFindingSummaryInfo.url}>
              View in {getProviderDisplayName(relatedFindingSummaryInfo.provider)}
            </ExternalLink>
          </EvidenceLine>
        )}
        {relatedFindingSummaryInfo.tags &&
          Object.entries(relatedFindingSummaryInfo.tags).map(([key, value]) => (
            <EvidenceLine isExtendedWidth label={key} key={key}>
              {value}
            </EvidenceLine>
          ))}
      </>
    ))}
  </EvidenceLinesWrapper>
);

const ExtendedAboutJwtSecretCardContent = ({ element }: { element: SecretElement }) => {
  const JwtInfo = element.additionalJwtInfo;

  const hasSensitiveDataFields = useMemo(() => {
    return JwtInfo.sensitiveDataFields.length > 0;
  }, [JwtInfo.sensitiveDataFields]);

  const isExpired = useMemo(() => {
    return JwtInfo.jwtIsValidUntil < new Date();
  }, [JwtInfo.jwtIsValidUntil]);

  return (
    <EvidenceLinesWrapper>
      <Divider />
      <Heading5>JWT attributes:</Heading5>
      {(hasSensitiveDataFields || !JwtInfo.jwtIsValidUntil || isExpired) && (
        <EvidenceLine isExtendedWidth label="JWT insights">
          {(!JwtInfo.jwtIsValidUntil || isExpired) && (
            <InsightTag insight={{ badge: `Active`, sentiment: 'Negative' }} />
          )}
          {hasSensitiveDataFields && (
            <InsightTag insight={{ badge: `Contains sensitive keys`, sentiment: 'Negative' }} />
          )}
        </EvidenceLine>
      )}
      {JwtInfo.signatureAlgorithm && (
        <EvidenceLine isExtendedWidth label="Algorithm">
          {JwtInfo.signatureAlgorithm}
        </EvidenceLine>
      )}
      {JwtInfo.jwtIsValidFrom && (
        <EvidenceLine isExtendedWidth label="Valid From">
          {format(new Date(JwtInfo.jwtIsValidFrom), 'MMM d, yyyy')}
        </EvidenceLine>
      )}
      <EvidenceLine isExtendedWidth label="Expires on">
        {JwtInfo.jwtIsValidUntil
          ? format(new Date(JwtInfo.jwtIsValidUntil), 'MMM d, yyyy')
          : `None`}
      </EvidenceLine>
      <EvidenceLine isExtendedWidth label="Sensitive keys">
        {hasSensitiveDataFields ? JwtInfo.sensitiveDataFields.join(', ') : 'None'}
      </EvidenceLine>
    </EvidenceLinesWrapper>
  );
};

export const AboutSecretCard = (props: ControlledCardProps) => {
  const { application } = useInject();
  const { element, risk } = useSecretsPaneContext();

  const renderNestedExternalSecretContent = Boolean(
    risk && element.relatedFindingSummaryInfos?.length
  );

  const renderNestedJwtSecretContent = Boolean(risk && element.additionalJwtInfo);

  const showExposureGraph = shouldShowExposureGraph(risk, application);

  return (
    <>
      <ControlledCard
        {...props}
        title={`About this ${risk ? 'risk' : 'secret'}`}
        nestedContent={
          renderNestedExternalSecretContent ? (
            <ExtendedAboutExternalSecretCardContent element={element} />
          ) : renderNestedJwtSecretContent ? (
            <ExtendedAboutJwtSecretCardContent element={element} />
          ) : null
        }>
        <AboutCardContent />
      </ControlledCard>
      {showExposureGraph && <ExposurePathCard {...props} />}
    </>
  );
};

const CensoredValueLine = styled(ListItem)`
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`;

const ShowOnClusterUnderlineButton = styled(TextButton)`
  display: flex;
  align-items: center;
`;

const ClusterIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
  margin-right: 1rem;

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

const InfoTooltipWithHover = styled(InfoTooltip)`
  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

const ContentContainer = styled.div`
  display: inline-flex;
`;
