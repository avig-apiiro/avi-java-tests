import { useParams } from 'react-router-dom';
import { ConnectionSettings } from '@src-v2/containers/connectors/management/connection-settings';
import { JiraConnectionSettingsPage } from '@src-v2/containers/connectors/management/jira-connection-settings';
import { useInject, useSuspense } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';

export const ConnectionSettingsPageRouting = () => {
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const { connectors } = useInject();
  const connection = useSuspense(connectors.getConnection, { key: connectionUrl });

  switch (connection.providerGroup) {
    case Provider.Jira:
      return <JiraConnectionSettingsPage />;
    default:
      return <ConnectionSettings />;
  }
};
