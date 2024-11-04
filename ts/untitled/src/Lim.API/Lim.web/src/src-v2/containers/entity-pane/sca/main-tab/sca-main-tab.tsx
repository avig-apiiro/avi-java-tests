import _ from 'lodash';
import { ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { TextButton } from '@src-v2/components/button-v2';
import { IconButton } from '@src-v2/components/buttons';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { Divider as BaseDivider } from '@src-v2/components/divider';
import { shouldShowExposureGraph } from '@src-v2/components/entity-pane/common/exposure-path';
import { ElementInsights } from '@src-v2/components/entity-pane/evidence/element-insights';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { SourceEvidenceLine } from '@src-v2/components/entity-pane/evidence/source-evidence-line';
import { ContributorsCard } from '@src-v2/components/entity-pane/remediation/contributors-card';
import { LanguageIcon, SvgIcon } from '@src-v2/components/icons';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading5 } from '@src-v2/components/typography';
import { ExposurePathCard } from '@src-v2/containers/entity-pane/exposure-path/exposure-path-card';
import { AboutPackageCard } from '@src-v2/containers/entity-pane/sca/main-tab/about-package-card';
import { DependencyInfoIntroducedThrough } from '@src-v2/containers/entity-pane/sca/main-tab/dependency-info';
import { VulnerabilitiesCards } from '@src-v2/containers/entity-pane/sca/main-tab/vulnerabilities-card';
import { ThirdPartyOrderModal } from '@src-v2/containers/entity-pane/sca/third-party-order-modal';
import { TopLevelUsedInCodeTree } from '@src-v2/containers/entity-pane/sca/top-level-used-in-code-tree';
import { useOpenCvePane } from '@src-v2/containers/entity-pane/sca/use-open-cve-pane';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { UsedInCodeIcon, mappedUsedInCode } from '@src-v2/containers/risks/sca/sca-table-content';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense, useToggle } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Provider } from '@src-v2/types/enums/provider';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { CodeReference, ExtendedCodeReference } from '@src-v2/types/risks/code-reference';
import { UsedInCode } from '@src-v2/types/risks/risk-types/oss-risk-trigger-summary';

export const ScaDeclaredIn = ({
  codeReference,
  relatedEntity,
  label,
}: {
  label: string;
  codeReference: CodeReference;
  relatedEntity: LeanConsumableProfile;
}) => {
  const trackAnalytics = useTrackAnalytics();

  const handleCodeReferencedClick = useCallback(
    event => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'View Code',
        [AnalyticsDataField.Context]: 'SCA main tab',
        [AnalyticsDataField.EntryPoint]: 'SCA declared in',
      });
      event.stopPropagation();
    },
    [trackAnalytics]
  );

  return (
    <>
      <ScaDeclaredInLabel>{label}</ScaDeclaredInLabel>
      <DependencyInfoCodeReference
        codeReference={codeReference}
        repository={relatedEntity}
        onClick={handleCodeReferencedClick}
      />
    </>
  );
};

export const ScaMainTab = ({
  dataModelReference,
  ...props
}: ControlledCardProps & { dataModelReference?: DiffableEntityDataModelReference }) => {
  const { application } = useInject();
  const { risk, element } = useScaPaneContext();
  const showExposureGraph = shouldShowExposureGraph(risk, application);
  const showCvePane = useOpenCvePane(dataModelReference ?? risk?.primaryDataModelReference);

  if (showCvePane) {
    return null;
  }

  return (
    <>
      <AboutScaCard {...props} />
      {showExposureGraph && <ExposurePathCard {...props} />}
      {Boolean(element.dependencyFindings?.length) && (
        <VulnerabilitiesCards {...props} findings={element.dependencyFindings} />
      )}
      {element.packageDigest && <AboutPackageCard {...props} />}
      {!risk && <ContributorsCard />}
    </>
  );
};

export const AboutScaCard = ({
  children,
  ...props
}: ControlledCardProps & {
  children?: ReactNode;
}) => {
  const { risk, element, relatedProfile } = useScaPaneContext();
  const { application, rbac, scaConfiguration } = useInject();
  const trackAnalytics = useTrackAnalytics();
  const [modalElement, setModal, closeModal] = useModalState();

  const availableServers = useSuspense(scaConfiguration.getAvailableServerProviders);

  const combinedInsights = _.unionBy(
    element?.packageDigest?.insights?.OssSecurity ?? [],
    element.insights ?? [],
    insight => insight.badge
  );

  const handleCodeReferencedClick = useCallback(() => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'View Code',
      [AnalyticsDataField.Context]: 'SCA main tab',
      [AnalyticsDataField.EntryPoint]: 'About SCA card',
    });
  }, [trackAnalytics]);

  const introducedThroughTitle = useMemo(() => {
    const isJarOrEarFile =
      element.codeReference.relativeFilePath.indexOf('.jar') > -1 ||
      element.codeReference.relativeFilePath.indexOf('.ear') > -1;

    const label = isJarOrEarFile
      ? 'This risk was introduced through an archive'
      : 'The risk was introduced via top-level dependencies declared in manifest files in';
    return (
      <>
        {!_.isEmpty(element.codeReference?.relativeFilePath) ? (
          <ScaDeclaredIn
            codeReference={element.codeReference}
            relatedEntity={relatedProfile}
            label={label}
          />
        ) : (
          <>Introduced through top level dependencies</>
        )}
      </>
    );
  }, [element.codeReference]);

  const isWizRisk = risk?.providers?.includes(Provider.Wiz);
  const wizProjectName = element.dependencyFindings.find(
    finding => finding.provider === 'Wiz'
  )?.scanProjectName;
  const containerName =
    wizProjectName ??
    element.dependencyFindings.find(finding => !_.isEmpty(finding.artifactNames))
      ?.artifactNames?.[0];

  const activeThirdPartyProvider = useMemo(() => {
    const firstMatchingServer = _.find(availableServers, server =>
      Boolean(
        element.dependencyPaths[server] && element.dependencyPaths[server].totalInfoPathsCount > 0
      )
    );
    return {
      key: getProviderDisplayName(firstMatchingServer),
      tree: element.dependencyPaths[firstMatchingServer],
    };
  }, [element.dependencyPaths, availableServers]);

  return (
    // @ts-ignore
    <ControlledCard {...props} title={`About this ${risk ? 'risk' : 'dependency'}`}>
      <EvidenceLinesWrapper>
        {risk && <RiskLevelWidget isExtendedWidth risk={risk} />}
        {risk && (
          <>
            <DiscoveredEvidenceLine isExtendedWidth risk={risk} />
            <DueDateEvidenceLine isExtendedWidth risk={risk} />
          </>
        )}
        {(element.resolvedVersion || element.version) && (
          <EvidenceLine isExtendedWidth label="Version">
            {element.resolvedVersion ?? element.version}
          </EvidenceLine>
        )}
        {!element.isSubDependency && (
          <>
            {!isWizRisk && (
              <EvidenceLine isExtendedWidth label="Type">
                Direct dependency
              </EvidenceLine>
            )}
            {element.codeReference && (
              <EvidenceLine isExtendedWidth label="Introduced through">
                <CodeReferenceLink
                  repository={relatedProfile}
                  codeReference={element.codeReference}
                  onClick={handleCodeReferencedClick}
                />
              </EvidenceLine>
            )}
            {containerName && (
              <EvidenceLine isExtendedWidth label="Container">
                {containerName}
              </EvidenceLine>
            )}
          </>
        )}
        {children}
        {Boolean(combinedInsights.length) && (
          <EvidenceLine isExtendedWidth label="Insights">
            <ElementInsights insights={combinedInsights} />
          </EvidenceLine>
        )}
        {Boolean(risk?.providers?.length) && (
          <SourceEvidenceLine isExtendedWidth providers={risk.providers} />
        )}
        {application.isFeatureEnabled(FeatureFlag.TopLevelUsedInCode) && element.isSubDependency ? (
          <EvidenceLine isExtendedWidth label="Used in code">
            {element.usedInCodeStatus === UsedInCode.Imported ? (
              <TopLevelUsedInCodeTree />
            ) : (
              <>
                {application.isFeatureEnabled(FeatureFlag.UsedInCode) && (
                  <Tooltip content={mappedUsedInCode()[element.usedInCodeStatus]?.tooltip}>
                    <UsedInCodeContent>
                      <UsedInCodeIcon
                        data-type={element.usedInCodeStatus}
                        name={mappedUsedInCode()[element.usedInCodeStatus].icon}
                      />
                      {element.usedInCodeStatus === UsedInCode.NotImported
                        ? 'Not imported'
                        : 'Unknown'}
                    </UsedInCodeContent>
                  </Tooltip>
                )}
              </>
            )}
          </EvidenceLine>
        ) : (
          <>
            {(application.isFeatureEnabled(FeatureFlag.UsedInCode) ||
              element.libraryUsagesSummary?.usagesCodeReferences?.length > 0) && (
              <EvidenceLine
                isExtendedWidth
                label={
                  <FlexedCentered>
                    <span>Used in code</span>
                    {element.libraryUsagesSummary?.usagesCodeReferences?.length > 0 &&
                      element.isSubDependency && (
                        <InfoTooltip content="The listed sub-dependencies were explicitly declared in the code, but not in the manifest files." />
                      )}
                  </FlexedCentered>
                }>
                <>
                  {element.libraryUsagesSummary?.usagesCodeReferences?.length > 0 ? (
                    <UsedInCodeDisplay
                      parsingTargetCodeReferences={
                        element.libraryUsagesSummary.usagesCodeReferences
                      }
                      repository={relatedProfile}
                    />
                  ) : (
                    <>
                      {application.isFeatureEnabled(FeatureFlag.UsedInCode) && (
                        <Tooltip content={mappedUsedInCode()[element.usedInCodeStatus]?.tooltip}>
                          <UsedInCodeContent>
                            <UsedInCodeIcon
                              data-type={element.usedInCodeStatus}
                              name={mappedUsedInCode()[element.usedInCodeStatus].icon}
                            />
                            {element.usedInCodeStatus === UsedInCode.NotImported
                              ? 'Not imported'
                              : 'Unknown'}
                          </UsedInCodeContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                </>
              </EvidenceLine>
            )}
          </>
        )}
        {element.isSubDependency && (
          <>
            {!isWizRisk && (
              <EvidenceLine isExtendedWidth label="Type">
                Sub-dependency
              </EvidenceLine>
            )}
            {containerName && (
              <>
                <EvidenceLine isExtendedWidth label="Container">
                  {containerName}
                </EvidenceLine>
              </>
            )}
            {(Boolean(element.dependencyInfoPathsSummary?.totalInfoPathsCount) ||
              Object.keys(element.dependencyPaths).length > 0) && (
              <div>
                {application.isFeatureEnabled(FeatureFlag.ScaProviderOrder) &&
                activeThirdPartyProvider.tree ? (
                  <>
                    <Divider />
                    <AdditionalInfoWrapper>
                      <Heading5>
                        Additional information from {activeThirdPartyProvider.key}
                      </Heading5>
                      {rbac.canEdit(resourceTypes.Global) &&
                        Object.keys(element.dependencyPaths).length > 1 && (
                          <TextButton
                            onClick={() =>
                              setModal(
                                <ThirdPartyOrderModal
                                  closeModal={closeModal}
                                  currentRiskVersion={`${element.displayName}:${element.version}`}
                                />
                              )
                            }
                            underline>
                            Change
                          </TextButton>
                        )}
                    </AdditionalInfoWrapper>
                    <IntroducedThrough label={introducedThroughTitle}>
                      <DependencyInfoIntroducedThrough
                        dependencyInfoPathsSummary={activeThirdPartyProvider.tree}
                      />
                    </IntroducedThrough>
                  </>
                ) : (
                  <>
                    {Boolean(element.dependencyInfoPathsSummary?.totalInfoPathsCount) && (
                      <IntroducedThrough label={introducedThroughTitle}>
                        <DependencyInfoIntroducedThrough
                          dependencyInfoPathsSummary={element.dependencyInfoPathsSummary}
                        />
                      </IntroducedThrough>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
        {element.description && (
          <EvidenceLine isExtendedWidth label="Description">
            {element.description}
          </EvidenceLine>
        )}
        {modalElement}
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
};

export function UsedInCodeDisplay({ parsingTargetCodeReferences, repository }) {
  const limitedDisplay = 2;
  const [showAll, toggleShowAll] = useToggle();

  return (
    <UsedInCodeLines>
      {parsingTargetCodeReferences
        .slice(0, showAll ? parsingTargetCodeReferences.length : limitedDisplay)
        .map(
          (codeReference: ExtendedCodeReference & { language?: string }, index: number) =>
            codeReference && (
              <UsedInCodeLine
                key={`${codeReference.language} - ${index}`}
                codeReference={codeReference}
                repository={repository}
              />
            )
        )}
      {parsingTargetCodeReferences.length - limitedDisplay > 0 && (
        <ShowMoreButton onClick={toggleShowAll}>
          {!showAll && (
            <UsedInCodeMore>
              Show {parsingTargetCodeReferences.length - limitedDisplay} more
            </UsedInCodeMore>
          )}
          {showAll && <UsedInCodeMore>Show less</UsedInCodeMore>}
        </ShowMoreButton>
      )}
    </UsedInCodeLines>
  );
}

function UsedInCodeLine({ codeReference, repository }) {
  const { toaster } = useInject();
  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeReference.detectedImport);
    toaster.success('Copied to clipboard!');
  };

  return (
    <FlexedCentered>
      {codeReference.detectedImport && (
        <CustomTooltip
          content={
            <FlexedCentered>
              <UsedInCodePreview>
                Preview:
                <CopyToClipboardTooltip content="Copy to clipboard" interactiveBorder={10}>
                  <CopyToClipboardButton name="Copy" size={Size.XSMALL} onClick={handleCopy} />
                </CopyToClipboardTooltip>
              </UsedInCodePreview>
              <ImportStatement>import {codeReference.detectedImport}</ImportStatement>
            </FlexedCentered>
          }
          interactive>
          <VisibleIcon name="Visible" />
        </CustomTooltip>
      )}
      <UsedInCodeLanguageIconAndUrl>
        {codeReference.language && (
          <LanguageIcon name={codeReference.language} size={Size.XSMALL} />
        )}
        <CodeReferenceLink repository={repository} codeReference={codeReference} />
      </UsedInCodeLanguageIconAndUrl>
    </FlexedCentered>
  );
}

const FlexedCentered = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UsedInCodePreview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-weight: 300;
`;

const Divider = styled(BaseDivider)`
  margin: 4rem 0;
`;

const AdditionalInfoWrapper = styled.div`
  display: flex;
  gap: 3rem;
  align-items: center;
  margin-bottom: 4rem;
`;

const IntroducedThrough = styled(EvidenceLine)`
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
`;

const DependencyInfoCodeReference = styled(CodeReferenceLink)`
  vertical-align: top;
  width: fit-content;
`;

const ScaDeclaredInLabel = styled.div`
  flex-shrink: 0;
  margin-right: 1rem;
`;

const UsedInCodeMore = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 400;
`;

const ShowMoreButton = styled(TextButton)`
  width: fit-content;
  text-decoration: underline;
`;

const VisibleIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-50);

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

const UsedInCodeLanguageIconAndUrl = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const UsedInCodeContent = styled(FlexedCentered)`
  gap: 1rem;
`;

const UsedInCodeLines = styled.div`
  width: 100%;
  gap: 2rem;
`;

const CustomTooltip = styled(Tooltip)`
  ${FlexedCentered};
  background-color: var(--color-blue-gray-70);

  ${Tooltip.Arrow}:before {
    background-color: var(--color-blue-gray-70);
  }

  ${FlexedCentered} {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }
`;

const ImportStatement = styled.span`
  display: flex;
  width: 100%;
  font-family: Courier;
  font-weight: 400;
  line-height: 4rem;
  word-break: break-all;
  padding-right: 8rem;
`;

const CopyToClipboardButton = styled(IconButton)`
  color: var(--color-blue-gray-30);

  &:hover {
    color: var(--color-blue-gray-20);
  }
`;

const CopyToClipboardTooltip = styled(Popover)`
  color: var(--color-white);
  font-size: var(--font-size-s);
  background-color: var(--color-blue-gray-70);

  ${Popover.Content} {
    min-width: 0;
  }
`;
