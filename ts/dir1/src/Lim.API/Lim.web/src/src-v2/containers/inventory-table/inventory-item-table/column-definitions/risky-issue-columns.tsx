import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { ProcessTag } from '@src-v2/components/tags';
import { Size } from '@src-v2/components/types/enums/size';
import { ContributorAvatar } from '@src-v2/containers/contributors/contributor-avatar';
import { ProcessTag as ProcessTagType } from '@src-v2/types/inventory-elements/risky-issue';
import { StubAny } from '@src-v2/types/stub-any';
import { StyledProps } from '@src-v2/types/styled';
import { Column } from '@src-v2/types/table';

export const riskyIssueColumns: Column<StubAny>[] = [
  {
    key: 'issue-column',
    label: 'Issue',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <>
          {data.diffableEntity.type} &middot; {data.diffableEntity.id}
        </>
        <ClampText>{data.diffableEntity.title}</ClampText>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'labels-column',
    label: 'Labels',
    width: '30rem',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>{data.diffableEntity.labels}</TrimmedCollectionCell>
    ),
  },
  {
    key: 'components-column',
    label: 'Components',
    width: '30rem',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell {...props}>{data.diffableEntity.components}</TrimmedCollectionCell>
    ),
  },
  {
    key: 'assignees-column',
    label: 'Assignees',
    width: '60rem',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell<{
        avatarUrl: string;
        displayName: string;
      }>
        {...props}
        item={({ value }) => <AssigneeProfileContent profile={value} />}>
        {data.diffableEntity.assigneeProfiles}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'tags-column',
    label: 'Process tags',
    width: '30rem',
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell<ProcessTagType>
        {...props}
        item={({ value }) => <ProcessTag>{value.name}</ProcessTag>}>
        {data.diffableEntity.processTags}
      </TrimmedCollectionCell>
    ),
  },
];

const AssigneeProfileContent = styled(
  ({
    profile,
    ...props
  }: StyledProps & {
    profile: {
      avatarUrl: string;
      displayName: string;
    };
  }) => {
    return (
      <div {...props}>
        <ContributorAvatar
          size={Size.MEDIUM}
          avatarUrl={profile.avatarUrl}
          name={profile.displayName}
        />
        <ClampText withTooltip={false}>{profile.displayName}</ClampText>
      </div>
    );
  }
)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
