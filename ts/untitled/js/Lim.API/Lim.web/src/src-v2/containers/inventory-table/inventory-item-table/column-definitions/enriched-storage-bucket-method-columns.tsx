import _ from 'lodash';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const enrichedStorageBucketMethodColumns: Column<StubAny>[] = [
  {
    key: 'provider-column',
    label: 'Provider',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.provider}</SimpleTextCell>
    ),
  },
  {
    key: 'class-column',
    label: 'Class',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.containingClassName}</SimpleTextCell>
    ),
  },
  {
    key: 'method-call-column',
    label: 'Method call',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{`${
        data.diffableEntity.containingClassName
      } → ${data.diffableEntity.methodName?.replace('???.', '')}`}</SimpleTextCell>
    ),
  },
  {
    key: 'action-column',
    label: 'Action',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.methodAction}</SimpleTextCell>
    ),
  },
  {
    key: 'name-column',
    label: 'Name',
    Cell: ({ data, ...props }) => {
      const bucketNames = _.uniq((data.diffableEntity.bucketNames as string[])?.flat()).sort();
      return <TrimmedCollectionCell {...props}>{bucketNames}</TrimmedCollectionCell>;
    },
  },
];
