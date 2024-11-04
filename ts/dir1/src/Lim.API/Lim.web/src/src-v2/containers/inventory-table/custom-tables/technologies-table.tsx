import { Button } from '@src-v2/components/button-v2';
import { CodeReferenceLink } from '@src-v2/components/code-reference-link';
import { useProfilesContext } from '@src-v2/components/profiles-inject-context';
import { Table } from '@src-v2/components/table/table';
import { SimpleTextCell } from '@src-v2/components/table/table-common-cells/simple-text-cell';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { InventoryTabProps } from '@src-v2/containers/inventory/inventory-v2';
import { useInject, useSuspense } from '@src-v2/hooks';
import { ClientFilterFunction, useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useExportCsv } from '@src-v2/hooks/use-export-csv';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { TechnologyUsageSchema } from '@src-v2/types/profiles/technology-category-schema';
import { CodeReference } from '@src-v2/types/risks/code-reference';

export function TechnologyUsagesTable({ profile, profileType }: InventoryTabProps) {
  const { profiles } = useProfilesContext();

  const moduleRoot =
    profileType === ProfileType.Module && profile.module ? profile.module.key : null;
  const technologies = useSuspense(profiles.getTechnologyUsages, {
    key: profile.key,
    profileType: profile.type,
    moduleRoot,
  });

  const { application } = useInject();
  const dataModel = useClientDataTable(
    technologies,
    {
      key: 'technologies',
      columns,
    },
    filterItemFunction
  );

  const [handleExport, exportLoading] = useExportCsv(() =>
    profiles.exportTechnologyUsages({
      key: profile.key,
      profileType: profile.type,
      moduleRoot,
    })
  );

  return (
    <PlainInventoryTable
      dataModel={dataModel}
      actions={
        application.isFeatureEnabled(FeatureFlag.ExportInventory) && (
          <Button
            startIcon="Export"
            variant={Variant.PRIMARY}
            loading={exportLoading}
            disabled={!dataModel.searchState.total}
            onClick={handleExport}
            size={Size.LARGE}>
            Export
          </Button>
        )
      }
    />
  );
}

const columns = [
  {
    key: 'framework-column',
    label: 'Framework',
    resizeable: true,
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data.technology}</SimpleTextCell>,
  },
  {
    key: 'category-column',
    label: 'Category',
    resizeable: true,
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data.category}</SimpleTextCell>,
  },
  {
    key: 'subcategory-column',
    label: 'Type',
    resizeable: true,
    Cell: ({ data, ...props }) => <SimpleTextCell {...props}>{data.subCategory}</SimpleTextCell>,
  },
  {
    key: 'introduced-through',
    label: 'Introduced through',
    resizeable: true,
    Cell: ({ data, ...props }: { data: TechnologyUsageSchema }) => (
      <Table.FlexCell {...props}>
        <TrimmedCollectionDisplay
          limit={1}
          limitExcessiveItems={5}
          searchMethod={({ item, searchTerm }) =>
            item.relativeFilePath?.toLowerCase()?.includes(searchTerm?.toLowerCase())
          }
          item={({ value }: { value: CodeReference }) => (
            <CodeReferenceLink
              lines={2}
              repository={{
                url: data.repository.url,
                vendor: data.repository.provider,
                referenceName: data.repository.referenceName,
              }}
              codeReference={value}
            />
          )}>
          {data.codeReferences}
        </TrimmedCollectionDisplay>
      </Table.FlexCell>
    ),
  },
];

const filterItemFunction: ClientFilterFunction<TechnologyUsageSchema> = (item, { searchTerm }) =>
  !searchTerm ||
  [item.category, item.subCategory, item.technology].some(text =>
    text.toLowerCase().includes(searchTerm.toLowerCase())
  );
