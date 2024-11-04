import styled from 'styled-components';
import { ErrorLayout } from '@src-v2/components/layout';
import { ConnectionRow } from '@src-v2/containers/connectors/management/connection-row';
import { Connection } from '@src-v2/types/connector/connectors';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';
import { ProviderType } from '@src-v2/types/providers/provider-type';

export const ConnectionRows = ({
  currentProviderGroupByKey,
  defaultProviderType,
}: {
  currentProviderGroupByKey: ProviderGroup;
  defaultProviderType: ProviderType;
}) => (
  <OptionsList>
    {currentProviderGroupByKey?.servers?.length > 0 ? (
      currentProviderGroupByKey.servers.map((server: Connection) => (
        <ConnectionRow
          key={server.url}
          providerRouteUrl={defaultProviderType.providerRouteUrl}
          providerKey={defaultProviderType.key}
          server={server}
          manageable={defaultProviderType.manageable}
          disabled={!defaultProviderType.editable}
          monitorEnabled={defaultProviderType.monitorEnabled}
          isSingleConnection
        />
      ))
    ) : (
      <ErrorLayout.NoResults />
    )}
  </OptionsList>
);

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 5rem;
`;
