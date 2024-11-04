import _ from 'lodash';
import { Fragment } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Table } from '@src-v2/components/table/table';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { SeverityTag } from '@src-v2/components/tags';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { EllipsisText, ListItem, UnorderedList } from '@src-v2/components/typography';
import {
  EpssScoreWrapper,
  ExploitMaturityTooltipContent,
  isExploitMaturity,
} from '@src-v2/containers/entity-pane/sca/main-tab/vulnerabilities-card';
import { CveLink, CweLink } from '@src-v2/containers/entity-pane/sca/vulnerability-link';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { riskLevelWorkAround } from '@src-v2/data/risk-data';
import { RelatedFinding } from '@src-v2/types/artifacts/artifacts-types';
import { Provider } from '@src-v2/types/enums/provider';
import { StyledProps } from '@src-v2/types/styled';
import { Column } from '@src-v2/types/table';
import { CircleButton } from '@src/src-v2/components/button-v2/circle-button';

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  span {
    white-space: pre;
  }
`;

const SourceColumn = ({ data, ...props }: { data: RelatedFinding }) => (
  <Table.FlexCell {...props}>
    {Object.keys(data.sourceProviderToUrls)?.map((provider: Provider) => (
      <Fragment key={provider}>
        {provider && !provider.includes('Apiiro') && data.sourceProviderToUrls[provider]?.[0] ? (
          <>
            <Tooltip content={getProviderDisplayName(provider)}>
              <VendorIcon name={provider} />
            </Tooltip>
            <Tooltip content={`View CVE in ${getProviderDisplayName(provider)}`}>
              <CircleButton
                href={data.sourceProviderToUrls[provider]?.[0]}
                size={Size.XXSMALL}
                variant={Variant.FLOATING}>
                <SvgIcon name="External" size={Size.XSMALL} />
              </CircleButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip
            content={getProviderDisplayName(provider)}
            disabled={provider.includes('Apiiro')}>
            <VendorIcon name={provider} />
          </Tooltip>
        )}
      </Fragment>
    ))}
  </Table.FlexCell>
);

const NoCVSSData = styled.span`
  color: var(--color-blue-gray-35);
`;

const SourceColumnInCodeRepo = ({ data, ...props }: { data: RelatedFinding }) => (
  <Table.FlexCell {...props}>
    <>
      {data.provider && !data.provider.includes('Apiiro') && data.url ? (
        <>
          <Tooltip content={getProviderDisplayName(data.provider)}>
            <VendorIcon name={data.provider} />
          </Tooltip>
          <Tooltip content={`View CVE in ${data.provider}`}>
            <CircleButton href={data.url} size={Size.XXSMALL} variant={Variant.FLOATING}>
              <SvgIcon name="External" size={Size.XSMALL} />
            </CircleButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip
          content={`View CVE in ${data.provider}`}
          disabled={data.provider.includes('Apiiro')}>
          <VendorIcon name={data.provider} />
        </Tooltip>
      )}
    </>
  </Table.FlexCell>
);

const IdentifiersCell = styled(
  ({
    data: { cveIdentifiers, ...data },
    ...props
  }: StyledProps<{
    data: RelatedFinding;
  }>) => (
    <Table.FlexCell {...props}>
      <RiskIcon riskLevel={riskLevelWorkAround(data.cvssScore, data.severity)} />

      <UnorderedList>
        {cveIdentifiers.map(cve => (
          <ListItem key={cve}>
            {['sonatype', 'bdsa'].some(identifier => cve.toLowerCase().includes(identifier)) ? (
              <>{cve}</>
            ) : (
              <CveLink cve={cve} />
            )}
          </ListItem>
        ))}
      </UnorderedList>
    </Table.FlexCell>
  )
)`
  ${BaseIcon} {
    width: 4rem;
    min-width: 4rem;
    min-height: 4rem;
  }

  ${TextButton} {
    max-width: 33rem;
  }
`;

const commonColumns: Column<RelatedFinding>[] = [
  { key: 'ID-column', label: 'ID', Cell: IdentifiersCell, width: '48rem' },
  {
    key: 'related-finding-vulnerability-column',
    label: 'Vulnerability',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>
        <Tooltip content={data.description}>
          <EllipsisText>{data.description}</EllipsisText>
        </Tooltip>
      </Table.Cell>
    ),
    width: '35rem',
  },
  {
    key: 'related-finding-cvss-column',
    label: 'CVSS',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>
        {data.cvssScore && data.cvssScore !== -1 ? (
          <SeverityTag riskLevel={data.severity}>{data.cvssScore.toFixed(1)}</SeverityTag>
        ) : (
          <NoCVSSData>No CVSS data</NoCVSSData>
        )}
      </Table.Cell>
    ),
    width: '18rem',
  },
  {
    key: 'related-finding-exploit-maturity-column',
    label: 'Exploit maturity',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => {
      const noExploitMaturity = data.exploitMaturity === 'No exploit maturity data';
      return (
        <Table.Cell {...props}>
          <Tooltip
            interactive
            disabled={!isExploitMaturity(data.exploitMaturity)}
            content={
              <TooltipContent>
                <ExploitMaturityTooltipContent
                  exploitMaturity={data.exploitMaturity}
                  pocReferences={null}
                />
              </TooltipContent>
            }>
            <ExploitMaturityText data-disabled={noExploitMaturity}>
              {noExploitMaturity ? (
                data.exploitMaturity
              ) : (
                <SeverityTag riskLevel="high">{data.exploitMaturity}</SeverityTag>
              )}
            </ExploitMaturityText>
          </Tooltip>
        </Table.Cell>
      );
    },
    width: '37rem',
  },
  {
    key: 'related-finding-epss-column',
    label: (
      <LabelWrapper>
        EPSS
        <InfoTooltip
          content={
            <>
              The Exploit Prediction Scoring System (EPSS) is a tool for estimating <br /> the
              likelihood that a vulnerability will be exploited in the wild during the next 30 days.
              <br /> A higher EPSS score indicates a higher chance of exploitation.
              <br />
              Percentile indicates how likely a vulnerability is to be exploited compared to other
              vulnerabilities.
              <br /> A vulnerability with an EPSS percentile of 90% means it has a higher
              probability score than 90% of all other vulnerabilities.
            </>
          }
        />
      </LabelWrapper>
    ),
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>
        {data?.epss?.epssScore ? (
          <>
            <EpssScoreWrapper>
              Score:
              <SeverityTag riskLevel={data.epssSeverity}>{data.epss.epssScore}</SeverityTag>
            </EpssScoreWrapper>

            <Tooltip
              content={
                <>
                  Indicates how likely a vulnerability is to be exploited compared to other
                  vulnerabilities.
                  <br />A vulnerability with an EPSS percentile of 90% means it has a higher
                  probability <br />
                  score than 90% of all other vulnerabilities
                </>
              }>
              <div>Percentile: {_.round(data.epss?.percentile * 100, 2)}%</div>
            </Tooltip>
          </>
        ) : (
          <>No EPSS data</>
        )}
      </Table.Cell>
    ),
    width: '35rem',
  },
  {
    key: 'related-finding-cwe-column',
    label: 'CWE',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.FlexCell {...props}>
        <CweUnorderedList>
          {data.cweIdentifiers?.map(cwe => (
            <ListItem key={cwe}>
              <CweLink cwe={cwe.toUpperCase()} />
            </ListItem>
          ))}
        </CweUnorderedList>
      </Table.FlexCell>
    ),
    width: '31rem',
  },
];

export const relatedFindingsInContainerImageTableColumns: Column<RelatedFinding>[] = [
  ...commonColumns,
  {
    key: 'container-image-dependency-version-column',
    label: 'Dependency version',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <Table.Cell {...props}>{data.dependencyVersion}</Table.Cell>
    ),
    width: '31rem',
  },
  {
    key: 'container-image-image-id-column',
    label: 'Version identifiers',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <TrimmedCollectionCell {...props}>
        {data.imageIdentifications.map(_ => _.imageId)}
      </TrimmedCollectionCell>
    ),
    width: '20rem',
  },
  {
    key: 'container-image-source-column',
    label: 'Source',
    Cell: SourceColumn,
  },
];

export const relatedFindingsInCodeRepositoryTableColumns: Column<RelatedFinding>[] = [
  ...commonColumns,
  {
    key: 'container-image-dependency-versions-column',
    label: 'Dependency versions',
    Cell: ({ data, ...props }: { data: RelatedFinding }) => (
      <TrimmedCollectionCell {...props}>{data.versions}</TrimmedCollectionCell>
    ),
    width: '31rem',
  },
  {
    key: 'code-repository-source-column',
    label: 'Source',
    Cell: SourceColumnInCodeRepo,
  },
];

const CweUnorderedList = styled(UnorderedList)`
  padding: 0;
`;

const ExploitMaturityText = styled.span`
  &[data-disabled] {
    color: var(--color-blue-gray-35);
  }
`;
