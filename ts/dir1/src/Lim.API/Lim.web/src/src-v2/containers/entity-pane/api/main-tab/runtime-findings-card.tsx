import _ from 'lodash';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Badge } from '@src-v2/components/badges';
import { Banner } from '@src-v2/components/banner';
import { IconButton } from '@src-v2/components/buttons';
import { Card } from '@src-v2/components/cards';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { ComplianceFrameworkReferences } from '@src-v2/components/entity-pane/evidence/evidence-compliance-framework-references';
import {
  FirstDetectedEvidenceLine,
  LastDetectedEvidenceLine,
} from '@src-v2/components/entity-pane/evidence/evidence-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { HtmlMarkdown } from '@src-v2/components/html-markdown';
import { BaseIcon, ConditionalProviderIcon, SvgIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { ExternalLink, Heading, Heading5, Light } from '@src-v2/components/typography';
import { ExpandableDescription } from '@src-v2/containers/entity-pane/sast/expandable-description';
import { dateFormats } from '@src-v2/data/datetime';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useInject } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';
import {
  ApiFindingsSummary,
  Finding,
} from '@src-v2/types/inventory-elements/api/api-findings-summary';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { entries } from '@src-v2/utils/ts-utils';
import { EvidenceContainer } from '@src/src-v2/components/entity-pane/evidence/evidence';
import { RiskTag } from '@src/src-v2/components/tags';

export const RuntimeFindingCardFromSummaries = ({
  findingsSummary,
  ...props
}: { findingsSummary: ApiFindingsSummary } & ControlledCardProps) => (
  <>
    {findingsSummary.findings.map((finding, index) => (
      <RuntimeFindingCard
        {...props}
        key={index}
        finding={finding}
        provider={findingsSummary.provider}
        lastScanTime={findingsSummary.lastScanTime}
      />
    ))}
  </>
);

function createHeadersString(
  headers: Record<string, string>,
  body: string,
  url: string,
  httpMethod: string
) {
  const headerLines = entries(headers).map(([key, value]) => `-H "${key}: ${value}"`);
  return `curl -X ${httpMethod} ${headerLines.join(' ')} -d '${body}' ${url}`;
}

function TestedApiSection({ finding }: { finding: Finding }) {
  return (
    <EvidenceLinesWrapper>
      <Heading5>Tested API route/method:</Heading5>
      <EvidenceLine isExtendedWidth label="Method">
        <Badge>{finding.httpMethod}</Badge>
      </EvidenceLine>
      <EvidenceLine isExtendedWidth label="Route">
        <ExternalLink href={finding.route}> {finding.route}</ExternalLink>
      </EvidenceLine>
    </EvidenceLinesWrapper>
  );
}

const itemNotFoundText = 'Not Found';

const SeverityAndDescriptionSection = ({ finding }: { finding: Finding }) => (
  <EvidenceLinesWrapper>
    <EvidenceLine isExtendedWidth label="Severity">
      {finding.severity ? (
        <RiskTag riskLevel={_.camelCase(finding.severity)}>{finding.severity}</RiskTag>
      ) : (
        itemNotFoundText
      )}
    </EvidenceLine>
    {finding.state && (
      <EvidenceLine isExtendedWidth label="State">
        {finding.state}
      </EvidenceLine>
    )}
    <EvidenceLine isExtendedWidth label="Description">
      <ExpandableDescription>{finding.description ?? itemNotFoundText}</ExpandableDescription>
    </EvidenceLine>
  </EvidenceLinesWrapper>
);

function IssueIdentifiersAndLinksSection({ finding }: { finding: Finding }) {
  return (
    <>
      {finding.cweIdentifiers.length > 0 && (
        <>
          <Heading5>Issue identifiers:</Heading5>
          <EvidenceLine isExtendedWidth label="CWE">
            {Boolean(finding.cweIdentifiers.length > 0) && (
              <LinksWrapper>
                {finding.cweIdentifiers.map(cwe => (
                  <ExternalLink
                    href={`https://cwe.mitre.org/data/definitions/${cwe.match(/\d+/)[0]}.html`}>
                    {cwe}
                  </ExternalLink>
                ))}
              </LinksWrapper>
            )}
          </EvidenceLine>
        </>
      )}
      {finding.complianceFrameworkReferences?.length > 0 && (
        <>
          <Heading5>Issue identifiers and compliance</Heading5>
          <ComplianceFrameworkReferences references={finding.complianceFrameworkReferences} />
        </>
      )}
      {Boolean(finding.links.length > 0) && (
        <EvidenceLine isExtendedWidth label="Additional links">
          <LinksWrapper>
            {finding.links.map(link => (
              <ExternalLink href={link}>{link}</ExternalLink>
            ))}
          </LinksWrapper>
          {Boolean(finding.links.length === 0) && itemNotFoundText}
        </EvidenceLine>
      )}
    </>
  );
}

function HeadersList({ headers }: { headers: Record<string, string> }) {
  return (
    <>
      {entries(headers).map(([key, value]) => (
        <EvidenceLine isExtendedWidth label={key} key={key}>
          <ClampText>{value}</ClampText>
        </EvidenceLine>
      ))}
    </>
  );
}

function BodyItem({ body }: { body: string }) {
  return (
    <EvidenceLine isExtendedWidth label="Body">
      <ExpandableDescription maxPreviewChars={160}>
        {body ?? itemNotFoundText}
      </ExpandableDescription>
    </EvidenceLine>
  );
}

function RequestAndResponseSection({ finding }: { finding: Finding }) {
  const { toaster } = useInject();

  const handleCopyRequest = useCallback(async () => {
    await navigator.clipboard.writeText(
      createHeadersString(
        finding.requestHeaders,
        finding.requestBody,
        finding.route,
        finding.httpMethod
      )
    );

    toaster.success('Request copied to clipboard');
  }, [finding]);

  return (
    <>
      {(!_.isEmpty(finding.requestHeaders) || finding.requestBody) && (
        <>
          <FlexedAndSpacedBetween>
            <Heading5>Request header and body:</Heading5>
            <IconButton name="Copy" onClick={handleCopyRequest} />
          </FlexedAndSpacedBetween>

          <HeadersList headers={finding.requestHeaders} />
          <BodyItem body={finding.requestBody} />
        </>
      )}

      {(!_.isEmpty(finding.responseHeaders) || finding.responseBody) && (
        <>
          <Heading5>Response header and body:</Heading5>
          <HeadersList headers={finding.responseHeaders} />
          <BodyItem body={finding.responseBody} />
        </>
      )}
    </>
  );
}

function FindingEvidenceSection({ finding }: { finding: Finding }) {
  return (
    <>
      <Heading5>Evidence:</Heading5>
      <ExpandableDescription>{finding.evidence}</ExpandableDescription>
    </>
  );
}

function AdditionalInformationSection({ finding }: { finding: Finding }) {
  return (
    <>
      <Heading5>Additional Information:</Heading5>
      <FirstDetectedEvidenceLine isExtendedWidth firstDetectionTime={finding.firstDetectionTime} />
      <LastDetectedEvidenceLine isExtendedWidth latestDetectionTime={finding.latestDetectionTime} />
      {entries(finding.tags).map(([key, value]) => (
        <EvidenceLine isExtendedWidth label={key} key={key}>
          <HtmlMarkdown>{value}</HtmlMarkdown>
        </EvidenceLine>
      ))}
    </>
  );
}

export function RuntimeFindingCard({
  finding,
  provider,
  lastScanTime,
  ...props
}: {
  finding: Finding;
  provider: Provider;
  lastScanTime: Date;
} & ControlledCardProps) {
  const providerDisplayName = getProviderDisplayName(provider);

  const conditionalFindingNestedContent = useCallback(
    ({ visible }: { visible: boolean }) => {
      return visible ? <FindingNestedContent finding={finding} /> : null;
    },
    [finding]
  );

  return (
    <ControlledCard
      {...props}
      title="Runtime findings"
      nestedContent={conditionalFindingNestedContent}>
      <EvidenceLinesWrapper>
        <FlexedAndSpacedBetween>
          <LightWrapper>
            <ConditionalProviderIcon name={provider} />
            {providerDisplayName} <ScanLabel>scan:</ScanLabel>
            <DateTime date={lastScanTime} format={dateFormats.longDate} />
          </LightWrapper>
          {finding.url && <ExternalLink href={finding.url}> View Scan</ExternalLink>}
        </FlexedAndSpacedBetween>
        {Boolean(finding.vulnerabilityType) && (
          <LightWrapper>
            <ValidityIcon name="Valid" /> {finding.vulnerabilityType}
          </LightWrapper>
        )}
        <LightWrapper data-not-available={dataAttr(Boolean(!finding.remediation))}>
          <SvgIcon name={finding.remediation ? 'Accept' : 'Block'} />
          {finding.remediation ? 'Remediation available' : 'Remediation not available'}
        </LightWrapper>
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}

const FindingNestedContent = ({ finding }: { finding: Finding }) => {
  return (
    <>
      <NestedContentWrapper>
        <SeverityAndDescriptionSection finding={finding} />
        <TestedApiSection finding={finding} />

        {Boolean(
          finding.links?.length ||
            finding.cweIdentifiers?.length ||
            finding.complianceFrameworkReferences?.length
        ) && <IssueIdentifiersAndLinksSection finding={finding} />}

        {(!_.isEmpty(finding.responseHeaders) ||
          finding.responseBody ||
          !_.isEmpty(finding.requestHeaders) ||
          finding.requestBody) && <RequestAndResponseSection finding={finding} />}

        {finding.evidence && <FindingEvidenceSection finding={finding} />}

        {!_.isEmpty(finding.tags) && <AdditionalInformationSection finding={finding} />}
      </NestedContentWrapper>
      {Boolean(finding.remediation) && (
        <RemediationBanner
          title={
            <>
              <SvgIcon name="Accept" /> Remediation
            </>
          }
          description={<HtmlMarkdown>{finding.remediation}</HtmlMarkdown>}
        />
      )}
    </>
  );
};

const NestedContentWrapper = styled(EvidenceContainer)`
  display: flex;
  gap: 3rem;
  flex-direction: column;
  margin-top: 3rem;
`;

const ScanLabel = styled.span`
  font-weight: 300;
`;

const ValidityIcon = styled(SvgIcon)`
  color: var(--color-red-55);
`;

const LightWrapper = styled(Light)`
  display: flex;
  gap: 1rem;
  font-weight: 400;
  align-items: center;

  &[data-not-available] {
    color: var(--color-blue-gray-50);
  }
`;

const FlexedAndSpacedBetween = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const RemediationBanner = styled(Banner)`
  ${Heading} {
    display: flex;
    align-items: center;
    font-size: var(--font-size-s);
    font-weight: 500;
    gap: 1rem;

    ${Card} &:not(:last-child) {
      margin-bottom: 1.5rem;
    }

    ${BaseIcon} {
      width: 5rem;
      height: 5rem;
    }
  }
`;
