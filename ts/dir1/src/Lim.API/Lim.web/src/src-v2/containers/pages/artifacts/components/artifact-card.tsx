import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { LinkMode, TextButton } from '@src-v2/components/button-v2';
import { ProfileCard } from '@src-v2/components/cards/profile-card';
import { VendorCircle, VendorStack } from '@src-v2/components/circles';
import { Clamp, ClampText } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { InsightTag } from '@src-v2/components/tags';
import { Popover } from '@src-v2/components/tooltips/popover';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading1, Paragraph, SubHeading4 } from '@src-v2/components/typography';
import { ArtifactPopoverContent } from '@src-v2/containers/pages/artifacts/components/artifact-popover-content';
import { Artifact, ArtifactEvidencesInfo } from '@src-v2/types/artifacts/artifacts-types';
import { makeUrl } from '@src-v2/utils/history-utils';

export const ArtifactCard = observer(({ item: artifact }: { item: Artifact }) => {
  const { path: basePath } = useRouteMatch();
  return (
    <ArtifactCardWrapper to={makeUrl(`${basePath}/${artifact.key}/risks`, {})}>
      <Header>
        <TitleWrapper>
          <TopTitle>
            <ClampText>{artifact.packageId}</ClampText>
            {artifact.insights.map(insight => (
              <InsightTag key={insight.badge} sentiment={insight.sentiment} insight={insight} />
            ))}
          </TopTitle>
          <SubHeading4>
            <ClampText>{artifact.artifactTypeDisplayName}</ClampText>
          </SubHeading4>
          {artifact.artifactEvidencesInfo.length > 0 && (
            <ArtifactEvidencesInfoContainer>
              Artifact repository:{' '}
              <TrimmedCollectionDisplay<ArtifactEvidencesInfo>
                limit={1}
                item={({ value: artifactEvidencesInfo }) => (
                  <ArtifactRepositoryContainer>
                    <VendorIcon name={artifactEvidencesInfo.provider} size={Size.SMALL} />
                    <TextButton
                      href={artifactEvidencesInfo.artifactImageUrl}
                      mode={LinkMode.EXTERNAL}>
                      {artifactEvidencesInfo.artifactRepository}
                    </TextButton>
                  </ArtifactRepositoryContainer>
                )}>
                {artifact.artifactEvidencesInfo}
              </TrimmedCollectionDisplay>
            </ArtifactEvidencesInfoContainer>
          )}
        </TitleWrapper>
      </Header>
      <Widgets>
        <ArtifactSourceWidget artifact={artifact} />
        <ArtifactCountWidget count={artifact.versionsCount} title="Versions" />
        <ArtifactCountWidget
          count={artifact.matchedCodeEntitiesCount}
          title="Matched code entities"
        />
        <ArtifactRiskWidget artifact={artifact} />
        {artifact.artifactRegistriesProvider !== 'Unresolved' && (
          <ArtifactRegistryWidget artifact={artifact} />
        )}
      </Widgets>
    </ArtifactCardWrapper>
  );
});

const ArtifactEvidencesInfoContainer = styled(Paragraph)`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const ArtifactRepositoryContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TopTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Clamp} {
    width: fit-content;
  }
`;

export const ArtifactCardWrapper = styled(ProfileCard)`
  gap: 8rem;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
`;

export const Widgets = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8rem;
`;

export const TitleWrapper = styled(Heading1)`
  max-width: 100%;
`;

export const ArtifactSourceWidget = ({ artifact }: { artifact: Artifact }) => {
  const { sourcesProviders } = artifact;

  const vendors = sourcesProviders.map(sourcesProvider => ({
    key: sourcesProvider,
    displayName: sourcesProvider,
  }));

  return (
    <ArtifactWidget>
      <VendorStack vendors={vendors} size={Size.LARGE} />
      <ArtifactWidgetLabel>Source</ArtifactWidgetLabel>
    </ArtifactWidget>
  );
};

export const ArtifactCountWidget = ({ count, title }: { count: number; title: string }) => (
  <ArtifactWidget>
    <CounterLabel>{count}</CounterLabel>
    <ArtifactWidgetLabel>{title}</ArtifactWidgetLabel>
  </ArtifactWidget>
);

export const ArtifactRiskWidget = ({ artifact }: { artifact: Artifact }) => {
  const { risk, key } = artifact;
  return (
    <ArtifactWidget>
      <Popover
        disabled={risk?.combinedRiskLevel === 'None' || !risk?.riskFactors?.length}
        content={<ArtifactPopoverContent risk={risk} artifactKey={key} />}
        noArrow>
        <ArtifactRiskIconContainer>
          <RiskIcon riskLevel={risk?.combinedRiskLevel} size={Size.XLARGE} />
          <ArtifactWidgetLabel>Risk</ArtifactWidgetLabel>
        </ArtifactRiskIconContainer>
      </Popover>
    </ArtifactWidget>
  );
};

export const ArtifactRegistryWidget = ({ artifact }: { artifact: Artifact }) => {
  const { artifactRegistriesProvider } = artifact;

  return (
    <ArtifactWidget>
      <VendorCircle name={artifactRegistriesProvider} size={Size.LARGE} />
      <ArtifactWidgetLabel>Artifact registry</ArtifactWidgetLabel>
    </ArtifactWidget>
  );
};

const CounterLabel = styled.span`
  font-size: var(--font-size-xxxl);
  line-height: 9rem;
`;
export const ArtifactWidget = styled.div`
  min-width: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
`;

export const ArtifactWidgetLabel = styled.div`
  color: var(--default-text-color);
  font-size: var(--font-size-xs);
  font-weight: 300;
  white-space: nowrap;
`;

export const ArtifactRiskIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;
