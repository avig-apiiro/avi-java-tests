import { differenceInHours } from 'date-fns';
import { observer } from 'mobx-react';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Counter } from '@src-v2/components/counter';
import { Combobox, InputV2 } from '@src-v2/components/forms';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { Select } from '@src-v2/components/forms/select';
import { SvgIcon, VendorIcon } from '@src-v2/components/icons';
import { Modal } from '@src-v2/components/modals';
import { Table } from '@src-v2/components/table/table';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { EllipsisText, ExternalLink } from '@src-v2/components/typography';
import { DropdownItemWithVendorIcon } from '@src-v2/containers/applications/multi-assets-collection';
import { ConnectionsTable } from '@src-v2/containers/connectors/connections-table';
import { ConnectionStatus } from '@src-v2/containers/connectors/management/connection-row';
import { ServerModal } from '@src-v2/containers/connectors/server-modal/server-modal';
import { DataTable } from '@src-v2/containers/data-table/data-table';
import { SearchCombobox } from '@src-v2/containers/search-combobox';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useDataTable } from '@src-v2/hooks/use-data-table';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { stopPropagation } from '@src-v2/utils/dom-utils';

export const BrokerNetworkTable = observer(props => {
  const { connectors, session, asyncCache } = useInject();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const history = useHistory();
  const brokerConnector = useSuspense(connectors.getConnection, { key: connectionUrl });

  const dataModel = useDataTable(connectors.searchConnectionNetworkBroker, {
    key: `${session?.data?.environmentId}-broker-table`,
    columns: tableColumns,
    searchParams: { connectionUrl },
  });

  useEffect(() => {
    return () => asyncCache.invalidateAll(connectors.searchConnectionNetworkBroker);
  }, []);

  return (
    <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Broker Network table' }}>
      <ConnectionsTable
        {...props}
        dataModel={dataModel}
        filterGroups={[]}
        searchItem={{ singular: 'connector', plural: 'connectors' }}
        searchPlaceholder="Search...">
        {row => (
          <DataTable.Row
            key={row.key}
            data={{ ...row, brokerReachable: brokerConnector.isReachable }}
            onClick={
              row.isConnected && row.manageUrl
                ? () => {
                    const path = row.manageUrl.split('/').slice(3).join('/'); // removes https and sites base url
                    history.push(`/${path}`);
                  }
                : null
            }
          />
        )}
      </ConnectionsTable>
    </AnalyticsLayer>
  );
});

const ConnectBrokerModal = ({
  setModal,
  closeModal,
  brokerHostUrl,
  providerGroups,
}: {
  setModal: Dispatch<SetStateAction<JSX.Element>>;
  closeModal: () => void;
  brokerHostUrl?: string;
  providerGroups: any;
}) => {
  const [currentProvider, setCurrentProvider] = useState<any>();
  const { asyncCache, connectors } = useInject();

  const handleClose = useCallback(() => {
    setCurrentProvider(null);
    closeModal?.();
  }, [closeModal]);

  const handleNextClick = useCallback(() => {
    if (currentProvider) {
      setModal(
        <ServerModal
          providerGroup={currentProvider}
          onClose={handleClose}
          onSubmit={() => asyncCache.invalidateAll(connectors.searchConnectionNetworkBroker)}
        />
      );
    }
  }, [currentProvider, setModal, handleClose]);

  return (
    <ConnectModal
      title={
        <>
          <SvgIcon name="Broker" />
          Connect via broker
        </>
      }
      submitText="Next"
      onClose={() => handleClose()}
      onSubmit={handleNextClick}>
      <Field>
        <Label>Host</Label>
        <InputV2 data-readonly placeholder={brokerHostUrl ?? 'https://'} />
      </Field>
      <Field>
        <Label required>Connector</Label>
        <SearchCombobox
          // @ts-expect-error
          as={Select}
          icon={currentProvider && <VendorIcon name={currentProvider.key} />}
          items={providerGroups}
          placeholder="Type to select..."
          dropdownItem={DropdownItemWithVendorIcon}
          onSelect={event => {
            setCurrentProvider({ ...event.selectedItem, brokerHostUrl });
          }}
        />
      </Field>
    </ConnectModal>
  );
};

const ConnectionStatusCell = ({ data, ...props }) => {
  const { connectors } = useInject();
  const [modalElement, setModal, closeModal] = useModalState();
  const providerTypes = useSuspense(connectors.getProviderTypes);

  const providerGroups = providerTypes
    .reduce((result, provider) => {
      const customProviders =
        provider.providerGroups.map(item => {
          const providerExists = Boolean(result.find(res => res?.key === item.key));
          if (!providerExists) {
            return {
              ...item,
              value: item.displayName,
              label: item.displayName,
              providerGroup: item.key,
            };
          }
          return null;
        }) ?? [];
      result = [...result, ...customProviders];
      return result;
    }, [])
    .filter(Boolean)
    .filter(provider => provider.key !== 'NetworkBroker')
    .filter(provider => !provider.apiProvider)
    .sort((a, b) => a.key.localeCompare(b.key));

  const handleClick = (brokerHostUrl: string) => {
    setModal(
      <ConnectBrokerModal
        brokerHostUrl={brokerHostUrl}
        providerGroups={providerGroups}
        setModal={setModal}
        closeModal={closeModal}
      />
    );
  };

  const tokenExpireDaysLeft = data.server?.tokenExpireDate
    ? Math.ceil(differenceInHours(new Date(data.server.tokenExpireDate), new Date()) / 24)
    : undefined;

  return (
    <Table.FlexCell {...props}>
      {data.isConnected && (
        <ConnectionStatus
          server={data.server}
          tokenExpireDaysLeft={tokenExpireDaysLeft}
          canEdit={false}
          handleEdit={null}
          activeActionableErrors={data.server.activeActionableErrors}
          connectedToBroker={data.isConnected}
          brokerReachable={data.brokerReachable}
        />
      )}
      {!data.isConnected && (
        <Button
          variant={Variant.PRIMARY}
          size={Size.SMALL}
          onClick={() => handleClick(data.host)}
          disabled={!data.brokerReachable}>
          Connect
        </Button>
      )}
      {modalElement}
    </Table.FlexCell>
  );
};

const ConnectModal = styled(ConfirmationModal)`
  width: 135rem;

  ${Modal.Content} {
    ${Field} {
      font-size: var(--font-size-s);
      font-weight: 300;
      color: var(--color-blue-gray-70);
      gap: 1rem;

      ${Combobox} {
        width: 100%;
      }
    }

    > ${ExternalLink} {
      font-size: var(--font-size-s);
    }
  }
`;

const AdditionalHostsCell = ({ data, ...props }) => {
  return (
    <Table.FlexCell {...props}>
      <EllipsisText>{data.additionalHosts?.[0]}</EllipsisText>
      {data.additionalHosts?.length > 1 && (
        <Tooltip
          content={data.additionalHosts.slice(1).map(value => (
            <p key={value}>{value}</p>
          ))}>
          <Counter>+{data.additionalHosts.length - 1}</Counter>
        </Tooltip>
      )}
    </Table.FlexCell>
  );
};

const ProviderNameCell = ({ data, ...props }) => {
  return (
    <Table.FlexCell {...props}>
      {data.server?.provider ? (
        <>
          <VendorIcon name={data.server.provider} /> {data.server.provider}
        </>
      ) : (
        <>
          <SvgIcon name="Help" /> Unknown
        </>
      )}
    </Table.FlexCell>
  );
};

const tableColumns = [
  {
    key: 'provider-name',
    label: 'Provider name',
    Cell: ProviderNameCell,
  },
  {
    key: 'url',
    label: 'Host',
    Cell: ({ data, ...props }) => (
      <Table.Cell {...props}>
        <EllipsisText>
          {data.host ?? (
            <ExternalLink href={data.server.url} onClick={stopPropagation}>
              {data.server.url}
            </ExternalLink>
          )}
        </EllipsisText>
      </Table.Cell>
    ),
  },
  {
    key: 'additional-hosts',
    label: 'Additional hosts',
    Cell: AdditionalHostsCell,
  },
  {
    key: 'connection-status',
    label: 'Connection status',
    minWidth: '65rem',
    Cell: ConnectionStatusCell,
  },
];
