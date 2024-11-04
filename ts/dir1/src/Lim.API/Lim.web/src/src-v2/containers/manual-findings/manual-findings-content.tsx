import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { SvgIcon } from '@src-v2/components/icons';
import { Gutters } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { usePaneState } from '@src-v2/components/panes/pane-context-provider';
import { ResultsCounter } from '@src-v2/components/persistent-search-state/persistent-search-filters';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { SelectMenu } from '@src-v2/components/select-menu';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable as _DataTable } from '@src-v2/containers/data-table/data-table';
import {
  SelectedCount,
  TableConditionalActions,
  TableSearch,
} from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { FindingPane } from '@src-v2/containers/finding-pane/finding-pane';
import { UploadManualFindingReportModal } from '@src-v2/containers/manual-findings/upload-manual-findings-report-modal';
import {
  DiscoveryDateCell,
  FindingComponentCell,
} from '@src-v2/containers/risks/risks-common-cells';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { ManualFindingResponse } from '@src-v2/services';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Column } from '@src-v2/types/table';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';
import { formatNumber } from '@src-v2/utils/number-utils';
import { FindingRowActionCell } from './finding-row-actions';

export const ManualFindingsPage = observer(() => {
  const { findings, rbac, application, toaster } = useInject();
  const history = useHistory();
  const [modalElement, setModal, closeModal] = useModalState();

  const filterOptions = useSuspense(findings.getFilterOptions);

  const dataModel = useDataTable(findings.searchManualFindings, {
    columns: tableColumns,
    selectable: true,
  });

  const canWrite = rbac.canEdit(resourceTypes.ManualFindings);
  const isNewSettingsLayout = application.isFeatureEnabled(FeatureFlag.SettingsNewLayout);

  const handleOpenModal = () => {
    setModal(<UploadManualFindingReportModal onClose={closeModal} onSubmit={() => {}} />);
  };

  const deleteFindings = useCallback(async () => {
    try {
      await findings.deleteFinding(dataModel.selection.map(selection => selection.key));
      closeModal();
      toaster.success('Findings deleted');
    } catch {
      toaster.error('Failed to delete findings');
    }
  }, [dataModel.selection]);

  const openDeleteFindingsModal = useCallback(
    () =>
      setModal(
        <DiscardModal
          title="Delete findings?"
          submitText="Delete"
          onSubmit={deleteFindings}
          onClose={closeModal}>
          This action will permanently delete these findings.
          <br />
          Are you sure?
        </DiscardModal>
      ),
    [setModal]
  );

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Settings - Manual Findings' }}>
      <Page title="Manual Findings">
        <Gutters>
          <FluidTableControls data-narrow={dataAttr(!filterOptions?.length)}>
            <TableSearch placeholder="Search by finding name..." />
            <TableControls.Actions>
              {application.isFeatureEnabled(FeatureFlag.UploadCSVReport) ? (
                <SelectMenu
                  appendTo="parent"
                  variant={Variant.PRIMARY}
                  placeholder="Add findings"
                  onClick={stopPropagation}
                  onItemClick={stopPropagation}>
                  <Dropdown.Item
                    disabled={!canWrite}
                    onClick={() =>
                      history.push(
                        isNewSettingsLayout
                          ? '/manual-findings/create'
                          : '/settings/manual-findings/create'
                      )
                    }>
                    <SvgIcon name="Edit" />
                    Create finding
                  </Dropdown.Item>

                  <Dropdown.Item disabled={!canWrite} onClick={handleOpenModal}>
                    <SvgIcon name="UploadFile" />
                    Upload report
                  </Dropdown.Item>
                </SelectMenu>
              ) : (
                <CreateFindingButton
                  disabled={!canWrite}
                  variant={Variant.PRIMARY}
                  onClick={() =>
                    history.push(
                      isNewSettingsLayout
                        ? '/manual-findings/create'
                        : '/settings/manual-findings/create'
                    )
                  }>
                  Create finding
                </CreateFindingButton>
              )}
            </TableControls.Actions>
            {Boolean(filterOptions?.length) && (
              <TableControls.Filters>
                <FiltersControls filterOptions={filterOptions} />
              </TableControls.Filters>
            )}
            <TableControls.Counter>
              <ResultsCounter
                count={dataModel.searchState.count}
                total={dataModel.searchState.total}
                itemName="findings"
              />
            </TableControls.Counter>
          </FluidTableControls>

          <TableConditionalActions shouldDisplay={dataModel.selection.length > 0}>
            <SelectedCount>{formatNumber(dataModel.selection.length)} Selected</SelectedCount>
            <Button variant={Variant.PRIMARY} onClick={openDeleteFindingsModal}>
              Delete findings
            </Button>
          </TableConditionalActions>

          <DataTable expandable dataModel={dataModel}>
            {item => <FindingRow key={item.key} data={item} />}
          </DataTable>

          {!dataModel.ignorePagination && dataModel.searchState.items.length > 0 && (
            <TablePagination searchState={dataModel.searchState} />
          )}
        </Gutters>
        {modalElement}
      </Page>
    </AnalyticsLayer>
  );
});

const CreateFindingButton = styled(Button)`
  width: fit-content;
`;

const DataTable = styled(_DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
`;

const FindingRow = ({ data, ...props }: { data: any }) => {
  const { pushPane } = usePaneState();

  const openPane = useCallback(() => {
    pushPane(<FindingPane findingDataModelReference={data.findingDataModelReference} />);
  }, [pushPane]);

  return <DataTable.Row {...props} data={data} onClick={openPane} />;
};
export const tableColumns: Column<ManualFindingResponse>[] = [
  {
    key: 'finding-severity',
    fieldName: 'Severity',
    label: 'Severity',
    width: '28rem',
    resizeable: false,
    sortable: true,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <RiskIcon riskLevel={data.severity} size={Size.XSMALL} />
      </Table.Cell>
    ),
  },
  {
    key: 'finding-name',
    label: 'Finding name',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.name}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'finding-status',
    label: 'Finding status',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.status}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'discovered-on',
    fieldName: 'Discovered',
    label: 'Discovered on',
    minWidth: '36rem',
    sortable: true,
    Cell: DiscoveryDateCell,
  },
  {
    key: 'component',
    label: 'Component',
    Cell: FindingComponentCell,
  },
  {
    key: 'report-name',
    label: 'Report name',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText>{data.reportName}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: FindingRowActionCell,
  },
];

export default ManualFindingsPage;
