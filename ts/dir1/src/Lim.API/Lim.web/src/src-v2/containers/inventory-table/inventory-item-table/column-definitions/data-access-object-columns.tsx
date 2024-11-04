import { ClampPath } from '@src-v2/components/clamp-text';
import { DoubleLinedCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';

export const dataAccessObjectColumns = [
  {
    key: 'name-column',
    label: 'Name',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>{data.diffableEntity.codeReference.relativeFilePath}</ClampPath>
        <>{data.diffableEntity.codeReference.name}</>
      </DoubleLinedCell>
    ),
  },
];
