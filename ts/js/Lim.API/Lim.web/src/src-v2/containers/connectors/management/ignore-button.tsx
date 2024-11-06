import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { IconButton } from '@src-v2/components/buttons';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { DateTime } from '@src-v2/components/time';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Paragraph, Strong } from '@src-v2/components/typography';
import { IgnoreRepositoryForm } from '@src-v2/containers/connectors/management/ignore-repository-form';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { modify } from '@src-v2/utils/mobx-utils';

export const IgnoreButton = observer(({ data }) => {
  const { connectors } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();

  const handleClick = useCallback(() => {
    setModal(
      data.isIgnored ? (
        <ConfirmationModal
          title="Un-ignore Repository"
          submitStatus={!data.isIgnored ? 'failure' : 'primary'}
          submitText="Un-ignore"
          onSubmit={handleIgnoreSubmit}
          onClose={closeModal}>
          <Paragraph>
            This repository was ignored <IgnoreDetails data={data} />
          </Paragraph>
          {data.ignoreReason && <Paragraph>Reason: "{data.ignoreReason}"</Paragraph>}
          <Paragraph>Are you sure you want to un-ignore the repository?</Paragraph>
        </ConfirmationModal>
      ) : (
        <ConfirmationModal
          submitStatus={!data.isIgnored ? 'failure' : 'primary'}
          submitText="Ignore"
          onSubmit={handleIgnoreSubmit}
          onClose={closeModal}>
          <IgnoreRepositoryForm repository={data} />
        </ConfirmationModal>
      )
    );

    function handleIgnoreSubmit({ ignoreReason }) {
      const { isMonitored } = data;
      const shouldIgnore = !data.isIgnored;
      modify(data, {
        isIgnored: shouldIgnore,
        isMonitored: shouldIgnore ? false : isMonitored,
        ignoreReason,
      });
      connectors
        .toggleIgnoredProviderRepository({
          key: data.key,
          shouldIgnore,
          ignoreReason,
        })
        .catch(() => modify(data, { isIgnored: !shouldIgnore, isMonitored }));
      closeModal();
    }
  }, [data, setModal, closeModal]);

  return (
    <>
      <Tooltip
        content={
          data.isIgnored ? (
            <>
              <Paragraph>
                Ignored <IgnoreDetails data={data} />
              </Paragraph>
              {data.ignoreReason && <Paragraph>Reason: "{data.ignoreReason}"</Paragraph>}
              <Paragraph>Click to Un-ignore</Paragraph>
            </>
          ) : (
            'Click to Ignore'
          )
        }>
        <span>
          <IconButton name={data.isIgnored ? 'Invisible' : 'Visible'} onClick={handleClick} />
        </span>
      </Tooltip>
      {modalElement}
    </>
  );
});

function IgnoreDetails({ data }) {
  return (
    <>
      {data.ignoredBy && (
        <>
          {' '}
          by <Strong>{data.ignoredBy}</Strong>
        </>
      )}
      {data.lastMonitoringChangeTimestamp && (
        <>
          {' '}
          on <DateTime date={data.lastMonitoringChangeTimestamp} format="MMM dd, yyyy" />
        </>
      )}
    </>
  );
}
