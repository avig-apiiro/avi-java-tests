import { format } from 'date-fns';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { Table } from '@src-v2/components/table/table';
import { useDuplicateTemplateModal } from '@src-v2/containers/questionnaire/hooks/use-duplicate-template-modal';
import { TemplateSummary } from '@src-v2/types/queastionnaire/template';
import { stopPropagation } from '@src-v2/utils/dom-utils';

const { Cell, FlexCell } = Table as any;

export const ActionsMenuCell = styled(
  observer(({ data, ...props }: { data: TemplateSummary }) => {
    const history = useHistory();

    const [duplicateModalElement, onDuplicateClick] = useDuplicateTemplateModal(data);
    return (
      <FlexCell {...props}>
        <DropdownMenu onClick={stopPropagation} onItemClick={stopPropagation}>
          <Dropdown.Item onClick={() => history.push(`/questionnaire/template-editor/${data.id}`)}>
            Edit
          </Dropdown.Item>
          <Dropdown.Item onClick={onDuplicateClick}>Duplicate</Dropdown.Item>
        </DropdownMenu>
        {duplicateModalElement}
      </FlexCell>
    );
  })
)`
  justify-content: flex-end;
  padding: 0;

  ${(DropdownMenu as any).Button} {
    margin-right: 2rem;
  }
`;

export const TemplatesTableColumns = [
  {
    key: 'template-name',
    label: 'Template Name',
    resizeable: false,
    fieldName: 'QuestionnaireTemplateTitle',
    sortable: true,
    Cell: ({ data: { title }, ...props }: { data: TemplateSummary }) => {
      return <Cell {...props}>{title}</Cell>;
    },
  },
  {
    key: 'template-updated-time',
    label: 'Last Updated At',
    resizeable: false,
    fieldName: 'QuestionnaireTemplateUpdatedTime',
    sortable: true,
    Cell: ({ data: { updatedTime }, ...props }: { data: TemplateSummary }) => {
      return <Cell {...props}>{updatedTime && format(new Date(updatedTime), 'PP')}</Cell>;
    },
  },
  {
    key: 'actions-menu',
    label: '',
    width: '10rem',
    draggable: false,
    resizeable: false,
    Cell: ActionsMenuCell,
  },
];
