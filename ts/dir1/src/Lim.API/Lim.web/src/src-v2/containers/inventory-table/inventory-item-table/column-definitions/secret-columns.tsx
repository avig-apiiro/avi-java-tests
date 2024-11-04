import styled from 'styled-components';
import { ClampPath } from '@src-v2/components/clamp-text';
import { VendorIcon } from '@src-v2/components/icons';
import {
  DoubleLinedCell,
  SimpleTextCell,
} from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Link } from '@src-v2/components/typography';
import { EnrichedSecretElement } from '@src-v2/containers/inventory-table/inventory-item-table/table-enrichers';
import { hasVendorIcon } from '@src-v2/data/icons';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { StubAny } from '@src-v2/types/stub-any';
import { Column } from '@src-v2/types/table';
import { makeUrl } from '@src-v2/utils/history-utils';
import { cutAroundCensoredValue } from '@src-v2/utils/secret-utils';
import { humanize } from '@src-v2/utils/string-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';
import { Table } from '@src/src-v2/components/table/table';

export const secretColumns: Column<StubAny>[] = [
  {
    key: 'path-column',
    label: 'Path',
    resizeable: true,
    width: '125rem',
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <ClampPath>{data.diffableEntity.relativeFilePath}</ClampPath>
        <Tooltip
          content={
            data.diffableEntity.lineNumbers?.[0] && `Line ${data.diffableEntity.lineNumbers[0]}`
          }>
          {data.diffableEntity.censoredValues?.length && (
            <span>{cutAroundCensoredValue(data.diffableEntity.censoredValues[0])}</span>
          )}
        </Tooltip>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'secret-type-column',
    label: 'Secret type',
    width: '35rem',
    Cell: ({ data, ...props }) => (
      <DoubleLinedCell {...props}>
        <>{humanize(data.diffableEntity.category)}</>
        <>
          {data.diffableEntity.category !== 'UserPassword' &&
            data.diffableEntity.subCategoryDescription}
        </>
      </DoubleLinedCell>
    ),
  },
  {
    key: 'exposure-column',
    label: 'Exposure',
    resizeable: true,
    Cell: ({ data, ...props }) =>
      isTypeOf<EnrichedSecretElement>(data.diffableEntity, 'exclusionDefinitionName') ? (
        <Table.Cell {...props}>
          <Tooltip content="Edit definition">
            <Link
              to={makeUrl('/governance/definitions', {
                edit: data.diffableEntity.exclusionDefinitionId,
              })}>
              Ignored by definition "{data.diffableEntity.exclusionDefinitionName}"
            </Link>
          </Tooltip>
        </Table.Cell>
      ) : (
        <SimpleTextCell {...props}>{data.diffableEntity.type}</SimpleTextCell>
      ),
  },
  {
    key: 'file-type-column',
    label: 'File Type',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SimpleTextCell {...props}>
        {data.diffableEntity.fileClassification &&
        data.diffableEntity.fileClassification !== 'Default'
          ? data.diffableEntity.fileClassification
          : ''}
      </SimpleTextCell>
    ),
  },
  {
    key: 'source-column',
    label: 'Source',
    resizeable: true,
    Cell: ({ data, ...props }) => (
      <SecretsCellProvidersContainer {...props}>
        {data.diffableEntity.sources.map((provider: StubAny) => (
          <Tooltip key={provider} content={getProviderDisplayName(provider)}>
            {hasVendorIcon(provider) && <VendorIcon name={provider} />}
          </Tooltip>
        ))}
      </SecretsCellProvidersContainer>
    ),
  },
];

const SecretsCellProvidersContainer = styled(Table.FlexCell)`
  margin-left: 4rem;
`;
