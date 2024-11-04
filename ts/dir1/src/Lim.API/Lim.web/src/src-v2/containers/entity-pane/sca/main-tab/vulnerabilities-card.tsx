import _ from 'lodash';
import { FC, Fragment, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button, CircleButton, TextButton } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { QuickFilters } from '@src-v2/components/filters/quick-filters';
import { BaseIcon, SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Table } from '@src-v2/components/table/table';
import { SeverityTag } from '@src-v2/components/tags';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, ListItem, Paragraph, UnorderedList } from '@src-v2/components/typography';
import { isMinorChange } from '@src-v2/containers/entity-pane/sca/sca-utils';
import { useScaPaneContext } from '@src-v2/containers/entity-pane/sca/use-sca-pane-context';
import { CveLink, CweLink } from '@src-v2/containers/entity-pane/sca/vulnerability-link';
import { riskLevelWorkAround } from '@src-v2/data/risk-data';
import { useInject, useQueryParams } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Provider } from '@src-v2/types/enums/provider';
import { DependencyFinding, ExploitMaturity } from '@src-v2/types/inventory-elements';
import { StyledProps } from '@src-v2/types/styled';
import { Column } from '@src-v2/types/table';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';
import { InfoTooltip } from '@src/src-v2/components/tooltips/icon-tooltips';
import { getProviderDisplayName } from '@src/src-v2/data/providers';

export const exploitMaturities: ExploitMaturity[] = ['Known exploit', 'Exploit POC', 'High EPSS'];

export function isExploitMaturity(value: any): value is ExploitMaturity {
  return exploitMaturities.includes(value);
}

export function getExploitMaturityOrder(exploitMaturity: ExploitMaturity) {
  switch (exploitMaturity) {
    case 'Known exploit':
      return 0;
    case 'High EPSS':
      return 1;
    case 'Exploit POC':
      return 2;
    default:
      return Number.MAX_VALUE;
  }
}

function KnownExploitTooltipContent() {
  return (
    <>
      <TooltipContentWrapper>This is an actively exploited vulnerability.</TooltipContentWrapper>
      <TooltipContentWrapper>
        Source:{' '}
        <ExternalLink href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog">
          CISA.gov
        </ExternalLink>
      </TooltipContentWrapper>
    </>
  );
}

function HighEPSSTooltipContent() {
  return (
    <>
      <TooltipContentWrapper>
        This vulnerability has a high EPSS, which means it is highly likely to be exploited
        according to the EPSS algorithm
      </TooltipContentWrapper>
      <TooltipContentWrapper>
        Source:
        <ExternalLink href="https://www.first.org/epss/">first.org</ExternalLink>
      </TooltipContentWrapper>
    </>
  );
}

export function ExploitPOCTooltipContent({
  pocReferences,
}: {
  pocReferences?: Record<string, string[]>;
}) {
  return (
    <TooltipContentWrapper>
      This vulnerability has a proof of concept exploit. <br /> Sources:{' '}
      {pocReferences && (
        <span>
          {Object.entries(pocReferences).map(([key, value], index) => (
            <Fragment key={`${key}-${index}}`}>
              {_.isNil(value) || value.length === 0 ? (
                <>{key}</>
              ) : (
                <ExternalLink href={value[0]}>{key}</ExternalLink>
              )}
              {index !== Object.entries(pocReferences).length - 1 && <>, </>}
            </Fragment>
          ))}
        </span>
      )}
    </TooltipContentWrapper>
  );
}

export const ExploitMaturityTooltipContent: FC<{
  exploitMaturity: ExploitMaturity;
  pocReferences: Record<string, string[]>;
}> = ({ exploitMaturity, pocReferences }) => {
  switch (exploitMaturity) {
    case 'Known exploit':
      return <KnownExploitTooltipContent />;
    case 'High EPSS':
      return <HighEPSSTooltipContent />;
    case 'Exploit POC':
      return <ExploitPOCTooltipContent pocReferences={pocReferences} />;
    default:
      return null;
  }
};

export enum QuickFiltersOptions {
  Fixable = 'fixable',
  NonFixable = 'nonFixable',
  MinorUpgrade = 'minorUpgrade',
}

export const VulnerabilitiesCards = ({
  findings,
  compactRowsNumber = 10,
  ...props
}: ControlledCardProps & {
  findings: DependencyFinding[];
  compactRowsNumber?: number;
}) => {
  const { application } = useInject();
  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );
  const [fixableFindings = [], nonFixableFindings = []] = useMemo(
    () =>
      _.partition(
        _.orderBy(
          findings,
          [
            item => getExploitMaturityOrder(item.exploitMaturity),
            item => item.epss?.epssScore,
            'cvssScore',
          ],
          ['asc', 'desc', 'desc']
        ),
        'isFixable'
      ),
    [findings]
  );

  let activeFilter = QuickFiltersOptions.Fixable;

  if (fixableFindings.length || nonFixableFindings.length) {
    activeFilter = fixableFindings.length
      ? QuickFiltersOptions.Fixable
      : QuickFiltersOptions.NonFixable;
  }

  const [selectedFilter, setSelectedFilter] = useState<QuickFiltersOptions>(activeFilter);
  const {
    element: { version, resolvedVersion },
  } = useScaPaneContext();

  const currentVersion = version || resolvedVersion;
  const minorUpgradeFindings = useMemo(() => {
    const finding = findings.filter(finding =>
      isMinorChange(currentVersion, finding.nearestFixedVersion)
    );
    return _.orderBy(finding, ['cvssScore'], ['desc']);
  }, [findings, currentVersion]);

  const findingsToRender: DependencyFinding[] = useMemo(() => {
    switch (selectedFilter) {
      case QuickFiltersOptions.Fixable:
        return fixableFindings;
      case QuickFiltersOptions.NonFixable:
        return nonFixableFindings;
      case QuickFiltersOptions.MinorUpgrade:
        return minorUpgradeFindings;
      default:
        return [];
    }
  }, [selectedFilter]);

  const dependencyFindingsWithKey = useMemo(
    () =>
      findingsToRender.map(finding => ({
        key: finding.entityId,
        ...finding,
      })),
    [findingsToRender]
  );

  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  const clientTableModel = useClientDataTable<DependencyFinding & { key: string }>(
    dependencyFindingsWithKey,
    {
      key: 'dependencyFinding',
      columns: tableColumns,
    }
  );

  return (
    <ControlledCard {...props} title={`Vulnerabilities (${findings.length})`}>
      <Paragraph>
        {fixableFindings.length}/{findings.length} introduced vulnerabilities are fixable
      </Paragraph>

      <QuickFilters>
        <Button
          variant={Variant.FILTER}
          disabled={!fixableFindings.length}
          data-active={dataAttr(selectedFilter === QuickFiltersOptions.Fixable)}
          onClick={() => setSelectedFilter(QuickFiltersOptions.Fixable)}>
          Fixable &middot; {fixableFindings.length}
        </Button>
        <Button
          variant={Variant.FILTER}
          disabled={!nonFixableFindings.length}
          data-active={dataAttr(selectedFilter === QuickFiltersOptions.NonFixable)}
          onClick={() => setSelectedFilter(QuickFiltersOptions.NonFixable)}>
          Not Fixable &middot; {nonFixableFindings.length}
        </Button>
        <Button
          variant={Variant.FILTER}
          disabled={!minorUpgradeFindings.length}
          data-active={dataAttr(selectedFilter === QuickFiltersOptions.MinorUpgrade)}
          onClick={() => setSelectedFilter(QuickFiltersOptions.MinorUpgrade)}>
          Minor upgrade &middot; {minorUpgradeFindings.length}
        </Button>
      </QuickFilters>
      {isSmartTableOnRiskPaneEnabled ? (
        <PlainPaneTable
          dataModel={clientTableModel}
          itemName={pluralFormat(
            dependencyFindingsWithKey.length,
            'vulnerability',
            'vulnerabilities'
          )}
        />
      ) : (
        <CollapsibleTable compactRowsNumber={5} tableModel={tableModel} items={findingsToRender} />
      )}
    </ControlledCard>
  );
};

export const IdentifiersCell = styled(
  ({
    data: { securityAdvisoryReferences, cveIdentifiers, ...data },
    ...props
  }: StyledProps<{
    data: DependencyFinding;
  }>) => {
    const { application } = useInject();
    const { updateQueryParams } = useQueryParams();

    const isNewCvePaneEnabled =
      application.isFeatureEnabled(FeatureFlag.NewCvePane) &&
      Boolean(data.triage) &&
      (data.provider !== Provider.ApiiroSca
        ? application.isFeatureEnabled(FeatureFlag.NewCvePaneThirdParty)
        : true);

    const trackAnalytics = useTrackAnalytics();

    const handleClick = useCallback(() => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'open CVE pane',
        [AnalyticsDataField.CVEIdentifiers]: cveIdentifiers.join(','),
      });

      updateQueryParams({ cve: data.entityId, pane: null });
    }, [data]);

    const renderSecurityAdvisoryReferences = Boolean(securityAdvisoryReferences?.length);

    return (
      <Table.FlexCell {...props}>
        <RiskIcon riskLevel={riskLevelWorkAround(data.cvssScore, data.severity)} />

        <UnorderedList>
          {isNewCvePaneEnabled
            ? (renderSecurityAdvisoryReferences
                ? securityAdvisoryReferences.map(({ identifier }) => identifier)
                : cveIdentifiers
              )?.map(identifier => (
                <ListItem key={identifier}>
                  <OpenPaneButton onClick={handleClick}>{identifier}</OpenPaneButton>
                </ListItem>
              ))
            : renderSecurityAdvisoryReferences
              ? securityAdvisoryReferences.map(reference => (
                  <ListItem key={reference.identifier}>
                    <ExternalLink href={reference.url}>
                      <ClampText lines={2}>{reference.identifier}</ClampText>
                    </ExternalLink>
                  </ListItem>
                ))
              : cveIdentifiers.map(cve => (
                  <ListItem key={cve}>
                    <CveLink cve={cve} />
                  </ListItem>
                ))}
        </UnorderedList>
      </Table.FlexCell>
    );
  }
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

const OpenPaneButton = ({ onClick, children }: { onClick: () => void; children: string }) => (
  <TextButton size={Size.XXSMALL} onClick={onClick} underline>
    <ClampText>{children}</ClampText>
  </TextButton>
);

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const EpssScoreWrapper = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
`;

const tableColumns: Column<DependencyFinding>[] = [
  { key: 'ID-column', label: 'ID', Cell: IdentifiersCell, width: '48rem' },
  {
    label: 'Vulnerability',
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.Cell {...props}>
        <ClampText lines={3}>{data.displayName}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'CVSS-column',
    label: 'CVSS',
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.Cell {...props}>
        {data.cvssScore ? (
          <SeverityTag riskLevel={data?.severity.toString()}>
            {data.cvssScore.toFixed(1)}
          </SeverityTag>
        ) : (
          <EpssText data-disabled={true}>No CVSS data</EpssText>
        )}
      </Table.Cell>
    ),
  },
  {
    key: 'exploit-maturity',
    label: 'Exploit maturity',
    Cell: ({ data, ...props }: { data: DependencyFinding }) => {
      const exploitMaturitiesArray =
        data.exploitMaturities?.length > 0 ? data.exploitMaturities : [data.exploitMaturity];

      return (
        <Table.Cell {...props}>
          {exploitMaturitiesArray.map(exploitMaturity => (
            <ExploitMaturityContent
              key={exploitMaturity}
              exploitMaturity={exploitMaturity}
              cveEntity={data}
            />
          ))}
        </Table.Cell>
      );
    },
    width: '37rem',
  },
  {
    key: 'EPSS-column',
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
    // @ts-ignore
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.Cell {...props}>
        {data?.epss?.epssScore ? (
          <>
            <EpssScoreWrapper>
              Score:
              <SeverityTag riskLevel={data?.epssSeverity}>{data.epss.epssScore}</SeverityTag>
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
          <EpssText data-disabled={true}>No EPSS data</EpssText>
        )}
      </Table.Cell>
    ),
    width: '31rem',
  },
  {
    key: 'CWE-column',
    label: 'CWE',
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.FlexCell {...props}>
        <CweUnorderedList>
          {data.cweIdentifiers.map(cwe => (
            <ListItem key={cwe}>
              <CweLink cwe={cwe} />
            </ListItem>
          ))}
        </CweUnorderedList>
      </Table.FlexCell>
    ),
    width: '31rem',
  },
  {
    key: 'FixVersion-column',
    label: 'Fix version',
    // @ts-ignore
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.Cell {...props}>{data.nearestFixedVersion}</Table.Cell>
    ),
    width: '18rem',
  },
  {
    key: 'Source-column',
    label: 'Source',
    Cell: ({ data, ...props }: { data: DependencyFinding }) => (
      <Table.FlexCell {...props}>
        {data.provider && !data.provider.includes('Apiiro') && data.url ? (
          <>
            <Tooltip content={getProviderDisplayName(data.provider)}>
              <VendorIcon name={data.provider} fallback={<SvgIcon name="Api" />} />
            </Tooltip>
            <Tooltip content={`View CVE in ${data.provider}`}>
              <CircleButton href={data.url} size={Size.SMALL} variant={Variant.FLOATING}>
                <SvgIcon name="External" />
              </CircleButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip
            content={`View CVE in ${data.provider}`}
            disabled={data.provider.includes('Apiiro')}>
            <VendorIcon name={data.provider} fallback={<SvgIcon name="Api" />} />
          </Tooltip>
        )}
      </Table.FlexCell>
    ),
  },
];

export const ExploitMaturityContent = ({
  cveEntity,
  exploitMaturity,
}: {
  cveEntity: DependencyFinding;
  exploitMaturity: ExploitMaturity;
}) => {
  const isDisabled = !isExploitMaturity(exploitMaturity) && !cveEntity.isKev;
  return (
    <Tooltip
      interactive
      disabled={isDisabled}
      content={
        <TooltipContent>
          <ExploitMaturityTooltipContent
            exploitMaturity={exploitMaturity}
            pocReferences={Object.values(cveEntity.pocReferences)[0]}
          />
        </TooltipContent>
      }>
      {exploitMaturity === 'No exploit maturity data' || exploitMaturity === 'No known exploit' ? (
        <EpssText data-disabled={dataAttr(isDisabled)}>{exploitMaturity}</EpssText>
      ) : (
        <SeverityTag riskLevel="high">
          <EpssText data-disabled={dataAttr(isDisabled)}>{exploitMaturity}</EpssText>
        </SeverityTag>
      )}
    </Tooltip>
  );
};

const TooltipContentWrapper = styled.span``;

export const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CweUnorderedList = styled(UnorderedList)`
  padding: 0;
`;

const EpssText = styled.span`
  &[data-disabled] {
    color: var(--color-blue-gray-35);
  }
`;
