import _ from 'lodash';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { IconButton } from '@src-v2/components/buttons';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Modal } from '@src-v2/components/modals';
import { ListItem, UnorderedList } from '@src-v2/components/typography';
import { useInject } from '@src-v2/hooks';
import { ChangedDataType, ConfirmationMultiBranchModalProps } from '@src-v2/types/multi-branch';
import { makeUrl } from '@src-v2/utils/history-utils';

export const ConfirmationMultiBranchModal = observer(
  ({ repositoryKey, repositoryName, changedData, onClose }: ConfirmationMultiBranchModalProps) => {
    const history = useHistory();
    const { state } = useLocation<{ lastPath?: string }>();
    const { connectors, analytics } = useInject();
    const { branchesToMonitor, branchesToUnmonitor, branchTags } = changedData;
    const handleSubmit = useCallback(async () => {
      await connectors.setMultiBranchChanges({ data: changedData, key: repositoryKey });
      analytics.track(`Multibranch update`, {
        previousPath: state?.lastPath,
        monitoredBranchesCount: branchesToMonitor.length,
        unmonitoredBranchesCount: branchesToUnmonitor.length,
      });
      history.push(
        makeUrl('/profiles/repositories', {
          fl: { searchTerm: repositoryName },
        })
      );
    }, [connectors, changedData, repositoryKey]);

    const { subtitle, title, submitText, isWarningSubmitColor, showReason } = useMemo(
      () => generateModalContent({ branchesToMonitor, branchesToUnmonitor, branchTags }),
      [branchesToMonitor, branchesToUnmonitor, branchTags]
    );

    const branchesList = useMemo(() => {
      const tags = Object.keys(branchTags);
      const tagChangeBranches = tags.filter(
        tag => !branchesToMonitor.includes(tag) && !branchesToUnmonitor.includes(tag)
      );

      return [
        ...branchesToMonitor.map(name => ({
          name,
          reason: ` (monitored${tags.includes(name) ? ', label updated' : ''})`,
        })),
        ...branchesToUnmonitor.map(name => ({
          name,
          reason: ` (unmonitored${tags.includes(name) ? ', label updated' : ''})`,
        })),
        ...tagChangeBranches.map(name => ({ name, reason: ' (label updated)' })),
      ];
    }, [branchesToMonitor, branchesToUnmonitor, branchTags]);

    return (
      <ModalContainer
        submitStatus={isWarningSubmitColor ? 'failure' : null}
        onSubmit={handleSubmit}
        onClose={onClose}
        title={title}
        submitText={submitText}>
        {subtitle}
        <UnorderedList>
          {branchesList?.map(branch => (
            <ListItem key={branch.name}>
              {branch.name}
              <Reason>{showReason && branch.reason}</Reason>
            </ListItem>
          ))}
        </UnorderedList>
      </ModalContainer>
    );
  }
);

const ModalContainer = styled(ConfirmationModal)`
  position: relative;
  width: 160rem;
  border-radius: 4rem;

  ${Modal.Header} {
    padding: 6rem 4rem 0 8rem;
    border: none;

    ${Modal.Title} {
      font-weight: 600;
    }

    ${IconButton} {
      width: 8rem;
      height: 8rem;
    }
  }

  ${Modal.Footer} {
    border: none;
  }

  ${UnorderedList} {
    list-style: disc;
    padding-left: 6rem;

    ${ListItem} {
      margin: 0;
    }
  }
`;

const Reason = styled.span`
  color: var(--color-blue-gray-60);
  font-size: var(--font-size-s);
`;

const generateModalContent = ({
  branchesToMonitor,
  branchesToUnmonitor,
  branchTags,
}: ChangedDataType) => {
  let subtitle = 'This action will modify the following branches:';
  let title = 'Confirm Changes?';
  let submitText = 'Confirm';
  let isWarningSubmitColor = false;
  let showReason = true;

  const isBranchesToMonitorEmpty = _.isEmpty(branchesToMonitor);
  const isBranchesToUnmonitorEmpty = _.isEmpty(branchesToUnmonitor);
  const isBranchesLabelChangeEmpty = _.isEmpty(branchTags);

  if (!isBranchesToMonitorEmpty && isBranchesToUnmonitorEmpty && isBranchesLabelChangeEmpty) {
    subtitle = 'This action will monitor the following branches:';
    title = 'Monitor Branches?';
    submitText = 'Monitor';
    showReason = false;
  } else if (
    isBranchesToMonitorEmpty &&
    !isBranchesToUnmonitorEmpty &&
    isBranchesLabelChangeEmpty
  ) {
    subtitle = 'This action will unmonitor the following branches:';
    title = 'Unmonitor Branches?';
    submitText = 'Unmonitor';
    isWarningSubmitColor = true;
    showReason = false;
  }

  return { subtitle, title, submitText, isWarningSubmitColor, showReason };
};
