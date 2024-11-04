import loadable from '@loadable/component';
import { observer } from 'mobx-react';
import { lazy } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { DefaultLayout, EmptyLayout, TempUnauthorizedLayout } from '@src-v2/components/layout';
import ReportingLandingPage from '@src-v2/containers/pages/reporting/reporting-landing-page/reporting-page';
import ReportingLegacyLandingPage from '@src-v2/containers/pages/reporting/reporting-legacy-landing-page';
import SettingsPage from '@src-v2/containers/pages/settings-page';
import SettingsPageV2 from '@src-v2/containers/pages/settings-page-v2';
import { useInject, useQueryParams, useSuspense } from '@src-v2/hooks';
import { RedirectAdapter } from '@src-v2/redirect-adapter';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { makeUrl } from '@src-v2/utils/history-utils';

/**
 * A list of routes configured by react-router.
 * In addition to react-router props you can also pass a `layout`
 * property to overwrite the DefaultLayout which wraps all routes.
 * Always wrap components with `loadable` to enable code-splitting.
 * @see https://reactrouter.com/web/api/Route
 */
export default [
  {
    path: '/login',
    publicRoute: true,
    component: loadable(() => import('./containers/pages/login-page')),
    layout: EmptyLayout,
  },
  {
    path: '/unauthorized',
    publicRoute: true,
    render: () => <TempUnauthorizedLayout />,
  },
  {
    path: '/questionnaire-public/summary/:hash',
    publicRoute: true,
    component: loadable(() => import('./containers/pages/questionnaire-public-summary-page')),
    layout: EmptyLayout,
  },
  {
    path: '/questionnaire-public/:hash',
    publicRoute: true,
    component: loadable(() => import('./containers/pages/questionnaire-public-page')),
    layout: EmptyLayout,
  },
  {
    layout: DefaultLayout,
    routes: [
      {
        path: '/r/:path*',
        component: RedirectAdapter,
      },
      {
        path: '/organization',
        component: loadable(() => import('./containers/pages/overview/overview-page')),
      },
      {
        path: '/connect-scm',
        component: loadable(() => import('./containers/pages/connect-scm-page')),
        featureFlag: FeatureFlag.EmptyStates,
      },
      {
        path: '/monitor-repositories',
        component: loadable(() => import('./containers/pages/connect-scm-page')),
        featureFlag: FeatureFlag.EmptyStates,
      },
      // TODO: remove '/settings/audit-log' when feature flag SettingsNewLayout is removed
      {
        path: '/settings/audit-log',
        component: loadable(() => import('./containers/pages/audit-log-page')),
      },
      {
        path: '/audit-log',
        component: loadable(() => import('./containers/pages/audit-log-page')),
      },
      {
        path: '/manual-findings',
        component: loadable(() => import('./containers/pages/manual-findings-page')),
        featureFlag: FeatureFlag.ManualFindingsEntry,
      },
      {
        path: '/inventory/overview',
        component: loadable(() => import('./containers/pages/inventory-overview-page')),
      },
      {
        path: '/profiles/:profileType/:profileKey/risk/:riskTab/ruleTriggers/:ruleTriggersKey/trigger/:legacyKey',
        component: function SmartRedirect() {
          const { risks } = useInject();
          const { queryParams = {} } = useQueryParams();
          const { legacyKey, ruleTriggersKey, profileKey, profileType, riskTab } =
            useParams<Record<string, string>>();

          const riskSummaryKey = useSuspense(risks.getTriggerSummaryKeyByTriggerKey, {
            legacyKey,
            ruleKey: ruleTriggersKey,
          });

          return (
            <Redirect
              to={makeUrl(`/profiles/${profileType}/${profileKey}/risk/${riskTab}`, {
                ...queryParams,
                trigger: riskSummaryKey ? riskSummaryKey : 'not-found',
              })}
            />
          );
        },
      },
      {
        path: '/profiles/teams',
        featureFlag: FeatureFlag.OrgTeams,
        component: loadable(() => import('./containers/pages/org-teams-page')),
      },
      {
        path: '/profiles',
        component: loadable(() => import('../blocks/RiskProfilesPage')),
      },
      {
        path: '/users',
        component: loadable(() => import('../blocks/DevelopersPage')),
      },
      {
        path: '/releases/:key',
        component: loadable(() => import('../blocks/ReleasePage')),
      },
      {
        path: '/releases',
        component: loadable(() => import('./containers/pages/releases-page')),
      },
      {
        path: '/pull-requests',
        component: loadable(() => import('./containers/pages/pull-requests-page')),
        featureFlag: FeatureFlag.PrLogs,
      },
      {
        path: '/governance/:governanceType?',
        component: loadable(() => import('../blocks/GovernancePage')),
      },
      {
        path: '/workflows',
        component: loadable(() => import('./containers/pages/workflow-page')),
      },
      {
        path: '/inventory/clusters/:clusterKey',
        component: loadable(() => import('../cluster-map-work/containers/pages/cluster-page')),
      },
      {
        path: '/explorer',
        component: loadable(() => import('./containers/pages/inventory-query-page')),
      },
      {
        path: '/inventory/clusters',
        component: loadable(() => import('../cluster-map-work/containers/pages/clusters-page')),
      },
      {
        path: '/connectors',
        component: loadable(() => import('./containers/pages/connectors-page')),
      },
      {
        path: '/risks/supplyChain',
        component: loadable(() => import('./containers/pages/risks/supply-chain-risks-page')),
        featureFlag: FeatureFlag.SupplyChainRiskTable,
      },
      {
        path: '/risks/secrets',
        component: loadable(() => import('./containers/pages/risks/secrets-risks-page')),
      },
      {
        path: '/risks/sast',
        component: loadable(() => import('./containers/pages/risks/sast-risks-page')),
      },
      {
        path: '/risks/api',
        component: loadable(() => import('./containers/pages/risks/api-risks-page')),
      },
      {
        path: '/risks/oss',
        component: loadable(() => import('./containers/pages/risks/oss-risks-page')),
      },
      {
        path: '/risks',
        component: loadable(() => import('./containers/pages/risks/organization-risks-page')),
      },
      {
        path: '/coverage',
        component: loadable(() => import('./containers/pages/coverage-page')),
      },
      {
        path: '/reporting/myOrgReports',
        component: lazy(() => import('./containers/pages/reporting/my-org-reports')),
      },
      {
        path: '/reporting/createNew',
        component: lazy(() => import('./containers/pages/reporting/create-report')),
      },
      {
        path: '/reporting/custom-report/:id/edit',
        component: lazy(() => import('./containers/pages/reporting/user-generated-report')),
      },
      {
        path: '/reporting/custom-report/:id',
        component: lazy(() => import('./containers/pages/reporting/user-generated-report')),
      },
      {
        path: '/reporting/:dashboard',
        component: loadable(() => import('./containers/pages/reporting/predefined-report')),
      },
      {
        path: '/reporting',
        component: function SmartRedirect() {
          const { application } = useInject();
          return application.isFeatureEnabled(FeatureFlag.ReportingLandingPage) ? (
            <ReportingLandingPage />
          ) : (
            <ReportingLegacyLandingPage />
          );
        },
      },
      {
        path: '/settings',
        component: function SmartRedirect() {
          const { application } = useInject();
          return application.isFeatureEnabled(FeatureFlag.SettingsNewLayout) ? (
            <SettingsPageV2 />
          ) : (
            <SettingsPage />
          );
        },
      },

      // old routes
      {
        path: '/module/:key/:moduleKey',
        component: loadable(() => import('../blocks/ModulePage')),
      },
      {
        path: '/commit/:repositoryKey/:commitSha/:demo?/:demo_block_index?/:demo_commit_index?',
        component: loadable(() => import('./containers/pages/commit-page')),
      },
      {
        path: '/commit/:commitSha',
        component: loadable(() => import('./containers/pages/commit-page')),
      },
      {
        path: '/build/:buildJobId',
        component: loadable(() => import('../blocks/BuildPage')),
      },
      // legacy redirects
      {
        path: '/overview',
        component: () => <Redirect to="/organization" />,
      },
      {
        path: '/secrets/playground',
        component: loadable(() => import('./containers/pages/secrets-playground-page')),
      },
      {
        path: '/riskProfiles/:profileType?',
        component: function SmartRedirect() {
          const { profileType = 'assetCollections' } = useParams<Record<string, string>>();
          return (
            <Redirect
              to={
                profileType === 'assetCollections'
                  ? '/profiles/applications'
                  : '/profiles/repositories'
              }
            />
          );
        },
      },
      {
        path: '/repository/:path*',
        component: function SmartRedirect() {
          const { path } = useParams<Record<string, string>>();
          return <Redirect to={`/profiles/repositories/${path}`} />;
        },
      },
      {
        path: '/assetCollection/:path*',
        component: function SmartRedirect() {
          const { path } = useParams<Record<string, string>>();
          return <Redirect to={`/profiles/applications/${path}`} />;
        },
      },
      {
        path: '/inventory/pipelines/cicd-servers/:cicdServerKey',
        component: loadable(() => import('./containers/pages/pipelines/cicd-servers/server-page')),
        featureFlag: FeatureFlag.PipelineCICD,
      },
      {
        path: '/inventory/pipelines/cicd-pipelines/:pipelineKey',
        component: loadable(
          () => import('./containers/pages/pipelines/cicd-pipelines/pipeline-page')
        ),
        featureFlag: FeatureFlag.PipelineCICD,
      },
      {
        path: '/inventory/pipelines',
        component: loadable(() => import('./containers/pages/pipelines/pipelines-routing')),
        featureFlag: FeatureFlag.PipelineCICD,
      },
      {
        path: '/inventory/artifacts/:artifactKey',
        component: loadable(() => import('./containers/pages/artifacts/artifacts-view-page')),
        featureFlag: FeatureFlag.Artifact,
      },
      {
        path: '/inventory/artifacts',
        component: loadable(() => import('./containers/pages/artifacts/artifacts')),
        featureFlag: FeatureFlag.Artifact,
      },
      {
        path: '/contributor/:path*',
        component: function SmartRedirect() {
          const { path } = useParams<Record<string, string>>();
          return <Redirect to={`/users/contributors/${path}`} />;
        },
      },
      {
        path: '/release/:path*',
        component: function SmartRedirect() {
          const { path } = useParams<Record<string, string>>();
          return <Redirect to={`/releases/${path}`} />;
        },
      },
      {
        path: '/contributors/:profileType?',
        component: function SmartRedirect() {
          const { profileType } = useParams<Record<string, string>>();
          return (
            <Redirect to={profileType === 'developers' ? '/users/contributors' : '/users/teams'} />
          );
        },
      },
      {
        path: '/questionnaire/:key*',
        component: loadable(() => import('./containers/pages/questionnaire-page')),
      },
      // default route
      {
        component: observer(function DefaultRedirect() {
          const {
            application: { integrations },
          } = useInject();
          // prevent redirect before integrations is fetched
          if (!integrations) {
            return null;
          }
          return (
            <Redirect
              to={integrations.hasMonitoredRepositories ? '/organization' : '/connectors'}
            />
          );
        }),
      },
    ],
  },
];
