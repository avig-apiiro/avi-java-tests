import { addDays, format } from 'date-fns';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { AccessToken } from '@src-v2/services/access-tokens';
import { ApiClient } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { toBase64 } from '@src-v2/utils/json-utils';

export class Github {
  #application: Application;
  #client: ApiClient;

  constructor({ apiClient, application }: { apiClient: ApiClient; application: Application }) {
    this.#application = application;
    this.#client = apiClient;
  }

  async redirectToGithubOAuth() {
    const { session, integrations } = this.#application;
    const { jwt: apiiroToken } = await this.#client.post<{ jwt: string }>(
      'accessTokens',
      Github.#createGithubTokenRequest(`GithubApp_${Github.#createTimestamp()}`, 1)
    );

    window.location.href = `${integrations.githubAppUrl}/api/oauth/callback?state=${toBase64({
      apiiroToken,
      apiiroUrl: window.location.origin,
      redirectUrl: `${window.location.origin}/connectors/manage`,
      environmentId: session.data.environmentId,
      csrf: crypto.randomUUID(),
    })}`;
  }

  enterpriseAppExists(serverUrl: string) {
    return this.#client.get(`/servers/${encodeURIComponent(serverUrl)}/hasGithubApp`);
  }

  async installGithubApp(serverUrl: string, isEnterprise: boolean) {
    const { session, integrations } = this.#application;

    let baseUrl = `https://github.com/apps/${integrations.githubAppName}`;
    let enterpriseState: Record<string, string>;

    if (isEnterprise) {
      const { origin } = new URL(serverUrl);
      baseUrl = `${origin}/github-apps/apiiro`;
      enterpriseState = { githubUrl: origin, server: serverUrl };
    }

    const { jwt: apiiroToken } = await this.#client.post<{ jwt: string }>(
      'accessTokens',
      Github.#createGithubTokenRequest(`GithubApp_${serverUrl}_${Github.#createTimestamp()}`, 365)
    );

    window.location.href = `${baseUrl}/installations/new?state=${toBase64({
      apiiroToken,
      ...enterpriseState,
      apiiroUrl: window.location.origin,
      redirectUrl: window.location.href,
      environmentId: session.data.environmentId,
      apiVersion: 1,
    })}`;
  }

  static #createTimestamp(): string {
    return format(Date.now(), 'dd-MM-yyyy-HH-mm-ss');
  }

  static #createGithubTokenRequest(name: string, daysToLive: number): AccessToken {
    return {
      name,
      type: 'Github',
      permissions: [{ resourceName: resourceTypes.Global, accessType: 'Write' }],
      expirationTime: addDays(new Date(), daysToLive),
    };
  }
}
