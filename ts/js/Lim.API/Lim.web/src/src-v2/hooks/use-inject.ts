import { History } from 'history';
import { createContext, useContext } from 'react';
import ioc from '@src-v2/ioc';
import {
  AccessTokens,
  AllRisks,
  Analytics,
  ApiClient,
  ApiRisks,
  ApiSecurityOverview,
  Application,
  ApplicationGroupProfiles,
  ApplicationProfiles,
  ApplicationProfilesV2,
  ArtifactDependencyFindingsRisks,
  Artifacts,
  AsyncCache,
  AuditLogs,
  BitbucketCloud,
  Clusters,
  Commits,
  Connectors,
  Contributors,
  Coverage,
  Definitions,
  Developers,
  Feedback,
  Findings,
  ForeignEntities,
  Github,
  Governance,
  Graph,
  Inventory,
  InventoryQuery,
  JiraCloud,
  Messaging,
  Notifications,
  OrgTeamProfiles,
  Organization,
  OssOverview,
  OssRisks,
  Overview,
  PdfService,
  Pipelines,
  Processes,
  Profiles,
  Projects,
  PullRequestScan,
  Questionnaires,
  RBAC,
  Releases,
  Reporting,
  RepositoryProfiles,
  Risks,
  Roles,
  SastOverview,
  SastRisks,
  ScaConfiguration,
  SecretsOverview,
  SecretsRisks,
  SecretsService,
  Session,
  Subscription,
  SupplyChainOverview,
  SupplyChainRisks,
  TicketingIssues,
  Toaster,
  UserGroups,
  Workflows,
} from '@src-v2/services';

export interface Services {
  accessTokens: AccessTokens;
  allRisks: AllRisks;
  analytics: Analytics;
  apiClient: ApiClient;
  apiRisks: ApiRisks;
  apiSecurityOverview: ApiSecurityOverview;
  application: Application;
  applicationGroupProfiles: ApplicationGroupProfiles;
  applicationProfiles: ApplicationProfiles;
  applicationProfilesV2: ApplicationProfilesV2;
  artifactDependencyFindingsRisks: ArtifactDependencyFindingsRisks;
  artifacts: Artifacts;
  asyncCache: AsyncCache;
  auditLogs: AuditLogs;
  bitbucketCloud: BitbucketCloud;
  clusters: Clusters;
  commits: Commits;
  connectors: Connectors;
  contributors: Contributors;
  coverage: Coverage;
  definitions: Definitions;
  developers: Developers;
  feedback: Feedback;
  findings: Findings;
  foreignEntities: ForeignEntities;
  github: Github;
  governance: Governance;
  graph: Graph;
  history: History;
  inventory: Inventory;
  inventoryQuery: InventoryQuery;
  jiraCloud: JiraCloud;
  messaging: Messaging;
  notifications: Notifications;
  orgTeamProfiles: OrgTeamProfiles;
  organization: Organization;
  ossOverview: OssOverview;
  ossRisks: OssRisks;
  overview: Overview;
  pdfService: PdfService;
  pipelines: Pipelines;
  processes: Processes;
  profiles: Profiles;
  projects: Projects;
  questionnaires: Questionnaires;
  rbac: RBAC;
  releases: Releases;
  reporting: Reporting;
  repositoryProfiles: RepositoryProfiles;
  risks: Risks;
  roles: Roles;
  sastOverview: SastOverview;
  sastRisks: SastRisks;
  scaConfiguration: ScaConfiguration;
  secretsOverview: SecretsOverview;
  secretsRisks: SecretsRisks;
  secretsService: SecretsService;
  session: Session;
  subscription: Subscription;
  supplyChainOverview: SupplyChainOverview;
  supplyChainRisks: SupplyChainRisks;
  ticketingIssues: TicketingIssues;
  toaster: Toaster;
  userGroups: UserGroups;
  workflows: Workflows;
  pullRequestScan: PullRequestScan;
}

export const InjectContext = createContext<Services>(ioc as any);

export function useInject() {
  return useContext(InjectContext);
}
