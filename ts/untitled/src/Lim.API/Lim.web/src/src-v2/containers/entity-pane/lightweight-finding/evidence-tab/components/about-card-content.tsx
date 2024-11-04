import _ from 'lodash';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { Divider } from '@src-v2/components/divider';
import { ComplianceFrameworkReferences } from '@src-v2/components/entity-pane/evidence/evidence-compliance-framework-references';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { RiskTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { ExternalLink, Heading5 } from '@src-v2/components/typography';
import { ExpandableDescription } from '@src-v2/containers/entity-pane/sast/expandable-description';
import { dateFormats } from '@src-v2/data/datetime';
import { useToggle } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';
import {
  AssociatedObject,
  EvidenceAndRole,
  HttpRequestEvidence,
  LightweightFindingResponse,
} from '@src-v2/types/inventory-elements/lightweight-finding-response';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';
import { pluralFormat } from '@src-v2/utils/number-utils';

export const AboutCardContent = ({
  finding,
  risk,
}: {
  finding: LightweightFindingResponse;
  risk: RiskTriggerSummaryResponse;
}) => {
  const { finding: findingObj, associatedObjects } = finding;

  const references = findingObj.globalIdentifiers?.map(globIdentifier => ({
    identifier: globIdentifier.identifier,
    description: globIdentifier.description,
    url: globIdentifier.link,
    securityComplianceFramework: globIdentifier.identifierType,
  }));
  const hasIdentifiers = findingObj.cvssInfo || Boolean(references.length);
  const isManualFinding = findingObj.sourceProviders.includes(Provider.ManualUpload);

  return (
    <EvidenceLinesWrapper>
      {risk && (
        <>
          <RiskLevelWidget isExtendedWidth risk={risk} />
          <EvidenceLine isExtendedWidth label="Discovered on">
            <DateTime date={risk.discoveredAt} format={dateFormats.longDate} />
          </EvidenceLine>
          <DueDateEvidenceLine isExtendedWidth risk={risk} />
          <Divider />
        </>
      )}
      <Heading5>Finding details</Heading5>
      <EvidenceLine isExtendedWidth label="Finding name">
        {findingObj.title}
      </EvidenceLine>
      {Boolean(findingObj.severity) && (
        <EvidenceLine isExtendedWidth label="Severity">
          <RiskTag riskLevel={_.camelCase(findingObj.severity.toString())}>
            {findingObj.severity}
          </RiskTag>
        </EvidenceLine>
      )}
      {Boolean(associatedObjects?.length) && (
        <EvidenceLine
          isExtendedWidth
          label={pluralFormat(associatedObjects.length, 'Affected asset')}>
          <AffectedAssets associatedObjects={associatedObjects} />
        </EvidenceLine>
      )}
      {Boolean(findingObj?.sourceProviders?.length) && (
        <SourceEvidenceLine isExtendedWidth providers={findingObj?.sourceProviders} />
      )}
      {Boolean(findingObj.description) && (
        <EvidenceLine isExtendedWidth label="Description">
          <ExpandableDescription maxPreviewChars={250}>
            {findingObj.description}
          </ExpandableDescription>
        </EvidenceLine>
      )}
      {isManualFinding && Boolean(findingObj.remediation) && (
        <EvidenceLine isExtendedWidth label="Remediation">
          <ExpandableDescription maxPreviewChars={250}>
            {findingObj.remediation.descriptionMarkdown}
          </ExpandableDescription>
        </EvidenceLine>
      )}
      {Boolean(findingObj.impactDescription) && (
        <EvidenceLine isExtendedWidth label="Impact">
          <ExpandableDescription maxPreviewChars={250}>
            {findingObj.impactDescription}
          </ExpandableDescription>
        </EvidenceLine>
      )}
      {findingObj.links?.length > 0 && (
        <EvidenceLine
          isExtendedWidth
          label={
            <FindingsReferencesLabel>
              Findings references
              {isManualFinding && (
                <InfoTooltip content="References added manually: not verified by Apiiro" />
              )}
            </FindingsReferencesLabel>
          }>
          <FindingsReferences>
            {findingObj.links.map(({ url }, index) => (
              <ExternalLink key={`${url}-${index}`} href={url}>
                {url}
              </ExternalLink>
            ))}
          </FindingsReferences>
        </EvidenceLine>
      )}

      {findingObj.evidence?.length > 0 && (
        <>
          <Heading5>Evidence</Heading5>
          {findingObj.evidence.map(item => (
            <FindingEvidenceComponent evidenceAndRole={item} />
          ))}
        </>
      )}

      {hasIdentifiers && (
        <>
          <Heading5>Issue identifiers and compliance</Heading5>
          {Boolean(findingObj.cvssInfo?.score) && (
            <EvidenceLine isExtendedWidth label={`CVSS ${findingObj.cvssInfo.version ?? ''} score`}>
              {findingObj.cvssInfo?.score}
            </EvidenceLine>
          )}
          {findingObj.cvssInfo?.vector && (
            <EvidenceLine isExtendedWidth label="CVSS vector">
              {findingObj.cvssInfo.vector}
            </EvidenceLine>
          )}
          {references?.length > 0 && <ComplianceFrameworkReferences references={references} />}
        </>
      )}
    </EvidenceLinesWrapper>
  );
};

const FindingsReferencesLabel = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FindingsReferences = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FindingEvidenceComponent = ({ evidenceAndRole }: { evidenceAndRole: EvidenceAndRole }) => {
  switch (evidenceAndRole.evidence._t) {
    case 'LightweightFindingEvidenceHttpRequest': {
      const requestEvidence = evidenceAndRole.evidence as HttpRequestEvidence;
      return (
        <>
          <EvidenceLine isExtendedWidth label="HTTP request">
            {requestEvidence.method} {requestEvidence.url}
          </EvidenceLine>
        </>
      );
    }
    case 'LightweightFindingEvidenceHttpResponse': {
      return (
        <>
          <EvidenceLine isExtendedWidth label="HTTP response">
            {evidenceAndRole.evidence.description}
          </EvidenceLine>
        </>
      );
    }
    default:
      return (
        <EvidenceLine isExtendedWidth label="Evidence description">
          {evidenceAndRole.evidence.description}
        </EvidenceLine>
      );
  }
};

export const AffectedAssets = ({
  associatedObjects,
}: {
  associatedObjects: AssociatedObject[];
}) => {
  const [showMore, toggleShowMore] = useToggle(false);
  const resolvedSubjectFindings = associatedObjects.filter(
    object => object.associatedObjectRole === 'Subject'
  );

  return (
    <AffectedAssetWrapper>
      {resolvedSubjectFindings
        .slice(0, !showMore ? 1 : resolvedSubjectFindings.length)
        .map(object => (
          <span key={object.name}>
            {object.name}
            {object.type && ` (${object.type})`}
          </span>
        ))}
      {resolvedSubjectFindings.length > 1 && (
        <TextButton onClick={toggleShowMore} size={Size.XSMALL}>
          {!showMore ? `Show ${resolvedSubjectFindings.length - 1} more` : 'Show less'}
        </TextButton>
      )}
    </AffectedAssetWrapper>
  );
};

const AffectedAssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
