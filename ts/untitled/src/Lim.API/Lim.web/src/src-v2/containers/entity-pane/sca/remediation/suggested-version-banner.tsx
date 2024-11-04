import { useMemo } from 'react';
import styled from 'styled-components';
import { Banner } from '@src-v2/components/banner';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import {
  ExternalLink,
  ListItem,
  Paragraph,
  Underline,
  UnorderedList,
} from '@src-v2/components/typography';
import { CveLink, CweLink } from '@src-v2/containers/entity-pane/sca/vulnerability-link';
import { DependencyElement, SuggestedVersion } from '@src-v2/types/inventory-elements';
import { StyledProps } from '@src-v2/types/styled';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function RemediationBanner({ data, ...props }: { data: DependencyElement }) {
  const { suggestedVersion, suggestedVulnerabilitiesCount, fixedVulnerabilities } = useMemo(() => {
    const { suggestedVersion } = data;
    const suggestedVulnerabilitiesCount = suggestedVersion.findings?.length ?? 0;
    const suggestedFindingsSummaries = suggestedVersion.findings?.map(finding => finding.summary);
    const fixedVulnerabilities = data.dependencyFindings.filter(
      finding => !suggestedFindingsSummaries.includes(finding.displayName)
    );

    return {
      suggestedVersion,
      suggestedVulnerabilitiesCount,
      fixedVulnerabilities,
    } as const;
  }, [data]);

  return (
    // @ts-ignore
    <Banner
      {...props}
      description={
        <SuggestionContainer>
          <Paragraph>
            Upgrading will fix{' '}
            {Boolean(fixedVulnerabilities.length === data.dependencyFindings.length) && 'all'}{' '}
            {fixedVulnerabilities.length} vulnerabilities.{' '}
          </Paragraph>
          <Paragraph>
            {suggestedVulnerabilitiesCount ? (
              <Tooltip content={<IdentifiersTooltipContent suggestedVersion={suggestedVersion} />}>
                <Underline>
                  {/*@ts-ignore*/}
                  <RiskIcon riskLevel={data.suggestedVersion.severity} />
                  There {pluralFormat(suggestedVulnerabilitiesCount, 'is', 'are')}{' '}
                  {pluralFormat(
                    suggestedVulnerabilitiesCount,
                    'known vulnerability',
                    'known vulnerabilities',
                    true
                  )}
                </Underline>
              </Tooltip>
            ) : (
              <>
                <SvgIcon name="Accept" /> No known vulnerabilities for recommended version.
              </>
            )}
          </Paragraph>
        </SuggestionContainer>
      }
    />
  );
}

const SuggestionContainer = styled.div`
  ${Paragraph} {
    display: flex;
    align-items: center;
    gap: 1rem;

    &:not(:last-child) {
      margin-bottom: 2rem;
    }
  }
`;

const IdentifiersTooltipContent = styled(
  ({ suggestedVersion, ...props }: StyledProps<{ suggestedVersion: SuggestedVersion }>) => (
    <UnorderedList {...props}>
      {suggestedVersion.findings.map((finding, index) => (
        <ListItem key={index}>
          {finding.summary} {finding.cveIdentifiers?.map(cve => <CveLink key={cve} cve={cve} />)}
          {finding.cweIdentifiers?.map(cwe => <CweLink key={cwe} cwe={cwe} />)}
        </ListItem>
      ))}
    </UnorderedList>
  )
)`
  ${ExternalLink} {
    color: var(--color-white);
  }
`;
