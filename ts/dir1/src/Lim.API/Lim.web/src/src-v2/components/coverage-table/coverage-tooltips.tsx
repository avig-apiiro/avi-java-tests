import { observer } from 'mobx-react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Counter } from '@src-v2/components/counter';
import { MatchedIcon } from '@src-v2/components/coverage-table/coverage-cells';
import { SvgIcon } from '@src-v2/components/icons';
import { DateTime } from '@src-v2/components/time';
import { Popover } from '@src-v2/components/tooltips/popover';
import { ExternalLink, Light, Link, Paragraph, Strong } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import {
  ProjectType,
  apiiroProviderApiSecurity,
  apiiroProviderNames,
  apiiroProviderSca,
  apiiroProviderSecretsDetection,
  embeddedSemgrepProvider,
} from '@src-v2/services';
import {
  BusinessImpactFactorType,
  LeanApplicationWithPointsOfContact,
} from '@src-v2/types/profiles/lean-application';
import { LeanCodeProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { ProviderType } from '@src-v2/types/providers/provider-type';
import { makeUrl } from '@src-v2/utils/history-utils';

type TagType = {
  name?: string;
  source?: string;
  value?: string;
  fieldKey?: string;
  fieldValue?: string;
  tagSource?: string;
};

type RepositoryProfileType = LeanCodeProfile & {
  businessImpactFactors: BusinessImpactFactorType[];
  validationCodeParsingTargets: any[];
  tags: TagType[];
};

type ItemType = {
  key: string;
  name: string;
  providerGroup: string;
  ignoredBy?: string;
  applications: LeanApplicationWithPointsOfContact[];
  providers: Record<string, ProviderType>;
  repositoryProfile: RepositoryProfileType;
  languages: string[];
  isArchived: boolean;
  isActive: boolean;
  monitorStatus: string;
  ignoreReason: string;
  lastMonitoringChangeTimestamp: null;
  lastCommit: string;
  repositoryTags: TagType[];
  applicationTags: TagType[];
};

type VendorTooltipPropsType = {
  item: ItemType;
  project: ProjectType;
  providerGroup?: string;
  extraProjectsCount?: number;
};

export const VendorTooltipContent = observer(
  ({ item, project, providerGroup, extraProjectsCount }: VendorTooltipPropsType) => {
    if (apiiroProviderNames.includes(providerGroup)) {
      return (
        <VendorTooltipForApiiroProvider
          item={item}
          providerGroup={providerGroup}
          project={project}
        />
      );
    }
    if (providerGroup === embeddedSemgrepProvider) {
      return <VendorTooltipForEmbeddedSemgrep item={item} project={project} />;
    }
    return (
      <VendorTooltipForExternalTool
        item={item}
        providerGroup={providerGroup}
        extraProjectsCount={extraProjectsCount}
        project={project}
      />
    );
  }
);

const VendorTooltipForExternalTool = ({
  item,
  providerGroup,
  extraProjectsCount,
  project = {} as ProjectType,
}: VendorTooltipPropsType) => {
  const { toaster } = useInject();
  const unknownLastScan = useMemo(
    () => new Date().getFullYear() - new Date(project.lastScan).getFullYear() > 20,
    [project]
  );

  return (
    <Container>
      <TitleIconsContainer>
        <Title>
          Project name: <Description>{project.projectName ?? 'Unknown'}</Description>
          {Boolean(extraProjectsCount) && <Counter>+{extraProjectsCount}</Counter>}
        </Title>
        <IconsContainer>
          {project.projectName && (
            <CoverageTooltipIcon content="Copy project link" interactiveBorder={10}>
              <CustomIcon
                name="Copy"
                onClick={() => {
                  navigator.clipboard.writeText(project.projectName);
                  toaster.success('Project link copied to clipboard');
                }}
              />
            </CoverageTooltipIcon>
          )}
          {project.url && project.projectName && (
            <ExternalLink href={project.url}>
              <CoverageTooltipIcon content="Go to project" interactiveBorder={10}>
                <CustomIcon name="External" />
              </CoverageTooltipIcon>
            </ExternalLink>
          )}
          <Link to={`/profiles/repositories/${item.key}/connections/${providerGroup}`}>
            <CoverageTooltipIcon content="Go to connections settings" interactiveBorder={10}>
              <CustomIcon name="Settings" />
            </CoverageTooltipIcon>
          </Link>
        </IconsContainer>
      </TitleIconsContainer>
      <Title>
        Last scan:{' '}
        <Description>
          {project.lastScan && !unknownLastScan ? (
            <>
              <DateTime date={project.lastScan} format="MMM dd yyyy, pa" />
            </>
          ) : (
            'Unknown'
          )}
        </Description>
      </Title>
      <Title>
        Coverage status:{' '}
        <Description>
          {project.status === 'MatchedByManualMatch' ? 'Matched manually' : 'Matched automatically'}
        </Description>
      </Title>
    </Container>
  );
};

const VendorTooltipForApiiroProvider = ({
  item,
  providerGroup,
  project = {} as ProjectType,
}: VendorTooltipPropsType) => {
  const linkTo = useMemo(() => {
    return providerGroup === apiiroProviderSca
      ? makeUrl('/risks/oss', {
          fl: { RepositoryKeys: { values: [item.key] }, Provider: { values: ['ApiiroSca'] } },
        })
      : providerGroup === apiiroProviderSecretsDetection
        ? makeUrl('/risks/secrets', {
            fl: { RepositoryKeys: { values: [item.key] } },
          })
        : providerGroup === apiiroProviderApiSecurity
          ? makeUrl('/risks/api', {
              fl: { RepositoryKeys: { values: [item.key] } },
            })
          : null;
  }, [item, providerGroup]);

  return (
    <Container>
      <TitleIconsContainer>
        <Title>
          Latest analyzed commit: <DateTime date={project.lastScan} format="MMM dd yyyy, pa" />
        </Title>
        <IconsContainer>
          {linkTo && (
            <Link to={linkTo}>
              <CoverageTooltipIcon content="View risks" interactiveBorder={10}>
                <CustomIcon name="RiskArea" />
              </CoverageTooltipIcon>
            </Link>
          )}
        </IconsContainer>
      </TitleIconsContainer>
      {project.scannedEntities && project.scannedEntities.length > 0 && (
        <Title>
          Scanned successfully: <Description>{project.scannedEntities.join(', ')}</Description>
        </Title>
      )}
      {project.notScannedEntities && project.notScannedEntities.length > 0 && (
        <Title>
          Not scanned: <Description>{project.notScannedEntities.join(', ')}</Description>
        </Title>
      )}
      {Boolean(project.notSupportedEntities?.length) && (
        <Title>
          Not supported: <Description>{project.notSupportedEntities.join(', ')}</Description>
        </Title>
      )}
    </Container>
  );
};

const VendorTooltipForEmbeddedSemgrep = ({
  item,
  providerGroup,
  project = {} as ProjectType,
}: VendorTooltipPropsType) => {
  const linkTo = useMemo(() => {
    return makeUrl('/risks', {
      fl: { RepositoryKeys: { values: [item.key] }, Provider: { values: ['ManagedSemgrep'] } },
    });
  }, [item, providerGroup]);

  return (
    <Container>
      <TitleIconsContainer>
        <Title>
          Latest analyzed commit: <DateTime date={project.lastScan} format="MMM dd yyyy, pa" />
        </Title>
        <IconsContainer>
          {linkTo && (
            <Link to={linkTo}>
              <CoverageTooltipIcon content="View risks" interactiveBorder={10}>
                <CustomIcon name="RiskArea" />
              </CoverageTooltipIcon>
            </Link>
          )}
        </IconsContainer>
      </TitleIconsContainer>
    </Container>
  );
};

export const NoVendorTooltipContent = ({
  item,
  project,
  providerGroup,
}: VendorTooltipPropsType) => {
  if (item.monitorStatus === 'NotMonitored') {
    return (
      <Container>
        <UnmonitoredRepositoryTooltip
          serverUrl={item.repositoryProfile.serverUrl}
          repositoryName={item.repositoryProfile.name}
        />
      </Container>
    );
  }

  if (item.monitorStatus === 'Ignored') {
    return (
      <Container>
        <IgnoredRepositoryTooltip
          serverUrl={item.repositoryProfile.serverUrl}
          repositoryName={item.repositoryProfile.name}
          ignoredBy={item.ignoredBy}
          ignoreReason={item.ignoreReason}
          lastMonitoringChangeTimestamp={item.lastMonitoringChangeTimestamp}
        />
      </Container>
    );
  }

  if (project && apiiroProviderNames.includes(providerGroup)) {
    if (project.tooltipFailureOverrideText) {
      return (
        <Container>
          <Title>{project.tooltipFailureOverrideText}</Title>
        </Container>
      );
    }

    if (!item.lastCommit) {
      return (
        <Container>
          <Title>No commits found in the repository. Nothing to scan</Title>
        </Container>
      );
    }

    return (
      <Container>
        {project.lastScan ? (
          <Title>
            Latest analyzed commit: <DateTime date={project.lastScan} format="MMM dd yyyy, pa" />
          </Title>
        ) : (
          <Title>This repository is not scanned</Title>
        )}
        {Boolean(project.notScannedEntities?.length) && (
          <Title>
            Not scanned: <Description>{project.notScannedEntities.join(', ')}</Description>
          </Title>
        )}
        {Boolean(project.notSupportedEntities?.length) && (
          <Title>
            Not supported: <Description>{project.notSupportedEntities.join(', ')}</Description>
          </Title>
        )}
      </Container>
    );
  }
  if (project && providerGroup === embeddedSemgrepProvider) {
    return (
      <Container>
        <Title>Commit scanning is not available for this repository</Title>
      </Container>
    );
  }
  return (
    <TitleIconsContainer>
      <Title>
        Coverage status: <Description>Unmatched</Description>
      </Title>
      <Link to={`/profiles/repositories/${item.key}/connections/${providerGroup}`}>
        <CoverageTooltipIcon content="Go to connections settings" interactiveBorder={10}>
          <CustomIcon name="Settings" />
        </CoverageTooltipIcon>
      </Link>
    </TitleIconsContainer>
  );
};

export const ExplainIconsPopover = styled(props => {
  return (
    <Popover
      {...props}
      content={
        <ContentContainer>
          <PopoverLine>
            <MatchedIcon name="Success" />
            Scanned in the last 90 days
          </PopoverLine>
          <PopoverLine>
            <MatchedIcon name="Success" data-scan-type="old" />
            Scanned more than 90 days ago
          </PopoverLine>
          <PopoverLine>
            <MatchedIcon name="CloseRoundedOutline" data-scan-type="unmatched" />
            Not matched / scanned
          </PopoverLine>
        </ContentContainer>
      }>
      <InfoIcon name="Info" />
    </Popover>
  );
})`
  ${Popover.Content} {
    min-width: 75rem;
    max-width: 75rem;
  }
`;

export const IgnoredRepositoryTooltip = ({
  serverUrl,
  repositoryName,
  ignoredBy,
  ignoreReason,
  lastMonitoringChangeTimestamp,
}: {
  serverUrl: string;
  repositoryName: string;
  ignoredBy?: string;
  ignoreReason?: string;
  lastMonitoringChangeTimestamp?: string;
}) => (
  <>
    <Paragraph>
      Ignored
      {ignoredBy && (
        <>
          {' '}
          by <Strong>{ignoredBy}</Strong>{' '}
        </>
      )}
      {lastMonitoringChangeTimestamp && (
        <>
          {' '}
          {/*@ts-ignore*/}
          on <DateTime date={lastMonitoringChangeTimestamp} format="MMM dd yyyy, pa" />
        </>
      )}
    </Paragraph>
    {ignoreReason && (
      <Paragraph>
        <Light>Reason:</Light> <Strong>{ignoreReason}</Strong>
      </Paragraph>
    )}
    <RepositoryConnectorsPageLink serverUrl={serverUrl} repositoryName={repositoryName} />
  </>
);

export const UnmonitoredRepositoryTooltip = ({
  serverUrl,
  repositoryName,
}: {
  serverUrl: string;
  repositoryName: string;
}) => (
  <>
    <Paragraph>Unmonitored repository</Paragraph>
    <RepositoryConnectorsPageLink serverUrl={serverUrl} repositoryName={repositoryName} />
  </>
);

const RepositoryConnectorsPageLink = ({
  serverUrl,
  repositoryName,
}: {
  serverUrl: string;
  repositoryName: string;
}) => (
  <RepositoryLink
    to={makeUrl(`/connectors/manage/server/${encodeURIComponent(serverUrl)}/repositories`, {
      fl: { searchTerm: repositoryName },
    })}>
    Go to the Connectors page to monitor this repository
  </RepositoryLink>
);

const RepositoryLink = styled(Link)`
  text-decoration: underline;
`;

const InfoIcon = styled(SvgIcon)`
  width: 8rem;
  height: 8rem;
  color: var(--color-blue-gray-50);

  &:hover {
    color: var(--color-blue-gray-60);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-s);
`;

const Title = styled.span`
  display: flex;
  align-items: center;
  font-weight: 300;
  gap: 1rem;
`;

const Description = styled.span`
  font-weight: 500;
`;

const TitleIconsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ExternalIcon = styled(SvgIcon)`
  &:hover {
    color: var(--color-blue-gray-30);
  }

  &:active {
    color: var(--color-blue-gray-40);
  }
`;

const CustomIcon = styled(ExternalIcon)`
  padding: 0.5rem;
  color: var(--color-blue-gray-30);

  &:hover {
    color: var(--color-blue-gray-10);
  }
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-s);
  font-weight: 300;
  gap: 2rem;
`;

const PopoverLine = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const CoverageTooltipIcon = styled(Popover)`
  color: var(--color-white);
  background-color: var(--color-blue-gray-70);
  margin-bottom: 4rem;
  font-weight: 300;
  font-size: var(--font-size-s);

  ${Popover.Content} {
    min-width: 0;
  }

  ${Popover.Arrow}:before {
    background-color: var(--color-blue-gray-70);
  }
}
`;
