interface ActiveActionableError {
  description: string;
  key: string;
  state: string;
  errorDetails: {
    aggregationKey: string;
    errorCategory: string;
    errorType: string;
    connectedEntity: {
      entityKey: string;
      type: string;
    };
    relatedEntities: any[];
  };
}

export type Connection = {
  additionalData: string;
  baseUrl: string;
  connectivityIssueReason: string;
  description: string;
  displayName: string;
  hasPassword: boolean;
  hasPrivateKey: boolean;
  initialSyncCompleted: boolean;
  isReachable: boolean;
  isRoutedViaNetworkBroker: boolean;
  monitorNew: false;
  provider: string;
  providerGroup: string;
  providesApiGateways: boolean;
  providesArtifactRepositories: boolean;
  providesFindingsReport: boolean;
  providesGitRepositories: boolean;
  providesIdentities: boolean;
  providesIssueProjects: boolean;
  providesRepositories: boolean;
  removed: boolean;
  tokenExpireDate: string | Date;
  url: string;
  useGitWithPatOnlyBasicAuth: boolean;
  username: string;
  usesTempPassword: boolean;
  tokenDaysToExpire: number | null;
  activeActionableErrors: ActiveActionableError[];
};
