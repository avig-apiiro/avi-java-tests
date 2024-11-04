import _ from 'lodash';
import { useMemo } from 'react';
import { RiskyTicketsOption } from '@src-v2/containers/pages/general-settings/monitor-design-risks';
import { useInject, useSuspense } from '@src-v2/hooks';
import { Provider } from '@src-v2/types/enums/provider';

export const useRiskyTickets = () => {
  const { organization } = useInject();
  const riskyTickets = useSuspense(organization.getRiskyTickets);

  const providerOrder = [Provider.Jira, Provider.Github, Provider.AzureDevops, Provider.Gitlab];

  const mapAndSortTickets = (
    ticketTypesByProvider: Record<string, string[]>
  ): RiskyTicketsOption[] => {
    const tickets = _.flatMap(_.entries(ticketTypesByProvider), ([provider, ticketTypes]) =>
      ticketTypes.map(ticketType => ({
        key: `${ticketType}-${provider}`,
        value: ticketType,
        label: ticketType,
        icon: provider as Provider,
      }))
    );

    return _.sortBy(tickets, [
      ticket => providerOrder.indexOf(ticket.icon),
      ticket => ticket.value.toLowerCase(),
    ]);
  };

  const monitoredRiskTickets = useMemo(
    () => mapAndSortTickets(riskyTickets.monitoredTicketTypesByProvider),
    [riskyTickets]
  );

  const enabledRiskyTickets = useMemo(
    () =>
      mapAndSortTickets(riskyTickets.riskyTicketsConfiguration?.enabledTicketTypesByProvider || {}),
    [riskyTickets]
  );

  const featureEnabled = useMemo(
    () => riskyTickets.riskyTicketsConfiguration?.featureEnabled,
    [riskyTickets]
  );
  return {
    monitoredRiskTickets,
    enabledRiskyTickets,
    featureEnabled,
  };
};
