import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { FiltersControls } from '@src-v2/components/filters/inline-control/containers/filters-controls';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { tableColumns } from '@src-v2/containers/questionnaire/quetionnaires-table-content';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { Filter } from '@src-v2/hooks/use-filters';
import { StubAny } from '@src-v2/types/stub-any';

export const QuestionnairesList = observer(({ navigation }: { navigation: StubAny }) => {
  const history = useHistory();
  const { questionnaires, rbac } = useInject();
  const filterOptions = useSuspense(questionnaires.getFilterOptions, { path: '' });
  const dataModel = useDataTable(questionnaires.getQuestionnaireResponses, {
    columns: tableColumns,
    searchParams: null,
  });

  const hasGovernancePermission = rbac.canEdit(resourceTypes.Governance);

  return (
    <>
      <StickyHeader navigation={navigation}>
        <Tooltip
          content="Contact your admin to create a template"
          disabled={hasGovernancePermission}>
          <Button
            to="/questionnaire/template-editor"
            variant={Variant.SECONDARY}
            size={Size.LARGE}
            disabled={!hasGovernancePermission}>
            Create template
          </Button>
        </Tooltip>
        <Tooltip
          content="Contact your admin to create a questionnaire"
          disabled={hasGovernancePermission}>
          <Button
            to="/questionnaire/create-questionnaire"
            size={Size.LARGE}
            disabled={!hasGovernancePermission}>
            Create questionnaire
          </Button>
        </Tooltip>
      </StickyHeader>
      <Gutters>
        <FluidTableControls>
          <TableSearch placeholder="Search..." />
          <TableControls.Filters>
            <FiltersControls filterOptions={filterOptions as Filter[]} />
          </TableControls.Filters>
          <TableControls.Counter>
            <TableCounter dataModel={dataModel} itemName="questionnaires" />
          </TableControls.Counter>
        </FluidTableControls>
        <QuestionnaireDataTable dataModel={dataModel}>
          {item => (
            <>
              {/* @ts-ignore*/}
              <DataTable.Row
                key={item.id}
                data={item}
                onClick={() =>
                  history.push(
                    `/questionnaire/${item.id}?accessKey=${encodeURIComponent(
                      item.accessKey
                    )}&admin=true`
                  )
                }
              />
            </>
          )}
        </QuestionnaireDataTable>
        {dataModel.searchState.items.length > 0 && (
          <TablePagination searchState={dataModel.searchState} />
        )}
      </Gutters>
    </>
  );
});

const QuestionnaireDataTable = styled(DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
` as typeof DataTable;
