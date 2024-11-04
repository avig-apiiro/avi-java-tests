import _ from 'lodash';
import { useCallback } from 'react';
import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { Caption1 } from '@src-v2/components/typography';
import { SlaTag } from '@src-v2/containers/sla/sla-tag';
import { riskOrder } from '@src-v2/data/risk-data';
import { GranulatedSlaPolicyDefinition } from '@src-v2/services';
import { Column } from '@src-v2/types/table';
import { entries } from '@src-v2/utils/ts-utils';

export const createGranularPoliciesColumns = ({
  onEdit,
  onDelete,
}: {
  onEdit: (policy: GranulatedSlaPolicyDefinition) => void;
  onDelete: (policy: GranulatedSlaPolicyDefinition) => void;
}): Column<GranulatedSlaPolicyDefinition>[] => [
  {
    key: 'policy-name',
    label: 'SLA name',
    width: '50%',
    Cell: PolicyNameCell,
  },
  {
    key: 'sla-configuration',
    label: 'SLA per severity (days)',
    width: '50%',
    Cell: ({ data, ...props }) => (
      <Table.FlexCell {...props}>
        {_.orderBy(
          entries(data.slaConfiguration),
          ([severity]) => riskOrder.indexOf(severity),
          'desc'
        ).map(([severity, value]) => (
          <SlaTag key={severity} severity={severity} value={value} />
        ))}
      </Table.FlexCell>
    ),
  },
  {
    key: 'actions-menu',
    width: '16rem',
    label: '',
    Cell: ({ data, ...props }) => {
      const handleEdit = useCallback(() => onEdit(data), [data]);
      const handleDelete = useCallback(() => onDelete(data), [data]);

      return (
        <Table.Cell {...props}>
          <DropdownMenu>
            <Dropdown.Item onClick={handleEdit}>
              <SvgIcon name="Edit" /> Edit
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDelete}>
              <SvgIcon name="Trash" /> Delete
            </Dropdown.Item>
          </DropdownMenu>
        </Table.Cell>
      );
    },
  },
];

const PolicyNameCell = styled(({ data, ...props }: { data: GranulatedSlaPolicyDefinition }) => (
  <Table.FlexCell {...props}>
    <Caption1>{data.policyType === 'Application' ? 'Applications' : 'Teams'}</Caption1>
    <ClampText>{data.name}</ClampText>
  </Table.FlexCell>
))`
  flex-direction: column;
  gap: unset;
  align-items: flex-start;
  justify-content: center;

  ${Caption1} {
    font-weight: 300;
    color: var(--color-blue-gray-65);
  }
`;
