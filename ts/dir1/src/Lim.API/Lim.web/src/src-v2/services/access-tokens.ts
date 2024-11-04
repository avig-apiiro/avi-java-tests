import { addDays } from 'date-fns';
import { makeObservable, observable } from 'mobx';
import { ExtendedUserScopeType } from '@src-v2/containers/access-tokens/access-token-form';
import { permissionTypes } from '@src-v2/containers/access-tokens/access-token-form-editor-v2';
import { Application } from '@src-v2/services/application';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { StubAny } from '@src-v2/types/stub-any';
import { UserPermission } from '@src-v2/types/user-permission';
import { modify } from '@src-v2/utils/mobx-utils';

export type AccessTokenCreationResponse = { jwt: string; tokenKey: string };

export interface AccessToken {
  key?: string;
  permissions: UserPermission[];
  expirationTime: Date;
  aboutToExpire?: boolean;
  expired?: boolean;
  lastUsedTime?: Date;
  name?: string;
  type?: string;
  createdBy?: string;
  userScope?: {
    isGlobal: boolean;
    applicationGroupKeys?: string[];
    assetCollectionKeys?: string[];
    providerRepositoryKeys?: string[];
    serverKeys?: string[];
  };
  extendedUserScopeResponse?: {
    isGlobal: boolean;
    applicationGroups?: any[];
    assetCollections?: any[];
    providerRepositories?: any[];
    servers?: any[];
  };
  isAccessTokenScopeSameAsUsers?: boolean;
}

interface FormPermissionType {
  key: string;
  title: string;
  description: string;
  disabled: boolean;
}

export interface FormPermissionsTypes extends FormPermissionType {
  partialPermissions: FormPermissionType[];
}

export interface FormPartialPermissionsTypes extends FormPermissionType {
  partialPermissions?: FormPermissionType[];
}

export class AccessTokens {
  #client;
  #asyncCache;
  #application;

  jwtToken = { tokenKey: '', jwt: '' };

  constructor({ apiClient, asyncCache, application }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
    this.#application = application;

    makeObservable(this, { jwtToken: observable });
  }

  listAccessTokens(): Promise<AccessToken[]> {
    return this.#client.get('accessTokens').then((data: StubAny) => {
      data.map((item: StubAny) => AccessTokens.#transformTokenItem(item, this.#application));
      return data;
    });
  }

  createAccessToken(): Promise<AccessToken> {
    return Promise.resolve({ expirationTime: addDays(new Date(), 30), permissions: [] });
  }

  getAccessToken({ key }: StubAny): Promise<AccessToken> {
    return this.#client
      .get(`accessTokens/${key}?validateApiiroToken=true`)
      .then((data: StubAny) => AccessTokens.#transformTokenItem(data, this.#application));
  }

  getFormSpecificOptions(): Promise<FormPermissionsTypes[]> {
    return this.#client.get('accessTokens/roleResources');
  }

  async upsertAccessToken(data: StubAny) {
    const response = await (data.key
      ? this.#client.put(`accessTokens/${data.key}`, data)
      : this.#client
          .post('internal/accessTokens/', data)
          .then((response: StubAny) => this.#setJwtToken(response)));
    this.#asyncCache.invalidateAll(this.listAccessTokens);
    this.#asyncCache.invalidate(this.getAccessToken, { key: data.key });

    return response;
  }

  async deleteAccessToken({ key }: StubAny) {
    await this.#client.delete(`accessTokens/${key}`);
    this.#asyncCache.invalidate(this.listAccessTokens);
  }

  async regenerateToken(accessTokenKey: string, expirationTime: Date) {
    const response = await this.#client
      .post(`accessTokens/${accessTokenKey}/regenerate`, { expirationTime })
      .then((response: StubAny) => this.#setJwtToken(response));

    this.#asyncCache.invalidateAll(this.listAccessTokens);
    this.#asyncCache.invalidate(this.getAccessToken, { key: accessTokenKey });
    return response;
  }

  getJwt(tokenKey: StubAny) {
    return this.jwtToken?.tokenKey === tokenKey ? this.jwtToken?.jwt : undefined;
  }

  clearJwt() {
    this.#setJwtToken({});
  }

  #setJwtToken({ jwt, tokenKey }: { jwt?: string; tokenKey?: string }) {
    modify(this, 'jwtToken', { jwt, tokenKey });

    return { jwt, tokenKey };
  }

  static #transformTokenItem(item: StubAny, application: Application) {
    item.expirationTime = new Date(item.expirationTime);
    item.lastUsedTime = item.lastUsedTime ? new Date(item.lastUsedTime) : undefined;

    if (application.isFeatureEnabled(FeatureFlag.AccessTokenForm)) {
      return transformDefaultValues(item);
    }

    return item;
  }
}

const transformDefaultValues = (defaultValues: StubAny) => {
  const permissions = defaultValues.permissions.reduce((result: StubAny, permission: StubAny) => {
    result[permission.resourceName] = {
      ...permission,
      ...permissionTypes.find(type => type.value === permission.accessType),
    };
    return result;
  }, {});

  let userScope: ExtendedUserScopeType;

  if (defaultValues?.userScope) {
    userScope = {
      isGlobal: defaultValues.userScope.isGlobal || defaultValues.isAccessTokenScopeSameAsUsers,
      ...defaultValues.extendedUserScopeResponse,
    };
  }

  return {
    ...defaultValues,
    permissions,
    userScope,
  };
};
