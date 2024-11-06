import _ from 'lodash';
import { useMemo } from 'react';
import { Redirect, Route, Switch, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { Page } from '@src-v2/components/layout/page';
import { Tabs } from '@src-v2/components/tabs/tabs';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading } from '@src-v2/components/typography';
import { ConnectionOverview } from '@src-v2/containers/connectors/management/connection-overview';
import { ConnectionApiGatewaysTable } from '@src-v2/containers/connectors/server-tables/connection-api-gateways-table';
import { ConnectionArtifactsTable } from '@src-v2/containers/connectors/server-tables/connection-artifacts-table';
import { ConnectionClustersTable } from '@src-v2/containers/connectors/server-tables/connection-clusters-table';
import { FindingsReportsTable } from '@src-v2/containers/connectors/server-tables/connection-findings-reports-table';
import { BrokerNetworkTable } from '@src-v2/containers/connectors/server-tables/connection-network-broker-table';
import { ConnectionProjectsTable } from '@src-v2/containers/connectors/server-tables/connection-projects-table';
import { ConnectionRepositoriesTable } from '@src-v2/containers/connectors/server-tables/connection-repositories-table';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useBreadcrumbs } from '@src-v2/hooks/use-breadcrumbs';

export function ConnectionManagement() {
  const { state } = useLocation<{ isSingleConnection?: boolean }>();
  const { connectionUrl } = useParams<{ connectionUrl: string }>();
  const { connectors } = useInject();

  const [connection, summaries, providerTypes] = useSuspense([
    [connectors.getConnection, { key: connectionUrl }] as const,
    [connectors.getConnectionSummary, { key: connectionUrl }] as const,
    [connectors.getProviderTypes] as const,
  ]);

  const providerGroupByKey = useMemo(
    () =>
      providerTypes
        .flatMap(provider => provider.providerGroups)
        .find(provider => provider.key === connection.provider),
    [providerTypes]
  );
  useBreadcrumbs({
    breadcrumbs: [
      state?.isSingleConnection
        ? {
            label: connection.providerGroup,
            to: `/connectors/manage/${connection.providerGroup}`,
            isPinned: true,
          }
        : { label: 'Manage', to: '/connectors/manage', isPinned: true },
    ],
  });

  const title = connection.displayName?.length ? connection.displayName : connection.url;

  return (
    <Page title="Manage Server">
      <StickyHeader
        title={
          <TitleWrapper>
            {title.split('/?')[0]}
            {providerGroupByKey?.docsUrl && (
              <Button
                href={providerGroupByKey?.docsUrl}
                variant={Variant.TERTIARY}
                endIcon="External">
                Documentation
              </Button>
            )}
          </TitleWrapper>
        }
      />

      <PageContent>
        <AsyncBoundary>
          <ConnectionOverview />
        </AsyncBoundary>
        {summaries?.length > 1 && (
          <Tabs
            tabs={summaries?.map(({ isRelated, ...summary }) => ({
              ...summary,
              to: _.startCase(summary.label).replace(' ', '-').toLowerCase(),
              label: `${_.startCase(summary.label)} · ${summary.total}`,
            }))}
            variant={Variant.SECONDARY}
          />
        )}

        <AsyncBoundary>
          <Switch>
            <Route path="/connectors/manage/server/:connectionUrl/repositories">
              <ConnectionRepositoriesTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/issue-projects">
              <ConnectionProjectsTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/api-gateways">
              <ConnectionApiGatewaysTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/clusters">
              <ConnectionClustersTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/artifact-repositories">
              <ConnectionArtifactsTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/projects">
              <FindingsReportsTable />
            </Route>

            <Route path="/connectors/manage/server/:connectionUrl/networkBroker">
              <BrokerNetworkTable />
            </Route>

            {summaries.length && <Redirect to={_.kebabCase(summaries[0].key)} />}
          </Switch>
        </AsyncBoundary>
      </PageContent>
    </Page>
  );
}

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const PageContent = styled(Gutters)`
  padding-top: 6rem;

  > ${Heading} {
    margin-bottom: 3rem;
    font-weight: 600;
    font-size: var(--font-size-xl);
  }
`;
