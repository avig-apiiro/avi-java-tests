import { useCallback } from 'react';
import styled from 'styled-components';
import { CheckboxControl } from '@src-v2/components/forms/form-controls';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { ConnectorsModal } from '@src-v2/containers/connectors/connectors-elements';
import { MonitorErrorToast } from '@src-v2/containers/connectors/management/monitor-error-toast';
import { EffectsType } from '@src-v2/containers/connectors/use-connection-menu-modal';
import { useInject } from '@src-v2/hooks';
import { Connection } from '@src-v2/types/connector/connectors';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function MonitorConnectionModal({
  server,
  effects,
  shouldMonitor,
  onClose,
  ...props
}: {
  server: Connection;
  effects: EffectsType;
  shouldMonitor: boolean;
  onClose: () => void;
}) {
  const { connectors, toaster } = useInject();
  const hasEffect = Object.values(effects).some(Boolean);

  const handleConfirm = useCallback(
    async ({ ignoredIncluded }) => {
      const response = await connectors.setServerMonitorAll({
        serverUrl: server.url,
        ignoredIncluded,
        shouldMonitor,
      });

      if (shouldMonitor && response?.irrelevantRepositoriesByStatus?.length) {
        toaster.error(<MonitorErrorToast {...response} />);
      } else {
        onClose?.();
      }
    },
    [server, shouldMonitor, onClose]
  );

  return (
    <ConnectorsModal
      {...props}
      title={`Monitor ${shouldMonitor ? 'All' : 'None'}`}
      onSubmit={handleConfirm}
      onClose={onClose}>
      <Heading>
        {hasEffect ? 'This operation will affect:' : 'This operation will have no effects'}
      </Heading>

      {hasEffect && (
        <Effects>
          {effects.affectedRepositoriesCount > 0 && (
            <Paragraph>
              {pluralFormat(effects.affectedRepositoriesCount, 'repository', 'repositories', true)}
            </Paragraph>
          )}

          {effects.affectedProjectsCount > 0 && (
            <Paragraph>
              {pluralFormat(effects.affectedProjectsCount, 'project', 'projects', true)}
            </Paragraph>
          )}

          {effects.affectedIgnoredRepositoriesCount > 0 && (
            <Label>
              <CheckboxControl name="ignoredIncluded" />
              Include {effects.affectedIgnoredRepositoriesCount} ignored{' '}
              {pluralFormat(effects.affectedIgnoredRepositoriesCount, 'repository', 'repositories')}
            </Label>
          )}
        </Effects>
      )}
    </ConnectorsModal>
  );
}

const Effects = styled.div`
  ${Paragraph} {
    text-indent: 6rem;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 2rem;
`;
