import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { useOpenDataModelReferencePane } from '@src-v2/containers/entity-pane/use-open-data-model-reference-pane';
import { columnDefinitions } from '@src-v2/containers/inventory-table/inventory-item-table/column-definitions';
import { createInventoryEntityActionsColumn } from '@src-v2/containers/inventory-table/inventory-item-table/inventory-entity-actions-column';
import { PlainInventoryTable } from '@src-v2/containers/inventory-table/plain-inventory-table';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useExportCsv } from '@src-v2/hooks/use-export-csv';
import { useFilters } from '@src-v2/hooks/use-filters';
import { SearchInventoryDataParams } from '@src-v2/services';
import { DiffableEntityDataModelReference } from '@src-v2/types/data-model-reference/data-model-reference';
import { EntityType } from '@src-v2/types/enums/entity-type';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { ProfileType } from '@src-v2/types/enums/profile-type';
import { BaseElement } from '@src-v2/types/inventory-elements/base-element';
import { InventoryElementCollectionRow } from '@src-v2/types/inventory-elements/inventory-element-collection-row';

export const InventoryEntityTable = observer(
  <T extends BaseElement = BaseElement>({
    entityType,
    profile,
    profileType,
    enrichPage,
    hideExport = false,
  }: Omit<SearchInventoryDataParams<T>, 'profileKey'> & {
    profile: any;
    hideExport?: boolean;
  }) => {
    const { inventory, application } = useInject();
    const {
      activeFilters: { searchTerm, ...filters },
    } = useFilters();

    const filterOptions = useSuspense(inventory.getInventoryFilterOptions, {
      profileKey: profile.key,
      profileType,
      entityType,
    });

    const moduleRoot =
      profileType === ProfileType.Module && profile.module ? profile.module.key : null;

    const columns = useMemo(() => {
      const columnDefs = columnDefinitions[entityType];
      return [
        ...(typeof columnDefs === 'function' ? columnDefs(profile) : columnDefs),
        createInventoryEntityActionsColumn(profile),
      ];
    }, [entityType]);

    const dataModel = useDataTable(
      inventory.searchInventoryData<T>,
      {
        key: `${entityType}-${profileType}`,
        columns,
        searchParams: {
          filters,
          profileType,
          profileKey: profile.key,
          entityType,
          enrichPage,
          moduleRoot,
        },
      },
      inventory.getTotalCounterInventoryData<T>,
      inventory.getFilteredCounterInventoryData<T>
    );

    const [handleExport, exportLoading] = useExportCsv(() =>
      inventory.exportInventoryData<T>({
        profileKey: profile.key,
        profileType,
        entityType,
        filters,
        moduleRoot,
      })
    );

    return (
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: `${entityType}-table` }}>
        <PlainInventoryTable
          dataModel={dataModel}
          filterOptions={filterOptions}
          row={rowProps => <InventoryRow<T> {...rowProps} entityType={entityType} />}
          actions={
            application.isFeatureEnabled(FeatureFlag.ExportInventory) &&
            !hideExport && (
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
      </AnalyticsLayer>
    );
  }
);

function InventoryRow<T extends BaseElement>({
  data,
  entityType,
  ...props
}: {
  data: InventoryElementCollectionRow<T>;
  entityType: EntityType;
}) {
  const openPane = useOpenDataModelReferencePane();

  const handleOpenPane = useCallback(() => {
    const dataReference: DiffableEntityDataModelReference = {
      containingProfileId: data.profileKey,
      containingProfileType: data.profileType,
      diffableEntityId: data.entityKey,
      diffableEntityType: data.entityType,
      diffableEntityObjectType: data.objectType,
      inventoryTableEntityType: entityType,
    };

    if (entityType === EntityType.Issue) {
      dataReference.diffableEntityType = 'Issue';
    }

    openPane(dataReference);
  }, [openPane]);

  return <DataTable.Row {...props} data={data} onClick={handleOpenPane} />;
}
