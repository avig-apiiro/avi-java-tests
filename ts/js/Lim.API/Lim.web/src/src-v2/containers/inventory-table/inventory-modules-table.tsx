import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { InsightTag } from '@src-v2/components/tags';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { ExternalLink } from '@src-v2/components/typography';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { generateCodeReferenceUrl } from '@src-v2/data/connectors';
import { ClientFilterFunction, useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { Filter } from '@src-v2/hooks/use-filters';
import { Provider } from '@src-v2/types/enums/provider';
import { CodeModule } from '@src-v2/types/profiles/code-module';
import { stopPropagation } from '@src-v2/utils/dom-utils';

interface DisplayCodeModule extends Omit<CodeModule, 'repositoryKey'> {
  repository: {
    key: string;
    name: string;
    referenceName: string;
    url: string;
    provider: keyof typeof Provider;
  };
}

const filterOptions: Filter[] = [
  {
    key: 'IsSensitive',
    type: 'checkbox',
    title: 'Insights',
    isGrouped: false,
    options: [
      {
        key: 'true',
        title: 'Sensitive',
        value: 'true',
      },
    ],
    defaultValue: null,
    defaultValues: null,
    isAdditional: false,
  },
];

export function InventoryModulesTable({
  modules = [],
  profile,
}: {
  modules: CodeModule[];
  profile: any;
}) {
  const history = useHistory();

  const transformedModules = useMemo<DisplayCodeModule[]>(() => {
    return modules.map((module, index) => {
      const repository = profile.repositoryByKey
        ? profile.repositoryByKey[module.repositoryKey]
        : profile.repository;

      return {
        ...module,
        key: `${module.key}-${index}`,
        repository: {
          key: repository.key,
          provider: repository.server.provider,
          name: repository.name,
          referenceName: repository.referenceName,
          url: repository.url,
        },
      };
    });
  }, [modules]);

  const dataModel = useClientDataTable(
    transformedModules,
    {
      key: 'modules',
      columns,
    },
    filterModules
  );

  const onModuleClicked = useCallback((module: DisplayCodeModule) => {
    history.push(
      `/module/${encodeURIComponent(module.repository.key)}/${encodeURIComponent(module.root)}`
    );
  }, []);

  return (
    <PlainInventoryTable
      dataModel={dataModel}
      filterOptions={filterOptions}
      row={({ data, ...rowProps }) => (
        <DataTable.Row {...rowProps} data={data} onClick={() => onModuleClicked(data)} />
      )}
    />
  );
}

const columns = [
  {
    key: 'name-column',
    label: 'Name',
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data.name}</SimpleTextCell>,
  },
  {
    key: 'path-column',
    label: 'Path',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <Tooltip content={`View in ${data.repository.provider}`}>
          <ExternalLink
            href={generateCodeReferenceUrl(data.repository, { relativeFilePath: data.root })}
            onClick={stopPropagation}>
            {data.repository.name}/{data.root}
          </ExternalLink>
        </Tooltip>
      </Table.Cell>
    ),
  },
  {
    key: 'insights-column',
    label: 'Insights',
    width: '10rem',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        {data.isSensitive && (
          <InsightTag insight={{ badge: 'Sensitive', description: 'This module is sensitive' }} />
        )}
      </Table.Cell>
    ),
  },
];

const filterModules: ClientFilterFunction<DisplayCodeModule> = (item, { searchTerm, filters }) => {
  const searchTermFilter =
    !searchTerm ||
    [item.name, item.root].some(text => text.toLowerCase().includes(searchTerm.toLowerCase()));

  const isSensitiveFilter = filters.hasOwnProperty('IsSensitive')
    ? item.isSensitive.toString() === filters.IsSensitive.values[0]
    : true;

  return searchTermFilter && isSensitiveFilter;
};
