import styled from 'styled-components';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { AsyncBoundary, DefaultPendingFallback } from '@src-v2/components/async-boundary';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { FileInput } from '@src-v2/components/forms/file-input';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useConnectionMenuModals } from '@src-v2/containers/connectors/use-connection-menu-modal';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense, useToggle } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { dataAttr, preventDefault, stopPropagation } from '@src-v2/utils/dom-utils';

export const ConnectionManageDropdown = ({ server, monitorEnabled, disabled }) => {
  const { connectors, application, rbac } = useInject();
  const providerGroups = useSuspense(connectors.getProviderGroups);
  const [, toggleSelected] = useToggle();
  const canEdit = rbac.canEdit(resourceTypes.Connectors);

  const [
    modalElement,
    {
      shouldLimit,
      serverProviderGroup,
      handleEdit,
      handleDelete,
      handleMonitorAll,
      handleMonitorNone,
      handleUploadPrivateKey,
      handleGithubAppInstall,
      handleBitbucketCloudAppInstall,
      handleJiraCloudAppInstall,
    },
  ] = useConnectionMenuModals(server, providerGroups);

  return (
    <>
      <Tooltip
        content="You don’t have the relevant permissions for this action. Contact your Apiiro admin for more information"
        disabled={canEdit}>
        <DropdownMenu
          size={Size.MEDIUM}
          disabled={!canEdit}
          onShow={toggleSelected}
          onHide={toggleSelected}
          onItemClick={stopPropagation}
          onClick={preventDefault}>
          {monitorEnabled && server.provider !== 'Perforce' && (
            <>
              <Dropdown.Item data-limit={dataAttr(shouldLimit)} onClick={handleMonitorAll}>
                Monitor All
              </Dropdown.Item>
              <Dropdown.Item onClick={handleMonitorNone}>Monitor None</Dropdown.Item>
            </>
          )}
          {canEdit && !disabled && <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>}
          {canEdit && <Dropdown.Item onClick={handleDelete}>Remove</Dropdown.Item>}
          {serverProviderGroup.supportsPrivateKey && (
            <Dropdown.Item>
              <FileInput onSelect={handleUploadPrivateKey}>
                {server.hasPrivateKey ? 'Re-upload' : 'Upload'} ssh Private Key
              </FileInput>
            </Dropdown.Item>
          )}
          {(server.provider === 'Github' || server.provider === 'GithubEnterprise') && (
            <Dropdown.Item onClick={handleGithubAppInstall}>Install GitHub App</Dropdown.Item>
          )}
          {server.provider === 'BitbucketCloud' &&
            application.isFeatureEnabled(FeatureFlag.InstallBitbucketCloudApplication) && (
              <Dropdown.Item onClick={handleBitbucketCloudAppInstall}>
                Install Bitbucket App
              </Dropdown.Item>
            )}
          {server.provider === 'Jira' &&
            application.isFeatureEnabled(FeatureFlag.Jira2WayIntegration) && (
              <Dropdown.Item onClick={handleJiraCloudAppInstall}>Install Jira App</Dropdown.Item>
            )}
        </DropdownMenu>
      </Tooltip>
      <AsyncBoundary pendingFallback={<PendingFallback />}>{modalElement}</AsyncBoundary>
    </>
  );
};

const PendingFallback = styled(DefaultPendingFallback)`
  flex-grow: 0;

  ${LogoSpinner} {
    height: 5rem;
  }
`;
