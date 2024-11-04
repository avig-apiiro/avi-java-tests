import { ExtendedUserScopeType } from '@src-v2/containers/access-tokens/access-token-form';
import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import { StubAny } from '@src-v2/types/stub-any';

export type RolePermissionType = {
  resourceName: string;
  resourceDisplayName: string;
  accessType: string;
  description: string;
};

export type RoleType = {
  key: string;
  name: string;
  description: string;
  apiiroGroups?: StubAny[];
  extendedUserScope?: ExtendedUserScopeType;
  identifiers?: string[];
  permissions?: RolePermissionType[];
  userScope?: ExtendedUserScopeType;
};

export class Roles {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  getRoles(): Promise<RoleType[]> {
    return this.#client.get('roles');
  }

  getSupportedPermissions(): Promise<RolePermissionType[]> {
    return this.#client.get('roles/supportedPermissions');
  }

  async createRole(data: StubAny) {
    await this.#client.put('roles', { ...data, key: data.key ?? crypto.randomUUID() });
    this.invalidateRoles();
  }

  invalidateRoles() {
    this.#asyncCache.invalidateAll(this.getRoles);
  }

  async deleteRole({ key }: StubAny) {
    const response = await this.#client.delete(`roles/${encodeURIComponent(key)}`);
    this.invalidateRoles();
    return response;
  }
}
