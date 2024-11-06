import { NavLink } from 'react-router-dom';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const licenseWithDependenciesColumns: Column<StubAny>[] = [
  {
    key: 'license-column',
    label: 'License',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.displayName}</SimpleTextCell>
    ),
  },
  {
    key: 'number-of-packages-column',
    label: 'Number of Packages',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <NavLink to={`dependencies?fl%5BLicenses%5D%5B0%5D=${data.diffableEntity.displayName}`}>
          {data.diffableEntity.dependencies?.length}
        </NavLink>
      </Table.Cell>
    ),
  },
];
