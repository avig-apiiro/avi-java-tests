import _ from 'lodash';
import styled from 'styled-components';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ExternalLink } from '@src-v2/components/typography';
import { useApiPaneContext } from '@src-v2/containers/entity-pane/api/use-api-pane-context';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { useInject, useSuspense } from '@src-v2/hooks';
import { humanize } from '@src-v2/utils/string-utils';

export function ApiSecurityHintLine({
  violationType,
  isExtendedWidth = false,
}: {
  violationType: 'Authorization' | 'InputValidation';
  isExtendedWidth?: boolean;
}) {
  const { repositoryProfiles } = useInject();
  const { element, relatedProfile } = useApiPaneContext();

  const apiHint = useSuspense(repositoryProfiles.getApiSecurityHints, {
    profileKey: relatedProfile.key,
    entityId: element.entityId,
    violationType,
  });

  return (
    <EvidenceLine isExtendedWidth={isExtendedWidth} label={humanize(violationType)}>
      <ApiSecurityHintLineWrapper>
        Missing {_.lowerCase(violationType)}.{' '}
        {Boolean(apiHint) && (
          <>
            Other APIs in this repository implemented {_.lowerCase(violationType)},{' '}
            <ExternalLink href={generateCodeReferenceUrl(relatedProfile, apiHint.codeReference)}>
              see code example
            </ExternalLink>
          </>
        )}
      </ApiSecurityHintLineWrapper>
    </EvidenceLine>
  );
}

const ApiSecurityHintLineWrapper = styled.span``;
