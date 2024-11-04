import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Combobox, Input } from '@src-v2/components/forms';
import { Field } from '@src-v2/components/forms/modal-form-layout';
import { BulkActionModal } from '@src-v2/containers/modals/bulk-action-modal';
import { IssueContentEditor } from '@src-v2/containers/modals/issues/issue-content-editor';
import { IssueDestinationControl } from '@src-v2/containers/modals/issues/issue-destination-control';
import { IssuePreview } from '@src-v2/containers/modals/issues/issue-preview';
import { useProviderModalSettings } from '@src-v2/containers/modals/issues/providers-issue-modals';
import { bulkActionModes } from '@src-v2/data/actions-data';
import { createIssueSummary } from '@src-v2/data/ticketing-issues-provider';
import { useInject } from '@src-v2/hooks';

export const CreateBulkIssueModal = observer(
  ({ provider, dataModel, defaultLimit = 20, ...props }) => {
    const { ticketingIssues } = useInject();
    const { summaryFieldKey } = useProviderModalSettings(provider);
    const isDisabled = dataModel.selection.length > defaultLimit;

    const handleAggregated = useCallback(
      issue =>
        ticketingIssues.createAggregatedIssue({
          issue,
          items: dataModel.selection,
        }),
      [dataModel?.selection]
    );

    const handleSeparate = useCallback(
      issue =>
        ticketingIssues.createSeparateIssues({
          issue,
          items: dataModel.selection,
        }),
      [dataModel?.selection]
    );

    const [firstRisk, ...excessive] = dataModel.selection;

    return (
      <Modal
        {...props}
        dataModel={dataModel}
        provider={provider}
        overLimit={isDisabled}
        defaultValues={{
          provider,
          [summaryFieldKey]: `${createIssueSummary(firstRisk)}${
            excessive?.length ? ` + ${excessive.length} more` : ''
          }`,
          actionMode: isDisabled ? bulkActionModes.SEPARATE : bulkActionModes.AGGREGATED,
        }}
        itemPreview={({ item }) => (
          <IssuePreview provider={provider} riskData={item} summary={createIssueSummary(item)} />
        )}
        onAggregatedSubmitted={handleAggregated}
        onSeparateSubmitted={handleSeparate}>
        <AsyncBoundary>
          <IssueDestinationControl provider={provider} />
        </AsyncBoundary>

        <AsyncBoundary>
          <BulkContentEditor provider={provider} />
        </AsyncBoundary>
      </Modal>
    );
  }
);

const BulkContentEditor = ({ provider }) => {
  const { watch } = useFormContext();
  const actionMode = watch('actionMode');

  return (
    <IssueContentEditor
      provider={provider}
      hideSummaryInput={actionMode === bulkActionModes.SEPARATE}
    />
  );
};

const Modal = styled(BulkActionModal)`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${Field},
  ${Input} {
    margin: 0;
    font-size: var(--font-size-s);
    font-weight: 400;
  }

  ${Combobox} {
    width: 100%;
  }
`;
