import { addDays, format } from 'date-fns';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { AccessToken, AccessTokenCreationResponse } from '@src-v2/services/access-tokens';
import { ApiClient } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { toBase64 } from '@src-v2/utils/json-utils';

export class JiraCloud {
  #application: Application;
  #client: ApiClient;

  constructor({ apiClient, application }: { apiClient: ApiClient; application: Application }) {
    this.#application = application;
    this.#client = apiClient;
  }

  async installApp(serverUrl: string) {
    const { session, integrations } = this.#application;

    const jiraBaseUrl = 'https://auth.atlassian.com/authorize';
    const jiraAppAudience = 'api.atlassian.com';
    const jiraAppPermissions = 'manage%3Ajira-webhook%20read%3Ajira-work';

    const timestamp = JiraCloud.#createTimestamp();
    const name = `JiraCloudApp_${serverUrl}_${timestamp}`;
    const tokenRequest = JiraCloud.#createJiraCloudTokenRequest(name, 365);
    const { jwt: apiiroToken } = await this.#client.post<AccessTokenCreationResponse>(
      'accessTokens',
      tokenRequest
    );
    const state = toBase64({
      apiiroToken,
      apiiroUrl: window.location.origin,
      redirectUrl: window.location.href,
      environmentId: session.data.environmentId,
      apiVersion: 1,
    });
    const client_id = integrations.jiraAppClientId;
    const redirect_uri = `${integrations.jiraAppBaseUrl}/api/registration`;

    window.location.href = `${jiraBaseUrl}?audience=${jiraAppAudience}&client_id=${client_id}&scope=${jiraAppPermissions}%20offline_access&redirect_uri=${redirect_uri}&state=${state}&response_type=code&prompt=consent`;
  }

  static #createTimestamp() {
    return format(Date.now(), 'dd-MM-yyyy-HH-mm-ss');
  }

  static #createJiraCloudTokenRequest(name: string, daysToLive: number): AccessToken {
    return {
      name,
      type: 'Jira',
      permissions: [{ resourceName: resourceTypes.JiraCloudApplication, accessType: 'Write' }],
      expirationTime: addDays(new Date(), daysToLive),
    };
  }
}
