import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useKillSwitchModal } from '@src-v2/containers/pages/general-settings/kill-switch-control/use-kill-switch-modal';
import { useInject } from '@src-v2/hooks';

const KillSwitchControl = () => {
  const { toaster, pullRequestScan, asyncCache } = useInject();

  const handleKillSwitchClick = async () => {
    try {
      await pullRequestScan.setKillSwitchConfiguration();
      asyncCache.invalidateAll(pullRequestScan.getKillSwitchConfiguration);
      toaster.success('Request to Azure DevOps succeeded');
    } catch (error) {
      console.error('Failed to update kill switch configuration:', error);
    }
  };

  const [showDeleteModal, deleteModalElement] = useKillSwitchModal({
    handleKillSwitchClick,
  });

  return (
    <>
      {deleteModalElement}
      <Button variant={Variant.SECONDARY} onClick={showDeleteModal}>
        Stop PR scans
      </Button>
    </>
  );
};

export const PullRequestKillSwitch = () => (
  <AsyncBoundary>
    <KillSwitchControl />
  </AsyncBoundary>
);
