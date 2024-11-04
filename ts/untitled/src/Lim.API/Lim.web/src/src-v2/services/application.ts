import { action, computed, makeObservable, observable, when } from 'mobx';
import { BreadcrumbProps } from '@src-v2/hooks/use-breadcrumbs';
import { ApiClient } from '@src-v2/services/api-client';
import { Session } from '@src-v2/services/session';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { qs } from '@src-v2/utils/history-utils';
import { modify } from '@src-v2/utils/mobx-utils';

const INTERNAL_FEATURE_FLAG_KEY = 'INTERNAL_FEATURE_FLAG_KEY';

interface Integrations {
  bitbucketAppUrl: string;
  connectedToApiGateway: boolean;
  connectedToAzureDevops: boolean;
  connectedToGithub: boolean;
  connectedToGitlab: boolean;
  connectedToGoogleChat: boolean;
  connectedToIdentity: boolean;
  connectedToJira: boolean;
  connectedToScm: boolean;
  connectedToSlack: boolean;
  connectedToTeams: boolean;
  connectedToTicketingSystem: boolean;
  customerSecretsEncryptionEnabled: boolean;
  githubAppName: string;
  githubAppUrl: string;
  jiraAppBaseUrl: string;
  jiraAppClientId: string;
  hasCodeVulnerabilityScan: boolean;
  hasMonitoredIssueProjects: boolean;
  hasMonitoredRepositories: boolean;
}

export class Application {
  #client: ApiClient;
  session: Session;

  #internalFeatureFlags: StubAny[] = [];

  canUpgrade = false;
  isUpdating = false;
  initialized = false;
  externalConnectivity = true;
  integrations: Integrations = null;
  version: string = null;
  configuration = {
    isAnalyticsEnabled: false,
    supportsUserClaims: false,
    maxRepositoriesPerProviderRepository: 5,
  };
  breadcrumbs?: BreadcrumbProps[] = [];
  backStack?: Partial<Location>[] = [];

  constructor({ apiClient, session }: { apiClient: ApiClient; session: Session }) {
    this.#client = apiClient;
    this.session = session;
    this.backStack =
      this.backStack.length === 0
        ? [{ pathname: window?.location.pathname ?? '/' }]
        : this.backStack;

    makeObservable(this, {
      canUpgrade: observable,
      isUpdating: observable,
      initialized: observable,
      configuration: observable,
      breadcrumbs: observable,
      backStack: observable,
      externalConnectivity: observable,
      integrations: observable,
      version: observable,
      lostConnection: computed,
      setBreadcrumbs: action,
      setBackStack: action,
    });

    const { ff } = qs.parse(window.location.search);
    if (ff) {
      sessionStorage.setItem(
        INTERNAL_FEATURE_FLAG_KEY,
        JSON.stringify(typeof ff === 'string' ? [ff] : ff)
      );
    }

    const storedFeatureFlags = sessionStorage.getItem(INTERNAL_FEATURE_FLAG_KEY);
    this.#internalFeatureFlags = storedFeatureFlags
      ? JSON.parse(sessionStorage.getItem(INTERNAL_FEATURE_FLAG_KEY))
      : [];

    Promise.all([this.fetchConfiguration(), session.verifyConnection()]).then(() =>
      modify(this, 'initialized', true)
    );

    when(
      () => session.connected,
      () => {
        void this.checkUpdates();
        void this.checkExternalConnectivity();
        void this.fetchIntegrations();
      }
    );
  }

  setBreadcrumbs(breadcrumbs: BreadcrumbProps[]) {
    this.breadcrumbs = breadcrumbs;
  }

  setBackStack({ action, location }: { action: 'POP' | 'PUSH' | 'REPLACE'; location: Location }) {
    switch (action) {
      case 'POP':
        this.backStack = this.backStack.slice(0, this.backStack.length - 1);
        break;
      case 'PUSH':
        this.backStack = [...this.backStack, location];
        break;
      case 'REPLACE':
        this.backStack = [...this.backStack.slice(0, this.backStack.length - 1), location];
        break;
      // no default
    }
  }

  get lostConnection() {
    return !this.session.connectivity;
  }

  get isDemo() {
    return this.session.data?.isDemo ?? false;
  }

  get isSaas() {
    return this.session.data?.isSaas ?? false;
  }

  get customerSupportEmail(): string {
    return this.session.data?.customerSupportEmail;
  }

  isFeatureEnabled(featureName: FeatureFlag) {
    let isEnabled = this.session.data?.betaFeatures?.includes(featureName);

    if (!isEnabled && this.session.data?.consoleUser.isInternal) {
      isEnabled = this.#internalFeatureFlags?.includes(featureName);
    }

    return isEnabled;
  }

  reportError(error: StubAny, state: StubAny) {
    this.#client.post('session/error', {
      location: window.location.href,
      state: JSON.stringify(state),
      ...error,
    });
  }

  async fetchConfiguration() {
    const { authenticationType, ...configuration }: StubAny = await this.#client.get(
      'configuration/application'
    );

    this.session.setAuthType(authenticationType);

    modify(this, { configuration });
  }

  async fetchIntegrations() {
    modify(this, 'integrations', await this.#client.get('integrations'));
  }

  async applyUpdates() {
    modify(this, 'isUpdating', true);
    const success = await this.#client
      .post<boolean>('versioning/applyUpdate')
      .finally(() => modify(this, 'isUpdating', false));
    if (!success) {
      throw Error('Failed to apply version update');
    }
  }

  async checkUpdates() {
    try {
      const { version, canUpgrade } = await this.#client.get('versioning/current');
      modify(this, {
        version: /^(\d+\.?)+$/.test(version) ? `v${version}` : version,
        canUpgrade,
      });
    } catch (error) {}
  }

  async checkExternalConnectivity() {
    try {
      modify(
        this,
        'externalConnectivity',
        await this.#client.get('environment/external-connectivity')
      );
    } catch (error) {}
  }

  async requestSupport({ subject, ...props }: StubAny) {
    const formData = new FormData();
    const data = { ...props, summary: subject };

    Object.entries(data).forEach(([key, value]) => formData.append(key, value as StubAny));
    await this.#client.post('session/support', formData);
  }
}
