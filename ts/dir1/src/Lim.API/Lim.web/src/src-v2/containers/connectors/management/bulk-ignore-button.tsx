import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { Button } from '@src-v2/components/button-v2';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Paragraph } from '@src-v2/components/typography';
import { IgnoreRepositoryForm } from '@src-v2/containers/connectors/management/ignore-repository-form';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const BulkIgnoreButton = observer(({ data, onSubmit, searchState }) => {
  const [modalElement, setModal, closeModal] = useModalState();
  const isAllIgnored = data.every(item => item.isIgnored);

  const handleClick = useCallback(() => {
    setModal(
      isAllIgnored ? (
        <ConfirmationModal
          title="Un-ignore Repositories"
          submitStatus={!data.isIgnored ? 'failure' : null}
          submitText="Un-ignore"
          onSubmit={handleBulkIgnoreSubmit}
          onClose={closeModal}>
          {data.ignoreReason && <Paragraph>Reason: "{data.ignoreReason}"</Paragraph>}
          <Paragraph>Are you sure you want to un-ignore the repository?</Paragraph>
        </ConfirmationModal>
      ) : (
        <ConfirmationModal
          submitStatus={!data.isIgnored ? 'failure' : 'primary'}
          submitText="Ignore"
          onSubmit={handleBulkIgnoreSubmit}
          onClose={closeModal}>
          <IgnoreRepositoryForm isBulkAction />
        </ConfirmationModal>
      )
    );

    function handleBulkIgnoreSubmit({ ignoreReason }) {
      onSubmit({ ignoreReason, isAllIgnored });
      closeModal();
    }
  }, [data, setModal, closeModal, isAllIgnored]);

  return (
    <>
      <Tooltip
        content={isAllIgnored ? 'Un-Ignore Selected Repositories' : 'Ignore Selected Repositories'}>
        <span>
          <Button variant={Variant.SECONDARY} loading={searchState.loading} onClick={handleClick}>
            {isAllIgnored ? 'Un-Ignore' : 'Ignore'}
          </Button>
        </span>
      </Tooltip>
      {modalElement}
    </>
  );
});
