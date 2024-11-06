import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { getRepository } from '@src-v2/containers/inventory-table/inventory-utils';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { Table } from '@src/src-v2/components/table/table';

export function createEncryptionUsageColumns(profile: any): Column<StubAny>[] {
  return [
    {
      key: 'location-column',
      label: 'Location',
      resizeable: true,
      Cell: ({ data, ...props }) => {
        const repository = getRepository({ profile, data });
        return (
          <Table.Cell {...props} onClick={stopPropagation}>
            {Boolean(data.diffableEntity.codeReference) && (
              <CodeReferenceLink
                codeReference={data.diffableEntity.codeReference}
                repository={{
                  url: repository.url,
                  vendor: repository.server.provider,
                  referenceName: repository.referenceName,
                }}
              />
            )}
          </Table.Cell>
        );
      },
    },
    {
      key: 'framework-column',
      label: 'Framework',
      resizeable: true,
      Cell: ({ data, ...props }) => (
        <SimpleTextCell {...props}>{data.diffableEntity.framework}</SimpleTextCell>
      ),
    },
  ];
}
