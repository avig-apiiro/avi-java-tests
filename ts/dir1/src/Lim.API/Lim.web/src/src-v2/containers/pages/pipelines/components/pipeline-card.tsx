import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ProfileCard } from '@src-v2/components/cards/profile-card';
import { VendorCircle } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { VendorIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { BusinessImpactPopover } from '@src-v2/components/risk/risk-popovers';
import { useRiskProfile } from '@src-v2/components/risk/risk-utils';
import { Popover } from '@src-v2/components/tooltips/popover';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading1, Light, Link } from '@src-v2/components/typography';
import { PipelinePopoverContent } from '@src-v2/containers/pages/pipelines/components/pipeline-popover-content';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Pipeline } from '@src-v2/types/pipelines/pipelines-types';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { makeUrl } from '@src-v2/utils/history-utils';
import { humanize } from '@src-v2/utils/string-utils';

export const PipelineCard = observer(({ item: pipeline }: { item: Pipeline }) => {
  const riskProfile = useRiskProfile(pipeline.declaringRepositoryBusinessImpact);
  const isJenkins = pipeline.cicdTechnology === 'Jenkins';
  const { path: basePath } = useRouteMatch();
  const { application } = useInject();

  return (
    <PipelineCardWrapper
      to={
        !isJenkins
          ? makeUrl(`${basePath}/${pipeline.key}/risks`, {
              fl: {
                RiskLevel: { values: ['Critical', 'High', 'Medium', 'Low'] },
                RiskCategory: { values: ['PipelineMisconfigurations', 'PipelineDependencies'] },
              },
            })
          : null
      }>
      <Header>
        <Description>
          <CardTitle>
            <TitleWrapper>
              <ClampText>{pipeline.id}</ClampText>
            </TitleWrapper>
          </CardTitle>
          <CardTitlePath>
            {pipeline.declaringRepositoryName && (
              <CardTitlePathLine>
                <Light>Parent repository:</Light>
                <VendorIcon name={pipeline.declaringRepositoryProviderGroup} />
                <Link
                  onClick={stopPropagation}
                  to={`/profiles/repositories/${pipeline.declaringRepositoryKey}`}>
                  {pipeline.declaringRepositoryName}{' '}
                  {pipeline.declaringRepositoryBranchName && (
                    <>({pipeline.declaringRepositoryBranchName})</>
                  )}
                </Link>
                {pipeline.declaringRepositoryBusinessImpact && Boolean(riskProfile) && (
                  <BusinessImpactPopover
                    profile={{
                      ...riskProfile,
                      businessImpact: humanize(riskProfile.businessImpactLevel),
                    }}>
                    <BusinessImpactIndicator
                      businessImpact={pipeline.declaringRepositoryBusinessImpact.businessImpact}
                    />
                  </BusinessImpactPopover>
                )}
              </CardTitlePathLine>
            )}
            {pipeline.codeReference?.relativeFilePath && pipeline.repositoryUrl && (
              <CardTitlePathLine>
                <Light>File path:</Light>
                <CodeReferenceLinkWrapper
                  codeReference={pipeline.codeReference}
                  onClick={stopPropagation}
                  repository={{
                    url: pipeline.repositoryUrl,
                    vendor: pipeline.declaringRepositoryProviderGroup,
                    referenceName: pipeline.declaringRepositoryBranchName,
                  }}
                />
              </CardTitlePathLine>
            )}
            {Boolean(pipeline.pipelineUrls.length) && (
              <CardTitlePathLine>
                <Light>Pipeline URL:</Light>
                <CardTitlePathPipelineUrl pipelineUrls={pipeline.pipelineUrls} />
              </CardTitlePathLine>
            )}
          </CardTitlePath>
        </Description>
      </Header>
      <Widgets>
        <PipelineAvatarWidget statName="Technology" vendor={pipeline.cicdTechnology} />
        {!isJenkins && (
          <>
            <PipelineStatWidget
              statName="Checked-out repositories"
              statValue={pipeline.checkedOutRepositories.length}
            />
            <PipelineStatWidget statName="Applications" statValue={pipeline.applications.length} />
          </>
        )}
        {application.isFeatureEnabled(FeatureFlag.PipelinesRisksTable) && (
          <PipelineRiskWidget pipeline={pipeline} />
        )}
      </Widgets>
    </PipelineCardWrapper>
  );
});

const CodeReferenceLinkWrapper = styled(CodeReferenceLink)`
  width: fit-content;
`;

export const PipelineCardWrapper = styled(ProfileCard)`
  gap: 8rem;
`;

export const TitleWrapper = styled(Heading1)`
  max-width: 150rem;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  line-height: 1;
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Heading1} {
    margin-bottom: 0;
    margin-right: 2rem;
  }
`;

export const Widgets = styled.div`
  display: flex;
  gap: 8rem;
`;

export const PipelineAvatarWidget = ({
  statName,
  vendor,
}: {
  statName: string;
  vendor: string;
}) => (
  <Tooltip content={vendor}>
    <PipelineWidget>
      <VendorCircle name={vendor} size={Size.XLARGE} />
      <PipelineWidgetLabel>{statName}</PipelineWidgetLabel>
    </PipelineWidget>
  </Tooltip>
);

export const PipelineStatWidget = ({
  statName,
  statValue,
}: {
  statName: string;
  statValue: number;
}) => {
  return (
    <PipelineWidget>
      <CounterLabel>{statValue}</CounterLabel>
      <PipelineWidgetLabel>{statName}</PipelineWidgetLabel>
    </PipelineWidget>
  );
};

export const PipelineRiskWidget = ({ pipeline }: { pipeline: Pipeline }) => {
  const { risk } = pipeline;
  return (
    <PipelineWidget>
      <Popover
        disabled={risk?.combinedRiskLevel === 'None' || !risk?.riskFactors?.length}
        content={<PipelinePopoverContent risk={risk} pipelineKey={pipeline.key} />}
        noArrow>
        <RiskIconContainer>
          <RiskIcon riskLevel={risk?.combinedRiskLevel} size={Size.XLARGE} />
          <PipelineWidgetLabel>Risk</PipelineWidgetLabel>
        </RiskIconContainer>
      </Popover>
    </PipelineWidget>
  );
};

const CounterLabel = styled.span`
  font-size: 7rem;
  line-height: 9rem;
`;

export const PipelineWidgetLabel = styled.div`
  color: var(--default-text-color);
  font-size: var(--font-size-xs);
  font-weight: 300;
  white-space: nowrap;
`;

export const PipelineWidget = styled.div`
  min-width: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const RiskIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

export const BadgeWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
`;

const CardTitlePath = styled.div`
  display: flex;
  gap: 3rem;
  flex-direction: column;
  color: var(--color-blue-gray-70);
  font-size: var(--font-size-s);
  font-weight: 400;
`;

const CardTitlePathLine = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CardTitlePathPipelineUrl = styled(
  ({ pipelineUrls, ...props }: { pipelineUrls: string[] }) => {
    return (
      <div {...props} onClick={stopPropagation}>
        <TrimmedCollectionDisplay
          limit={1}
          item={({ value }) => (
            <TextButton href={value} mode={LinkMode.EXTERNAL}>
              {value}
            </TextButton>
          )}>
          {pipelineUrls}
        </TrimmedCollectionDisplay>
      </div>
    );
  }
)`
  display: flex;
  gap: 1rem;
`;
