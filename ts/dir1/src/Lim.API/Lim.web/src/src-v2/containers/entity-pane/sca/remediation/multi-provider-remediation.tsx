import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { WarningBanner } from '@src-v2/components/banner';
import { TextButton } from '@src-v2/components/button-v2';
import { CollapsibleCardsController } from '@src-v2/components/cards/collapsbile-cards-controller';
import { ControlledCard } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { FixScaCard } from '@src-v2/containers/entity-pane/sca/remediation/fix-sca-card';
import { ThirdPartyOrderModal } from '@src-v2/containers/entity-pane/sca/third-party-order-modal';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Provider } from '@src-v2/types/enums/provider';
import { DependencyRemediation } from '@src-v2/types/inventory-elements';
import { CodeReference } from '@src-v2/types/risks/code-reference';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { getProviderDisplayName } from '@src/src-v2/data/providers';

export const MultiProviderRemediation = () => {
  const { scaConfiguration, application } = useInject();
  const { element } = useScaPaneContext();
  const [modalElement, setModal, closeModal] = useModalState();
  const { dependencyRemediation = {} as Record<Provider, DependencyRemediation> } = element;
  const configuration = useSuspense(scaConfiguration.getConfiguration);

  const remediations = useMemo(() => {
    const config = configuration.providersPriority.length
      ? configuration.providersPriority
      : (Object.keys(dependencyRemediation).sort() as Provider[]);

    return config
      ?.filter(provider => provider in dependencyRemediation)
      .map(provider => ({
        remediation: dependencyRemediation[provider],
        provider,
      }));
  }, [configuration, dependencyRemediation]);

  const isExistAtLeastOneRemediation = _.some(remediations, 'remediation');

  if (!isExistAtLeastOneRemediation) {
    return <WarningBanner title="No remediation path available" />;
  }

  return (
    <>
      <CollapsibleCardsController>
        {props => (
          <>
            {remediations?.map(({ remediation, provider }, index: number) => {
              const showFixScaCard =
                (!application.isFeatureEnabled(FeatureFlag.ScaTopLevelRemediationProfile) &&
                  provider === Provider.ApiiroSca &&
                  element.suggestedVersion) ||
                (!application.isFeatureEnabled(FeatureFlag.TopLevelRemediationDisplay) &&
                  provider === Provider.ApiiroSca) ||
                (remediation &&
                  ((remediation.strategy === 'Pinning' && provider === Provider.ApiiroSca) ||
                    remediation.strategy === 'Direct'));

              if (showFixScaCard) {
                return (
                  <FixScaCard
                    {...props}
                    provider={provider}
                    setModal={setModal}
                    closeModal={closeModal}
                    defaultOpen={index === 0}
                  />
                );
              }

              const noRemediationAvailable =
                !remediation ||
                (remediation &&
                  (remediation.strategy === 'Pinning' || remediation.strategy === 'Direct') &&
                  element.isSubDependency &&
                  provider !== 'ApiiroSca');

              return (
                <ControlledCard
                  {...props}
                  defaultOpen={index === 0}
                  title={
                    <TitleWrapper>
                      <RemediationSuggestion>
                        Remediation suggestion by <VendorIcon name={provider} size={Size.SMALL} />
                        {getProviderDisplayName(provider)}
                      </RemediationSuggestion>
                      <ChangeThirdPartyButton
                        isFirstInList={index === 0}
                        closeModal={closeModal}
                        setModal={setModal}
                      />
                    </TitleWrapper>
                  }>
                  <Content>
                    {noRemediationAvailable ? (
                      <>No remediation path available</>
                    ) : (
                      <>
                        {element.dependencyPaths?.[provider]?.totalInfoPathsCount !==
                          element.dependencyRemediation?.[provider]?.remediationSegments
                            ?.length && (
                          <WarningBanner
                            title="Partial remediation"
                            description="Remediation suggestion available only for some top level dependencies"
                          />
                        )}
                        <SuggestionDescription>
                          <span>Upgrade the top level dependencies</span>{' '}
                          {remediation?.codeReference && (
                            <DeclaredIn codeReference={remediation?.codeReference} />
                          )}{' '}
                          <span>
                            to change {element.displayName}: {element.version} to the minimum
                            required version {element.displayName}: {remediation?.minimalFixVersion}
                            :
                          </span>
                        </SuggestionDescription>
                        <SuggestionContent
                          isTopLevel={remediation.strategy === 'TopLevel'}
                          dependencyRemediation={remediation}
                        />
                      </>
                    )}
                  </Content>
                </ControlledCard>
              );
            })}
          </>
        )}
      </CollapsibleCardsController>
      {modalElement}
    </>
  );
};

const SuggestionContent = ({
  dependencyRemediation,
  isTopLevel = false,
}: {
  dependencyRemediation: DependencyRemediation;
  isTopLevel?: boolean;
}) => {
  return (
    <SuggestionContentWrapper>
      {dependencyRemediation?.remediationSegments.map(remediationSegment => (
        <SuggestionContentRow>
          {remediationSegment.packageName}: {remediationSegment.packageVersion}
          {!dependencyRemediation.codeReference && remediationSegment.codeReference && (
            <DeclaredIn codeReference={remediationSegment.codeReference} />
          )}
          <SvgIcon name="Arrow" /> {remediationSegment.fixVersion}{' '}
          {isTopLevel && remediationSegment.packageVersion === remediationSegment.fixVersion && (
            <>(Re-lock)</>
          )}
        </SuggestionContentRow>
      ))}
    </SuggestionContentWrapper>
  );
};

export const ChangeThirdPartyButton = ({ isFirstInList, setModal, closeModal }) => {
  const { rbac, application } = useInject();
  const { element } = useScaPaneContext();

  return (
    <>
      {rbac.canEdit(resourceTypes.Global) &&
        application.isFeatureEnabled(FeatureFlag.ScaProviderOrder) &&
        isFirstInList &&
        Object.keys(element?.dependencyRemediation).length > 1 && (
          <TextButton
            onClick={e => {
              setModal(
                <ThirdPartyOrderModal
                  closeModal={closeModal}
                  currentRiskVersion={`${element.displayName}:${element.version}`}
                />
              );
              stopPropagation(e);
            }}
            underline>
            Change
          </TextButton>
        )}
    </>
  );
};

const SuggestionContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

const DeclaredIn = ({ codeReference }: { codeReference: CodeReference }) => {
  const { relatedProfile } = useScaPaneContext();

  return (
    <DeclaredInSpan>
      <DeclaredInSpan>(Declared in</DeclaredInSpan>{' '}
      <CodeReferenceLinkWrapper
        repository={relatedProfile}
        codeReference={codeReference}
        onClick={stopPropagation}
      />
      <DeclaredInSpan>)</DeclaredInSpan>
    </DeclaredInSpan>
  );
};

const SuggestionDescription = styled.div``;

const DeclaredInSpan = styled.span``;

const CodeReferenceLinkWrapper = styled(CodeReferenceLink)`
  width: fit-content;
  vertical-align: top;
`;

export const TitleWrapper = styled.div`
  display: flex;
  gap: 3rem;
`;

export const RemediationSuggestion = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${WarningBanner} {
    margin: 0;
  }
`;
