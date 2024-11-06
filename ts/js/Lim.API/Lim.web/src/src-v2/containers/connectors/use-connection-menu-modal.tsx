import { useMemo } from 'react';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { getRepositoryBannerText } from '@src-v2/components/marketing/marketing-utils';
import { UpgradeRequestModal } from '@src-v2/components/marketing/upgrade-request-modal';
import { ExternalLink } from '@src-v2/components/typography';
import { DeleteConnectionModal } from '@src-v2/containers/connectors/management/delete-connection-modal';
import { MonitorConnectionModal } from '@src-v2/containers/connectors/management/monitor-connection-modal';
import { ServerModal } from '@src-v2/containers/connectors/server-modal/server-modal';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

export type EffectsType = {
  definitionsCount?: number;
  governanceRulesCount?: number;
  monitoredProjectsCount?: number;
  monitoredRepositoriesCount?: number;
  projectsCount?: number;
  repositoriesCount?: number;
  workflowsCount?: number;
  affectedProjectsCount?: number;
  affectedIgnoredRepositoriesCount?: number;
  affectedRepositoriesCount?: number;
};

interface ModalActionHandlers {
  handleEdit: () => void;
  handleDelete: () => void;
  handleUploadPrivateKey: (files: File[]) => void;
  handleGithubAppInstall: () => Promise<void>;
  handleBitbucketCloudAppInstall: () => Promise<void>;
  handleJiraCloudAppInstall: () => Promise<void>;
  handleMonitorAll: () => void;
  handleMonitorNone: () => void;
  handleAutoMonitorToggle: () => void;
}

interface ModalControlObject extends ModalActionHandlers {
  shouldLimit: boolean;
  serverProviderGroup?: any;
}

type UseConnectionMenuModalsReturn = [JSX.Element | null, ModalControlObject];

export const useConnectionMenuModals = (
  server: Connection,
  providerGroups: ProviderGroup[]
): UseConnectionMenuModalsReturn => {
  const [modalElement, setModal, closeModal] = useModalState();
  const {
    github,
    connectors,
    subscription: { limitations },
    bitbucketCloud,
    jiraCloud,
  } = useInject();
  return [
    modalElement,
    useMemo(() => {
      const shouldLimit = limitations.limitMultiMonitorOptions;
      const serverProviderGroup = providerGroups.find(group => group.key === server.providerGroup);
      return {
        shouldLimit,
        serverProviderGroup,

        handleEdit: () => {
          setModal(
            <ServerModal
              server={server}
              providerGroup={serverProviderGroup}
              onClose={closeModal}
              isEditMode
            />
          );
        },
        handleDelete() {
          connectors
            .getDeleteConnectionEffects({ serverUrl: server.url })
            .then((effects: EffectsType) =>
              setModal(
                <DeleteConnectionModal server={server} effects={effects} onClose={closeModal} />
              )
            );
        },

        handleUploadPrivateKey([file]) {
          file && connectors.setServerPrivateKey({ serverUrl: server.url, file });
        },
        async handleGithubAppInstall() {
          const isEnterprise = server.provider === 'GithubEnterprise';

          if (isEnterprise) {
            const appExists = await github.enterpriseAppExists(server.url);
            if (!appExists) {
              setModal(
                <ConfirmationModal
                  title="GitHub App Doesn't Exist"
                  onClose={closeModal}
                  submitText="Continue Anyway"
                  onSubmit={() => github.installGithubApp(server.url, isEnterprise)}>
                  We could not detect an Apiiro App on your GitHub enterprise server.
                  <br />
                  Please follow{' '}
                  <ExternalLink href="https://docs.apiiro.com/for/githubApp">
                    this guide
                  </ExternalLink>{' '}
                  and make sure the Apiiro App exists.
                </ConfirmationModal>
              );
              return;
            }
          }

          await github.installGithubApp(server.url, isEnterprise);
        },

        async handleBitbucketCloudAppInstall() {
          await bitbucketCloud.installApp(server.url);
        },

        async handleJiraCloudAppInstall() {
          await jiraCloud.installApp(server.url);
        },

        handleMonitorAll() {
          if (shouldLimit) {
            setModal(
              <UpgradeRequestModal
                title="Upgrade to monitor all of your repositories"
                description={getRepositoryBannerText(limitations)}
                onClose={closeModal}
              />
            );
          } else {
            connectors
              .getMonitorAllEffects({ serverUrl: server.url, shouldMonitor: true })
              .then(effects =>
                setModal(
                  <MonitorConnectionModal
                    server={server}
                    effects={effects}
                    shouldMonitor={true}
                    onClose={closeModal}
                  />
                )
              );
          }
        },
        handleMonitorNone() {
          connectors
            .getMonitorAllEffects({ serverUrl: server.url, shouldMonitor: false })
            .then(effects =>
              setModal(
                <MonitorConnectionModal
                  server={server}
                  effects={effects}
                  shouldMonitor={false}
                  onClose={closeModal}
                />
              )
            );
        },
        handleAutoMonitorToggle() {
          shouldLimit
            ? setModal(
                <UpgradeRequestModal
                  title="Upgrade to automatically monitor new repositories"
                  description={getRepositoryBannerText(limitations)}
                  onClose={closeModal}
                />
              )
            : connectors.setServerMonitorNew({
                serverUrl: server.url,
                shouldMonitor: !server.monitorNew,
              });
        },
      };
    }, [server, limitations, providerGroups, setModal, closeModal]),
  ];
};
