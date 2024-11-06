import _ from 'lodash';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import ioc from '../ioc';

export interface SidebarMenuItem {
  title: string;
  route?: string | string[];
  icon?: string;
  hasFollowPath?: boolean;
  new?: true;
  nested?: true;
  condition?: () => boolean;
  tooltip?: () => string;
  items?: SidebarMenuItem[];
}

const items: SidebarMenuItem[] = [
  {
    title: 'Dashboard',
    icon: 'Dashboard',
    route: '/organization',
    hasFollowPath: true,
  },
  {
    title: 'All risks',
    icon: 'RiskArea',
    route: '/risks',
    hasFollowPath: true,
  },
  {
    title: 'Coverage',
    icon: 'CoverageShield',
    route: '/coverage',
  },
  {
    title: 'Inventory',
    icon: 'Web',
    items: [
      {
        title: 'Overview',
        route: '/inventory/overview',
      },
      {
        title: 'Applications',
        route: ['/profiles/applications', '/profiles/groups'],
      },
      {
        title: 'Repositories',
        route: '/profiles/repositories',
      },
      {
        title: 'CI/CD pipelines',
        route: '/inventory/pipelines',
        new: true,
        condition: () =>
          ioc.application.isFeatureEnabled(FeatureFlag.PipelineCICD) &&
          ioc.rbac.canEdit(resourceTypes.Global),
      },
      {
        title: 'Artifacts',
        route: '/inventory/artifacts',
        new: true,
        condition: () =>
          ioc.application.isFeatureEnabled(FeatureFlag.Artifact) &&
          ioc.rbac.canEdit(resourceTypes.Global),
      },

      {
        title: 'Clusters',
        route: '/inventory/clusters',
      },
      {
        title: 'Contributors',
        route: ['/users/contributors', '/users/teams'],
      },
      {
        title: 'Teams',
        route: '/profiles/teams',
        condition: () => ioc.application.isFeatureEnabled(FeatureFlag.OrgTeams),
        new: true,
      },
    ],
  },
  {
    title: 'Explorer',
    icon: 'Explorer',
    route: '/explorer',
  },
  {
    title: 'Governance',
    icon: 'Governance',
    items: [
      {
        title: 'Policies',
        route: '/governance/rules',
      },
      {
        title: 'Questionnaires',
        route: '/questionnaire',
        condition: () => ioc.application.isFeatureEnabled(FeatureFlag.Questionnaire),
      },
      {
        title: 'Releases',
        route: '/releases',
      },
      {
        title: 'PR logs',
        route: '/pull-requests',
        condition: () => ioc.application.isFeatureEnabled(FeatureFlag.PrLogs),
      },
    ],
  },
  {
    title: 'Workflows',
    icon: 'Workflow',
    route: ['/workflows/manager', '/workflows/recipes'],
  },
  {
    title: 'Reports',
    icon: 'Reports',
    route: '/reporting',
    condition: () => ioc.rbac.hasGlobalScopeAccess,
  },
  {
    title: 'SOLUTIONS',
    nested: true,
    items: [
      {
        title: 'SCA',
        icon: 'Dependency',
        items: [
          {
            title: 'Dashboard',
            route: '/organization/oss',
          },
          {
            title: 'Risks',
            route: '/risks/oss',
          },
        ],
      },
      {
        title: 'Secrets',
        icon: 'Lock',
        items: [
          {
            title: 'Dashboard',
            route: '/organization/secrets',
          },
          {
            title: 'Risks',
            route: '/risks/secrets',
          },
        ],
      },
      {
        title: 'API security',
        icon: 'Api',
        items: [
          {
            title: 'Dashboard',
            route: '/organization/api',
          },
          {
            title: 'Risks',
            route: '/risks/api',
          },
        ],
      },
      {
        title: 'Supply chain',
        icon: 'Integration',
        new: true,
        condition: () => ioc.application.isFeatureEnabled(FeatureFlag.SupplyChainRiskTable),
        items: [
          {
            title: 'Dashboard',
            route: '/organization/supplyChain',
          },
          {
            title: 'Risks',
            route: '/risks/supplyChain',
          },
        ],
      },
      {
        title: 'SAST',
        icon: 'Sast',
        new: true,
        items: [
          {
            title: 'Dashboard',
            route: '/organization/sast',
          },
          {
            title: 'Risks',
            route: '/risks/sast',
          },
        ],
      },
    ],
  },
  {
    icon: 'Connector',
    title: 'Connect SCM',
    route: '/connect-scm',
    condition: () => false, // we want to hide it in sidebar, but support in breadcrumbs
  },
  {
    icon: 'Connector',
    title: 'Monitor repositories',
    route: '/monitor-repositories',
    condition: () => false, // we want to hide it in sidebar, but support in breadcrumbs
  },
  {
    title: 'Settings',
    icon: 'Settings',
    items: [
      {
        title: 'Connectors',
        route: ['/connectors', '/connectors/manage'],
        tooltip: () => {
          if (
            !_.isNil(ioc.application.integrations) &&
            !ioc.application.isFeatureEnabled(FeatureFlag.EmptyStates)
          ) {
            if (!ioc.application.integrations.connectedToScm) {
              return 'Connect your first SCM';
            }
            if (!ioc.application.integrations.hasMonitoredRepositories) {
              return 'Monitor your first repository';
            }
          }
          return null;
        },
      },
      {
        title: 'Definitions',
        route: '/governance/definitions',
      },
      {
        title: 'Access permissions ',
        route: '/settings/access-permissions',
      },
      {
        title: 'Manual findings',
        route: '/settings/manual-findings',
        condition: () => ioc.application.isFeatureEnabled(FeatureFlag.ManualFindingsEntry),
      },
      {
        title: 'General',
        route: '/settings/general',
      },
      {
        title: 'Audit log',
        route: '/settings/audit-log',
        condition: () => ioc.rbac.canEdit(resourceTypes.Global),
      },
    ],
  },
];

export default items;
