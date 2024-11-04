import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Table } from '@src-v2/components/table/table';
import { FluidTableControls, TableControls } from '@src-v2/components/table/table-addons';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { TableCounter, TableSearch } from '@src-v2/containers/data-table/table-controls';
import { TablePagination } from '@src-v2/containers/data-table/table-pagination';
import { TemplatesTableColumns as tableColumns } from '@src-v2/containers/questionnaire/templates/templates-table-content';
import { useInject } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';

export const TemplatesList = observer(
  ({ navigation }: { navigation?: { key?: string; to: string; label: string }[] }) => {
    const history = useHistory();
    const { questionnaires } = useInject();

    const dataModel = useDataTable(questionnaires.getQuestionnaireTemplates, {
      // @ts-expect-error
      columns: tableColumns,
      searchParams: null,
    });

    return (
      <>
        <StickyHeader navigation={navigation}>
          <Button to="/questionnaire/template-editor" variant={Variant.SECONDARY}>
            Create template
          </Button>
          <Button to="/questionnaire/create-questionnaire">Create questionnaire</Button>
        </StickyHeader>
        <Gutters>
          <TemplateTableControls>
            {/* @ts-ignore*/}
            <TableControls.Filters>
              <TableSearch placeholder="Search..." />
            </TableControls.Filters>
            <TableControls.Counter>
              <TableCounter dataModel={dataModel} itemName="templates" />
            </TableControls.Counter>
          </TemplateTableControls>
          <TemplatesDataTable dataModel={dataModel}>
            {item => (
              <>
                <DataTable.Row
                  key={item.id}
                  data={item}
                  onClick={() =>
                    history.push(`/questionnaire/template-preview/${encodeURIComponent(item.id)}`)
                  }
                />
              </>
            )}
          </TemplatesDataTable>
          {dataModel.searchState.items.length > 0 && (
            <TablePagination searchState={dataModel.searchState} />
          )}
        </Gutters>
      </>
    );
  }
);

const TemplatesDataTable = styled(DataTable)`
  ${Table.Body} ${Table.Row} {
    height: 14rem;
  }

  ${Table.Cell}:last-child {
    padding-right: 2rem;
  }
` as typeof DataTable;

const TemplateTableControls = styled(FluidTableControls)`
  margin-top: 1rem;
`;
