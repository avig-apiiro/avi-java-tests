import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { InfoBanner } from '@src-v2/components/banner';
import { IconButton } from '@src-v2/components/buttons';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { RemediationSteps } from '@src-v2/components/entity-pane/remediation/remediation-steps';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Code } from '@src-v2/components/typography';
import {
  ChangeThirdPartyButton,
  RemediationSuggestion,
  TitleWrapper,
} from '@src-v2/containers/entity-pane/sca/remediation/multi-provider-remediation';
import { RemediationBanner } from '@src-v2/containers/entity-pane/sca/remediation/suggested-version-banner';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { useInject } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';
import { ControlledCard, ControlledCardProps } from '@src/src-v2/components/cards/controlled-card';

export function FixScaCard({
  setModal,
  closeModal,
  provider = Provider.ApiiroSca,
  defaultOpen = true,
  ...props
}: ControlledCardProps & {
  setModal?: Dispatch<SetStateAction<JSX.Element>>;
  closeModal?: () => void;
  provider?: Provider;
}) {
  const { risk, element } = useScaPaneContext();
  const { toaster } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const { dependencyRemediation = {} } = element;

  const currentRemediation = useMemo(
    () => ({
      codeReference: dependencyRemediation[provider]?.codeReference,
      fixVersion: dependencyRemediation[provider]?.minimalFixVersion,
      currentVersion: dependencyRemediation[provider]?.remediationSegments[0]?.packageVersion,
    }),
    [provider]
  );

  const copySuggestVersionName = useCallback(async () => {
    await navigator.clipboard.writeText(element.suggestedVersion.version);
    toaster.success('Version number copied to clipboard!');
  }, [element]);

  const handleCodeReferencedClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'Fix SCA card',
    });
  }, [trackAnalytics]);

  return (
    <FixScaContainer
      {...props}
      title={
        <TitleWrapper>
          <RemediationSuggestion>
            Remediation suggestion by <VendorIcon name={provider} size={Size.SMALL} />
            {getProviderDisplayName(provider)}
          </RemediationSuggestion>
          <ChangeThirdPartyButton
            setModal={setModal}
            closeModal={closeModal}
            isFirstInList={defaultOpen}
          />
        </TitleWrapper>
      }
      defaultOpen={defaultOpen}>
      {element.isSubDependency ? (
        <FixScaCardDependency>
          {provider === 'ApiiroSca' && (
            <InfoBanner description="No available suggestion for a recommended top level version" />
          )}
          {Boolean(element.topLevelDependencies?.length) && (
            <>
              <span>
                Upgrade the top level dependencies to change {element.displayName}:{' '}
                {element.version} to the minimum required version {element.displayName}:{' '}
                {currentRemediation?.fixVersion ?? element.suggestedVersion?.version}:
              </span>
              <UlDependencies>
                {element.topLevelDependencies.map(topLevelDependency => (
                  <li key={topLevelDependency.id}>
                    <DependencyWrapper>
                      {topLevelDependency.name}{' '}
                      {(currentRemediation?.codeReference || topLevelDependency.codeReference) && (
                        <>
                          (Declared in&nbsp;
                          <CodeReferenceLink
                            codeReference={
                              currentRemediation?.codeReference ?? topLevelDependency.codeReference
                            }
                            repository={risk.relatedEntity}
                            onClick={handleCodeReferencedClick}
                          />
                          )
                        </>
                      )}
                    </DependencyWrapper>
                  </li>
                ))}
              </UlDependencies>
            </>
          )}
        </FixScaCardDependency>
      ) : (
        <>
          <RemediationSteps>
            <DirectDependencyStepContainer>
              <span>Go to</span>
              <CodeReferenceLink
                codeReference={currentRemediation?.codeReference ?? element.codeReference}
                repository={risk.relatedEntity}
                onClick={handleCodeReferencedClick}
              />
            </DirectDependencyStepContainer>
            <StepContainer>
              Replace vulnerable version{' '}
              <Code>
                {currentRemediation?.currentVersion
                  ? currentRemediation.currentVersion
                  : element.resolvedVersion ?? element.version}
                {element.resolvedVersion && (
                  <InfoTooltip
                    content={`Estimated version by ${getProviderDisplayName(provider)} analysis`}
                    size={Size.XXXSMALL}
                  />
                )}
              </Code>{' '}
              with fix version{' '}
              <Code>{currentRemediation?.fixVersion ?? element.suggestedVersion?.version}</Code>
              <IconButton name="Copy" onClick={copySuggestVersionName} />
            </StepContainer>
          </RemediationSteps>
          {provider === 'ApiiroSca' && element.suggestedVersion && (
            <RemediationBanner data={element} />
          )}
        </>
      )}
    </FixScaContainer>
  );
}

const FixScaContainer = styled(ControlledCard)`
  ${CodeReferenceLink} {
    width: fit-content;
  }
`;

const StepContainer = styled.div`
  ${Code} ${BaseIcon} {
    margin-left: 0.75rem;
  }
`;

const DirectDependencyStepContainer = styled(StepContainer)`
  display: flex;
  gap: 1rem;

  ${CodeReferenceLink} {
    width: fit-content;
  }
`;

const FixScaCardDependency = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${InfoBanner} {
    margin: 0;
  }
`;

const UlDependencies = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  list-style-type: disc;
  padding-left: 4rem;
`;

const DependencyWrapper = styled.span`
  display: flex;
`;
