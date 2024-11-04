import styled from 'styled-components';
import { ActivityIndicator } from '@src-v2/components/activity-indicator';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { ClampText } from '@src-v2/components/clamp-text';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { TableGrouping } from '@src-v2/components/table/table-grouping';
import { RiskTag } from '@src-v2/components/tags';
import { Size } from '@src-v2/components/types/enums/size';
import { EllipsisText, ExternalLink, Small } from '@src-v2/components/typography';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { ComplianceFrameworkReference } from '@src-v2/types/inventory-elements/code-findings';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { formatNumber } from '@src-v2/utils/number-utils';

type GroupEnrichElementsType = {
  isActive?: boolean;
  provider?: string;
  businessImpact?: BusinessImpact;
  repositoryName?: string;
  branchName?: string;
  complianceFrameworkReference?: ComplianceFrameworkReference;
};

type ItemType = {
  displayName: string;
  totalRisks: number;
  risks: { risk: string; count: number }[];
  ruleRiskLevel: string;
  filterKey: string;
  groupEnrichElements?: GroupEnrichElementsType;
};

export const RisksCountersCell = ({ item, ...props }: { item: ItemType }) => (
  <RiskTagsContainer {...props}>
    {item.risks?.map(({ risk, count }, index: number) => (
      <RiskTag key={index} riskLevel={risk?.toLowerCase()} size={Size.SMALL}>
        {formatNumber(count)}
      </RiskTag>
    ))}
  </RiskTagsContainer>
);

export const TotalRisksCell = ({ item, ...props }: { item: ItemType }) => (
  <TableGrouping.Cell {...props} data-center>
    {formatNumber(item.totalRisks)}
  </TableGrouping.Cell>
);

export const TitleRisksCell = ({ item, ...props }: { item: ItemType }) => {
  const { provider, complianceFrameworkReference, businessImpact, isActive } =
    item.groupEnrichElements || {};

  return (
    <TableGrouping.Cell {...props} data-grouping-title>
      {item.filterKey === 'Artifact' && <SvgIcon name="ContainerImage" size={Size.XSMALL} />}
      {provider && <VendorIcon name={provider} size={Size.XSMALL} />}
      {!complianceFrameworkReference && <EllipsisText>{item.displayName}</EllipsisText>}
      {businessImpact && <BusinessImpactIndicator businessImpact={businessImpact} />}
      {isActive && <ActivityIndicator active={isActive} />}
      {complianceFrameworkReference && (
        <>
          <ExternalLink href={complianceFrameworkReference?.url} onClick={stopPropagation}>
            <EllipsisText>{`${complianceFrameworkReference?.securityComplianceFramework.toUpperCase()}-${complianceFrameworkReference?.identifier}`}</EllipsisText>
          </ExternalLink>
          - <ClampText>{complianceFrameworkReference?.description}</ClampText>
        </>
      )}
    </TableGrouping.Cell>
  );
};

export const GroupingDoubleLineTitle = ({ item, ...props }: { item: ItemType }) => (
  <TableGrouping.Cell {...props} data-grouping-title>
    {item.groupEnrichElements?.repositoryName && item.groupEnrichElements?.branchName && (
      <>
        <SvgIcon name="Module" size={Size.XSMALL} />
        <DoubleLineCell>
          <Small>{`${item.groupEnrichElements?.repositoryName} (${item.groupEnrichElements?.branchName} branch)`}</Small>
          {item.displayName}
        </DoubleLineCell>
      </>
    )}
  </TableGrouping.Cell>
);

const DoubleLineCell = styled.div`
  display: flex;
  flex-direction: column;
`;
const RiskTagsContainer = styled(TableGrouping.Cell)`
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 2rem;
`;
