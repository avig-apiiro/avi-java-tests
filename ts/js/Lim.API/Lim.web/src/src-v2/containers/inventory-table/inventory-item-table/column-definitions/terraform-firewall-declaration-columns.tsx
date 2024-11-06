import _ from 'lodash';
import {
  DoubleLinedCell,
  SimpleTextCell,
} from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';

export const terraformFirewallDeclarationColumns: Column<StubAny>[] = [
  {
    key: 'name-column',
    label: 'Name',
    Cell: ({ data, ...props }) => {
      const providers = _.uniq(
        data.diffableEntity.esources?.map((resource: StubAny) => resource.split('_')[0])
      );
      return (
        <DoubleLinedCell {...props}>
          <>{providers.join(', ')}</>
          <>{data.displayName}</>
        </DoubleLinedCell>
      );
    },
  },
  {
    key: 'module-column',
    label: 'Module',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.modulePath}</SimpleTextCell>
    ),
  },
  {
    key: 'network-name-column',
    label: 'Network',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.network_name}</SimpleTextCell>
    ),
  },
  {
    key: 'rules-column',
    label: 'Rules',
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>{data.diffableEntity.rules?.length}</SimpleTextCell>
    ),
  },
];
