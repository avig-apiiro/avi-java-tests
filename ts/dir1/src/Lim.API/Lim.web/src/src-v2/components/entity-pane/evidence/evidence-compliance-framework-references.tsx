import _ from 'lodash';
import styled from 'styled-components';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ExternalLink } from '@src-v2/components/typography';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';

export function ComplianceFrameworkReferences({
  references,
}: {
  references: ComplianceFrameworkReference[];
}) {
  if (_.isEmpty(references)) {
    return null;
  }

  const complianceReferencesByFramework = _.groupBy(
    references,
    ref => ref.securityComplianceFramework
  );
  const availableComplianceFrameworks = Object.keys(complianceReferencesByFramework);

  return (
    <EvidenceLinesWrapper>
      {availableComplianceFrameworks?.map((frameworkName, index) => (
        <EvidenceLine isExtendedWidth label={frameworkName.toUpperCase()} key={index}>
          <ComplianceDataWrapper>
            {complianceReferencesByFramework[frameworkName].map(reference => {
              const optionalPrefix =
                frameworkName.toUpperCase() === 'CWE' && !reference.identifier.startsWith('CWE')
                  ? 'CWE-'
                  : '';

              const identifier = (
                <>
                  {optionalPrefix}
                  {reference.identifier.toUpperCase()}
                </>
              );
              return (
                <div key={reference.identifier}>
                  {reference.url ? (
                    <ExternalLink href={reference.url}>{identifier}</ExternalLink>
                  ) : (
                    <div style={{ display: 'inline-block' }}>{identifier}</div>
                  )}{' '}
                  {reference.description && <>- {reference.description}</>}
                </div>
              );
            })}
          </ComplianceDataWrapper>
        </EvidenceLine>
      ))}
    </EvidenceLinesWrapper>
  );
}

const ComplianceDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
