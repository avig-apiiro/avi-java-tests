import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Heading, ListItem, UnorderedList } from '@src-v2/components/typography';
import { ConnectorsModal } from '@src-v2/containers/connectors/connectors-elements';
import { EffectsType } from '@src-v2/containers/connectors/use-connection-menu-modal';
import { useInject } from '@src-v2/hooks';
import { Connection } from '@src-v2/types/connector/connectors';
import { pluralFormat } from '@src-v2/utils/number-utils';

export function DeleteConnectionModal({
  server,
  effects,
  ...props
}: {
  server: Connection;
  effects: EffectsType;
  onClose: () => void;
}) {
  const history = useHistory();
  const { connectors, toaster } = useInject();
  const hasEffects = Object.values(effects).flat().some(Boolean);

  const handleDelete = useCallback(async () => {
    try {
      await connectors.deleteServer(server.url);
      toaster.success('Connection removed successfully');
      history.push('/connectors/connect');
    } catch (_) {
      toaster.error('Failed to delete connection');
    }
  }, [server.url]);

  return (
    <ConnectorsModal
      {...props}
      title="Remove connector?"
      onSubmit={handleDelete}
      submitStatus="failure"
      submitText="Remove">
      {hasEffects ? (
        <>
          <Heading>
            Removing {server.url} from Apiiro will also remove the following assets from Apiiro:
          </Heading>
          <DeleteConnectionUnorderedList>
            {[
              {
                key: 'repositoriesCount',
                monitoredKey: 'monitoredRepositoriesCount',
                single: 'repository',
                plural: 'repositories',
              },
              { key: 'projectsCount', monitoredKey: 'monitoredProjectsCount', single: 'project' },
              { key: 'governanceRulesCount', single: 'governance rule' },
              { key: 'definitionsCount', single: 'definition' },
              { key: 'workflowsCount', single: 'workflow' },
            ].map(
              ({ key, single, plural, monitoredKey }) =>
                effects[key] > 0 && (
                  <DeleteConnectionListItem key={key}>
                    {pluralFormat(effects[key], single, plural, true)}
                    {/* @ts-ignore */}
                    {Object.hasOwn(effects, monitoredKey) &&
                      ` (${effects[monitoredKey]} monitored)`}
                  </DeleteConnectionListItem>
                )
            )}
          </DeleteConnectionUnorderedList>
          <br />
          Are you sure?
        </>
      ) : (
        <Heading>Are you sure you want to remove {server.url}?</Heading>
      )}
    </ConnectorsModal>
  );
}

const DeleteConnectionUnorderedList = styled(UnorderedList)`
  font-weight: 400;
  font-size: 4rem;
  color: var(--color-blue-gray-70);
  padding: 0 7rem;
`;

const DeleteConnectionListItem = styled(ListItem)`
  list-style: initial;
`;
