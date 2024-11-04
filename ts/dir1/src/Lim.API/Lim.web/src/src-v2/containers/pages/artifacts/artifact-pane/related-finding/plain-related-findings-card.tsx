import _ from 'lodash';
import { ReactNode, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { Collapsible } from '@src-v2/components/collapsible';
import {
  ContributorListItem,
  ContributorUsernameLink,
} from '@src-v2/components/entity-pane/remediation/contributors-card';
import { QuickFilters } from '@src-v2/components/filters/quick-filters';
import { PlainPaneTable } from '@src-v2/components/panes/plain-pane-table';
import { CollapsibleTable } from '@src-v2/components/table/collapsible-table';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { isMinorChange } from '@src-v2/containers/entity-pane/sca/sca-utils';
import { useArtifactPaneContext } from '@src-v2/containers/pages/artifacts/artifact-pane/use-artifact-pane-context';
import { useInject } from '@src-v2/hooks';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useTable } from '@src-v2/hooks/use-table';
import { RelatedFinding } from '@src-v2/types/artifacts/artifacts-types';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { LeanCodeOwner } from '@src-v2/types/profiles/lean-developer';
import { dataAttr } from '@src-v2/utils/dom-utils';
import { pluralFormat } from '@src-v2/utils/number-utils';
import {
  QuickFiltersOptions,
  getExploitMaturityOrder,
} from '@src/src-v2/containers/entity-pane/sca/main-tab/vulnerabilities-card';
import { Column } from '@src/src-v2/types/table';

export const PlainRelatedFindingsCard = ({
  title,
  subTitle: SubTitle,
  relatedFindingData,
  tableColumns,
  codeOwner,
  ...props
}: {
  tableColumns: Column<RelatedFinding>[];
  relatedFindingData?: RelatedFinding[];
  title: ReactNode;
  subTitle: ReactNode;
  codeOwner?: LeanCodeOwner;
} & ControlledCardProps) => {
  const { finding: findingObj } = useArtifactPaneContext();
  const { application } = useInject();
  const isSmartTableOnRiskPaneEnabled = application.isFeatureEnabled(
    FeatureFlag.SmartTableOnRiskPane
  );

  const [fixableFindings = [], nonFixableFindings = []] = useMemo(
    () =>
      _.partition(
        _.orderBy(
          relatedFindingData,
          [item => getExploitMaturityOrder(item.exploitMaturity), 'cvssScore'],
          ['asc', 'desc']
        ),
        'isFixable'
      ),
    [relatedFindingData]
  );

  const activeFilter =
    !fixableFindings.length && nonFixableFindings.length
      ? QuickFiltersOptions.NonFixable
      : QuickFiltersOptions.Fixable;

  const [selectedFilter, setSelectedFilter] = useState<QuickFiltersOptions>(activeFilter);

  const [currentVersion] = findingObj.finding.packageVersions;
  const minorUpgradeFindings = useMemo(() => {
    const finding = relatedFindingData?.filter(finding =>
      isMinorChange(currentVersion, finding.nearestFixVersion)
    );
    return _.orderBy(finding, ['cvssScore'], ['desc']);
  }, [relatedFindingData, currentVersion]);

  const tableModel = useTable({
    tableColumns,
    hasReorderColumns: false,
  });

  const findingsToRender: RelatedFinding[] = useMemo(() => {
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
        key: finding.artifactKey,
        ...finding,
      })),
    [findingsToRender]
  );

  const clientTableModel = useClientDataTable<RelatedFinding & { key: string }>(
    dependencyFindingsWithKey,
    {
      key: 'dependencyFinding',
      columns: tableColumns,
    }
  );

  return (
    <ControlledCardWrapper {...props} title={title}>
      <>
        {relatedFindingData?.length > 0 ? (
          <>
            {SubTitle}
            <FixableTitle>
              {fixableFindings.length}/ {relatedFindingData.length} introduced vulnerabilities are
              fixable
            </FixableTitle>
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
                itemName={pluralFormat(dependencyFindingsWithKey.length, 'related finding')}
              />
            ) : (
              <CollapsibleTable
                compactRowsNumber={5}
                tableModel={tableModel}
                items={findingsToRender}
              />
            )}
          </>
        ) : (
          <NotRelatedFindings>No related findings</NotRelatedFindings>
        )}

        {codeOwner && (
          <ContributorListItem
            contributor={codeOwner}
            relatedEntity={{
              activeSince: codeOwner.activeSince.toString(),
              lastActivity: codeOwner.lastActivity.toString(),
              isActive: codeOwner.isActive,
            }}>
            <ContributorUsernameLink contributor={codeOwner} />
            &nbsp; is a main contributor for this context
          </ContributorListItem>
        )}
      </>
    </ControlledCardWrapper>
  );
};

const NotRelatedFindings = styled.span``;

const ControlledCardWrapper = styled(ControlledCard)`
  &[data-open] > ${Collapsible.Head} {
    margin-bottom: 0;
  }

  &:has(${NotRelatedFindings}) {
    &[data-open] > ${Collapsible.Head} {
      margin-bottom: 4rem;
    }
  }
`;

const FixableTitle = styled.div`
  margin-bottom: 4rem;
`;
