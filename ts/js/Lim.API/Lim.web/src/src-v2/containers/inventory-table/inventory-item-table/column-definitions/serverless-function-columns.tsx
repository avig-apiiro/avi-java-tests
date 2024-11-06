import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionCell } from '@src-v2/components/table/table-common-cells/trimmed-collection-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const serverlessFunctionColumns: Column<StubAny>[] = [
  {
    key: 'function-column',
    label: 'Function',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.functionKey}</SimpleTextCell>
    ),
  },
  {
    key: 'trigger-type-column',
    label: 'Trigger type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <TrimmedCollectionCell<string> {...props}>
        {data.diffableEntity.triggerEvents}
      </TrimmedCollectionCell>
    ),
  },
  {
    key: 'runtime-column',
    label: 'Runtime',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.runtime}</SimpleTextCell>
    ),
  },
  {
    key: 'handler-column',
    label: 'Handler',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.handlerIdentifier}</SimpleTextCell>
    ),
  },
];
