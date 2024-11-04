import { ClampPath } from '@src-v2/components/clamp-text';
import {
  DoubleLinedCell,
  SimpleTextCell,
} from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const gqlOperationColumns: Column<StubAny>[] = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>
          {
            (data.diffableEntity.resolverReference ?? data.diffableEntity.codeReference)
              .relativeFilePath
          }
        </ClampPath>
        <>{data.diffableEntity.name}</>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'operation-type-column',
    label: 'Operation Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.operationType}</SimpleTextCell>
    ),
  },
  {
    key: 'return-type-column',
    label: 'Return Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.returnType}</SimpleTextCell>
    ),
  },
];
