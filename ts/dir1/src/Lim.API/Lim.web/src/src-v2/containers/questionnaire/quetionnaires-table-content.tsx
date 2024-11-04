import { format } from 'date-fns';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { BaseIcon, VendorIcon } from '@src-v2/components/icons';
import { Table } from '@src-v2/components/table/table';
import { ExternalLink, Paragraph } from '@src-v2/components/typography';
import { ProgressIndicator } from '@src-v2/containers/questionnaire/common-components';
import { QuestionnaireActionsMenu } from '@src-v2/containers/questionnaire/questionnaire-actions';
import { Status } from '@src-v2/types/queastionnaire/questionnaire-response';
import { QuestionnaireSummary } from '@src-v2/types/queastionnaire/questionnaire-summary';
import { stopPropagation } from '@src-v2/utils/dom-utils';
import { toPercent } from '@src-v2/utils/number-utils';
import { humanize } from '@src-v2/utils/string-utils';

const { FlexCell } = Table as any;

const ProgressIndicatorContainer = styled.span`
  display: inherit;
`;

const StatusCell = ({
  data: {
    currentState: { status, percentCompleted },
  },
}: {
  data: QuestionnaireSummary;
}) => (
  <FlexCell>
    <ProgressIndicatorContainer>
      <ProgressIndicator status={status} />
      {`${humanize(status)} ${
        status === Status.InProgress ? `(${toPercent(percentCompleted, 0)})` : ''
      }`}
    </ProgressIndicatorContainer>
  </FlexCell>
);

export const ActionsMenuCell = styled(
  observer(({ data, ...props }: { data: QuestionnaireSummary }) => {
    return (
      <FlexCell {...props}>
        <QuestionnaireActionsMenu summary={data} />
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

const { Cell } = Table as any;
export const tableColumns = [
  {
    key: 'response-name',
    label: 'Trigger',
    resizeable: false,
    fieldName: 'QuestionnaireTitle',
    sortable: true,
    Cell: styled(
      ({ data: { title, triggeringIssue }, ...props }: { data: QuestionnaireSummary }) => {
        return (
          <Cell {...props}>
            {triggeringIssue && (
              <IssueLink>
                <VendorIcon name={triggeringIssue.provider} />
                <ExternalLink href={triggeringIssue.externalUrl} onClick={stopPropagation}>
                  {triggeringIssue.id}
                </ExternalLink>
              </IssueLink>
            )}
            <Paragraph>{title}</Paragraph>
          </Cell>
        );
      }
    )`
      padding: 2rem;

      ${ExternalLink} {
        font-size: var(--font-size-xs);
      }
    `,
  },
  {
    key: 'template-name',
    label: 'Template name',
    resizeable: false,
    Cell: ({ data: { templateName }, ...props }: { data: QuestionnaireSummary }) => (
      <Cell {...props}>{templateName}</Cell>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    resizeable: false,
    Cell: StatusCell,
  },
  {
    key: 'score',
    label: 'Risk score',
    sortable: true,
    fieldName: 'QuestionnaireScore',
    resizeable: false,
    Cell: ({
      data: {
        currentState: { score },
      },
      ...props
    }: {
      data: QuestionnaireSummary;
    }) => <Cell {...props}>{score}</Cell>,
  },
  {
    key: 'updated-time',
    label: 'Last Updated At',
    sortable: true,
    fieldName: 'QuestionnaireUpdatedTime',
    resizeable: false,
    Cell: ({ data: { updatedTime }, ...props }: { data: QuestionnaireSummary }) => (
      <Cell {...props}>{updatedTime && format(new Date(updatedTime), 'PP')}</Cell>
    ),
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

const IssueLink = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  ${BaseIcon} {
    width: 4rem;
    height: 4rem;
  }
`;
