import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { WarningBanner } from '@src-v2/components/banner';
import { ClampPath, ClampText } from '@src-v2/components/clamp-text';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';

export const ArtifactRemediationSuggestionContent = () => {
  const { finding } = useArtifactPaneContext();
  const {
    finding: { remediationSuggestion, dependencyInfoPathsSummary, nearestFixedVersion },
  } = finding;

  const sameCurrentAndFixedVersion = remediationSuggestion?.filter(
    suggestion => suggestion.version === suggestion.fixVersion
  );

  const remediationSuggestionsWithFix = remediationSuggestion?.filter(
    suggestion => !_.isNil(suggestion.fixVersion)
  );

  const remediationSuggestionsWithFixLength = remediationSuggestionsWithFix?.length;

  const remediationSuggestionText = useMemo(() => {
    if (_.isEmpty(remediationSuggestionsWithFix) && nearestFixedVersion === null) {
      return null;
    }
    if (_.isEmpty(remediationSuggestionsWithFix) && nearestFixedVersion !== null) {
      return (
        <>
          Upgrade to {finding.finding.packageName}: {nearestFixedVersion} or higher
          <ClampPath>
            {finding.finding.referencedBy && ` (referenced by ${finding.finding.referencedBy})`}
          </ClampPath>
        </>
      );
    }
    if (remediationSuggestionsWithFixLength === 1) {
      const { name, relativeFilePath, fixVersion } = { ...remediationSuggestionsWithFix[0] };
      return (
        <>
          Upgrade to {name}: {fixVersion} or higher
          <ClampPath>{relativeFilePath && ` (referenced by ${relativeFilePath})`}</ClampPath>
        </>
      );
    }
    if (sameCurrentAndFixedVersion.length > 0) {
      return <>To fix, re-lock the sub-dependency version via the top level dependencies.</>;
    }
    const filePath = sameCurrentAndFixedVersion[0]?.relativeFilePath;
    return (
      <>
        Upgrade to the top level dependencies
        <ClampPath>{filePath && ` (referenced by ${filePath})`}</ClampPath>
      </>
    );
  }, [remediationSuggestion, sameCurrentAndFixedVersion]);

  return (
    <SuggestionContentWrapper>
      {_.isEmpty(remediationSuggestionsWithFix) && nearestFixedVersion === null ? (
        <WarningBanner title="No remediation path available" />
      ) : (
        <>
          {dependencyInfoPathsSummary?.totalInfoPathsCount !== remediationSuggestion?.length && (
            <WarningBanner
              title="Partial remediation"
              description="Remediation suggestion available only for some top level dependencies"
            />
          )}
          {remediationSuggestionText}
          {remediationSuggestionsWithFixLength > 1 &&
            remediationSuggestionsWithFix.map(suggestion => (
              <SuggestionContentRow key={suggestion.version}>
                <SuggestionVersion>
                  <ClampText>
                    {`${suggestion.name}: ${suggestion.version} 
                ${
                  suggestion.relativeFilePath
                    ? `(referenced by ${suggestion.relativeFilePath})`
                    : ''
                } 
                `}
                  </ClampText>
                </SuggestionVersion>
                <SuggestionFixVersion>
                  <SvgIcon name="Arrow" />
                  {suggestion.fixVersion}
                  {suggestion.version === suggestion.fixVersion ? ' (Re-lock)' : ''}
                </SuggestionFixVersion>
              </SuggestionContentRow>
            ))}
        </>
      )}
    </SuggestionContentWrapper>
  );
};

const SuggestionVersion = styled.div`
  max-width: 80%;
`;
const SuggestionFixVersion = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const SuggestionContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${WarningBanner} {
    margin: 0;
  }
`;

const SuggestionContentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: var(--font-size-s);

  ${BaseIcon} {
    color: var(--color-blue-gray-50);
  }
`;
