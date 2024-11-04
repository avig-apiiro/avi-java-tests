import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { ClampText } from '@src-v2/components/clamp-text';
import { HeadingWithDivider } from '@src-v2/components/divider';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { SvgIcon } from '@src-v2/components/icons';
import { SimpleTableCounter } from '@src-v2/components/simple-table';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { TextLink } from '@src-v2/components/typography';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableSearch } from '@src-v2/containers/data-table/table-controls';
import { useDeleteCustomReportModal } from '@src-v2/containers/pages/reporting/hooks/use-confirm-delete-modal';
import { useInject, useSuspense } from '@src-v2/hooks';
import { alphabeticalSorter, dateSorter } from '@src-v2/hooks/sorters';
import { useClientDataTable } from '@src-v2/hooks/use-client-data-table';
import { useShareLinkModal } from '@src-v2/hooks/use-share-link-modal';
import { formatDate } from '@src-v2/utils/datetime-utils';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const CustomReportsTable = styled(
  observer(props => {
    const { reporting, asyncCache } = useInject();
    const reportsData = useSuspense(reporting.getCustomReports);
    const history = useHistory();

    const dataModel = useClientDataTable(
      reportsData,
      {
        key: 'customReports',
        columns: tableColumns,
      },
      filterItemFunction
    );

    return (
      <div {...props}>
        <FluidTableControls>
          <TableSearch placeholder="Search by report name..." />
          <TableControls.Actions>
            <SimpleTableCounter
              itemName="report"
              count={dataModel.searchState.count}
              total={dataModel.searchState.total}
            />
            <Button
              variant={Variant.PRIMARY}
              endIcon="Arrow"
              onClick={() => {
                asyncCache.invalidateAll(reporting.getCustomReports);
                history.push(`/reporting/myOrgReports`);
              }}>
              Reports workspace
            </Button>
          </TableControls.Actions>
          <TableControls.Filters />
        </FluidTableControls>
        <DataTable dataModel={dataModel}>
          {item => (
            <DataTable.Row
              onClick={() => {
                asyncCache.invalidateAll(reporting.getCustomReports);
                asyncCache.invalidateAll(reporting.getDashboardById);
                history.push(
                  `/reporting/custom-report/${item.id}-${encodeReportingLinkComponent(item.name)}`
                );
              }}
              key={item.key}
              data={item}
            />
          )}
        </DataTable>
      </div>
    );
  })
)`
  padding: 0 10rem;

  ${HeadingWithDivider} {
    padding: 0;
    max-width: 100%;
  }

  ${TableControls} {
    margin-bottom: 0;
  }
`;

const ActionsMenuCell = styled(({ data, ...props }) => {
  const history = useHistory();
  const { reporting, toaster, asyncCache } = useInject();

  const handleEditReport = useCallback(() => {
    asyncCache.invalidateAll(reporting.getCustomReports);
    asyncCache.invalidateAll(reporting.getDashboardById);
    history.push(
      `/reporting/custom-report/${data.id}-${encodeReportingLinkComponent(data.name)}/edit`
    );
  }, [history, data]);

  const handleDeleteReport = useCallback(async () => {
    try {
      await reporting.deleteDashboardById(data.id);
      toaster.success('Dashboard deleted successfully!');
    } catch {
      toaster.error('Failed deleting dashboard');
    }
  }, [reporting, data]);

  const handleShareReport = useCallback(() => {
    showShareModal(
      `${window.location.href}/custom-report/${data.id}-${encodeReportingLinkComponent(data.name)}/edit`
    );
  }, [reporting, data]);

  const [showDeleteModal, deleteModalElement] = useDeleteCustomReportModal({ handleDeleteReport });
  const { showShareModal, shareLinkModalElement } = useShareLinkModal();

  return (
    <Table.FlexCell {...props} data-action-menu>
      {deleteModalElement}
      {shareLinkModalElement}
      <DropdownMenu
        {...props}
        onClick={stopPropagation}
        onItemClick={stopPropagation}
        size={Size.LARGE}>
        <Dropdown.Item onClick={handleEditReport}>
          <SvgIcon size={Size.SMALL} name="Edit" />
          Edit report
        </Dropdown.Item>
        <Dropdown.Item onClick={showDeleteModal}>
          <SvgIcon size={Size.SMALL} name="Trash" />
          Delete
        </Dropdown.Item>
        <Dropdown.Item onClick={handleShareReport}>
          <SvgIcon size={Size.SMALL} name="Share" />
          Share link
        </Dropdown.Item>
      </DropdownMenu>
    </Table.FlexCell>
  );
})`
  justify-content: center;
  padding: 0;
`;

export const tableColumns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    customSorter: alphabeticalSorter,
    Cell: styled(({ data, ...props }) => (
      <Table.FlexCell {...props}>
        <SvgIcon size={Size.XSMALL} name="Reports" />
        <ClampText>{data.name}</ClampText>
        {data.description && <InfoTooltip content={data.description} />}
      </Table.FlexCell>
    ))`
      ${TextLink} {
        display: flex;
        gap: 2rem;
      }
    `,
  },
  {
    key: 'created_at',
    label: 'Created at',
    maxWidth: '10rem',
    sortable: true,
    customSorter: dateSorter,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText lines={2}>{formatDate(data.created_at, 'daily')}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'updated_at',
    label: 'Last edited',
    maxWidth: '10rem',
    sortable: true,
    customSorter: dateSorter,
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <ClampText lines={2}>{formatDate(data.updated_at, 'daily')}</ClampText>
      </Table.Cell>
    ),
  },
  {
    key: 'collection',
    label: 'Collection',
    width: '10rem',
    Cell: ({ data, ...props }) => {
      const { reporting } = useInject();
      const collection = useSuspense(reporting.getCollectionById, {
        collectionId: data.collection_id,
      });

      return (
        <Table.Cell {...props}>
          <ClampText lines={2}>{collection.name}</ClampText>
        </Table.Cell>
      );
    },
  },
  {
    key: 'actions-menu',
    width: '10rem',
    Cell: ActionsMenuCell,
  },
];

function encodeReportingLinkComponent(url) {
  return url.replace(/[!@#$%^&* ()./';]+/g, '');
}

const filterItemFunction = (item, { searchTerm }) =>
  !searchTerm || [item.name].some(text => text.toLowerCase().includes(searchTerm.toLowerCase()));
