import { useCallback } from 'react';
import styled from 'styled-components';
import { DeleteButton } from '@src-v2/components/buttons';
import { Chip } from '@src-v2/components/chips';
import { SvgIcon } from '@src-v2/components/icons';
import { StretchingInput } from '@src-v2/components/stretching-input';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { BranchType, InsightsCellProps, LabelCellProps } from '@src-v2/types/multi-branch';
import { StyledProps } from '@src-v2/types/styled';

export const BranchInsightsCell = styled(
  ({
    branch,
    defaultBranch,
    changedData,
    monitoredBranches,
    suggestedBranches,
    setChangedData,
    setSuggestedBranches,
    setMonitoredBranches,
    ...props
  }: StyledProps & InsightsCellProps) => {
    const handleBranchUnmonitor = useCallback(
      ({ name, isSuggested }: { name: string; isSuggested?: boolean }) => {
        if (isSuggested) {
          setSuggestedBranches([
            ...suggestedBranches,
            monitoredBranches.find(branch => branch.name === name),
          ]);
        }
        setMonitoredBranches(monitoredBranches.filter(branch => branch.name !== name));

        // update changed data
        const currentChange = { ...changedData };
        if (currentChange.branchesToMonitor.includes(name)) {
          currentChange.branchesToMonitor = currentChange.branchesToMonitor.filter(
            branch => branch !== name
          );
        } else {
          currentChange.branchesToUnmonitor = [...currentChange.branchesToUnmonitor, name];
        }
        setChangedData(currentChange);
      },
      [
        monitoredBranches,
        setMonitoredBranches,
        suggestedBranches,
        setSuggestedBranches,
        changedData,
        setChangedData,
      ]
    );

    return (
      <Table.FlexCell {...props}>
        <InsightsList>
          {branch.isSuggested && (
            <Tooltip content="Popular target of merges">
              <StarIcon name="Star" />
            </Tooltip>
          )}
          {branch.name === defaultBranch && <Chip>default branch</Chip>}
        </InsightsList>
        {monitoredBranches.length > 1 && (
          <Tooltip content="Delete">
            <DeleteButton onClick={() => handleBranchUnmonitor(branch)} />
          </Tooltip>
        )}
      </Table.FlexCell>
    );
  }
)`
  justify-content: space-between;

  ${DeleteButton} {
    visibility: hidden;
  }

  &:hover {
    ${DeleteButton} {
      visibility: visible;
    }
  }
`;

export const LabelCell = ({
  branch,
  changedData,
  setChangedData,
  ...props
}: StyledProps & LabelCellProps) => {
  const handleLabelChange = useCallback(
    (branch: BranchType, value: string) => {
      const updatedData = { ...changedData };
      const branchLabel = branch.label ?? '';

      if (value === branchLabel) {
        delete updatedData.branchTags[branch.name];
      } else {
        updatedData.branchTags[branch.name] = value;
      }

      return setChangedData(updatedData);
    },
    [changedData, setChangedData]
  );

  return (
    <Table.FlexCell {...props}>
      <Tooltip content="Click to edit">
        <span>
          <StretchingInput
            value={changedData.branchTags?.[branch.name] ?? branch.label}
            onBlur={value => handleLabelChange(branch, value)}
            onDelete={() => handleLabelChange(branch, '')}
          />
        </span>
      </Tooltip>
    </Table.FlexCell>
  );
};

const InsightsList = styled.div`
  display: flex;
  gap: 2rem;
`;

const StarIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-50);
  fill: var(--color-yellow-30);
`;
