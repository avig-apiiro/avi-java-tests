import { addDays, format } from 'date-fns';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { AccessToken, AccessTokenCreationResponse } from '@src-v2/services/access-tokens';
import { ApiClient } from '@src-v2/services/api-client';
import { Application } from '@src-v2/services/application';
import { toBase64 } from '@src-v2/utils/json-utils';

export class BitbucketCloud {
  #application: Application;
  #client: ApiClient;

  constructor({ apiClient, application }: { apiClient: ApiClient; application: Application }) {
    this.#application = application;
    this.#client = apiClient;
  }

  async installApp(serverUrl: string) {
    const { session, integrations } = this.#application;

    const bitbucketCloudOrgUrl = 'https://bitbucket.org/site/addons/authorize';
    const timestamp = BitbucketCloud.#createTimestamp();
    const name = `BitbucketCloudApp_${serverUrl}_${timestamp}`;

    const tokenRequest = BitbucketCloud.#createBitbucketCloudTokenRequest(name, 365);

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
    const [descriptor_uri, redirect_uri_prefix] = integrations.bitbucketAppUrl.endsWith('/')
      ? [integrations.bitbucketAppUrl, integrations.bitbucketAppUrl.slice(0, -1)]
      : [`${integrations.bitbucketAppUrl}/`, integrations.bitbucketAppUrl];
    window.location.href = `${bitbucketCloudOrgUrl}?descriptor_uri=${descriptor_uri}&redirect_uri=${redirect_uri_prefix}/install/new?state=${state}`;
  }

  static #createTimestamp() {
    return format(Date.now(), 'dd-MM-yyyy-HH-mm-ss');
  }

  static #createBitbucketCloudTokenRequest(name: string, daysToLive: number): AccessToken {
    return {
      name,
      type: 'BitbucketCloud',
      permissions: [{ resourceName: resourceTypes.Global, accessType: 'Write' }],
      expirationTime: addDays(new Date(), daysToLive),
    };
  }
}
