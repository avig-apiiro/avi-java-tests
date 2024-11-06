import { flatRuleOptionTypes } from '@src-v2/data/governance-rules';
import { ApiClient } from '@src-v2/services/api-client';
import { AsyncCache } from '@src-v2/services/async-cache';
import {
  ApiiroQlSmartPolicyRule,
  EditableExpressionError,
  GovernanceRule,
} from '@src-v2/types/governance/governance-rules';
import { StubAny } from '@src-v2/types/stub-any';

type RuleTag = {
  key: string;
  value: string;
  label: string;
};

export type ApiiroGovernanceRuleValidationError = {
  message: string;
  rulePortionType?: 'Given' | 'When' | 'Then';
  errorCode?: number;
  expressionIdentifier?: string;
  editableExpressionErrors?: EditableExpressionError[];
};

export class Governance {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  setRuleDisabled({ key, isDisabled }: { key: string; isDisabled: boolean }) {
    return this.#client.put(`/governance/disable`, { key, isDisabled });
  }

  getRules(): Promise<GovernanceRule[]> {
    return this.#client.get('governance/rules');
  }

  getRule({ key }: { key: string }): Promise<GovernanceRule> {
    return this.#client.get(`governance/rules/${key}`);
  }

  getRuleOptions(): Promise<{
    given: Record<string, any>;
    when: Record<string, any>;
    then: Record<string, any>;
  }> {
    return this.#client.get(`governance/options`);
  }

  async getRuleTags(): Promise<RuleTag[]> {
    return (await this.#client.get(`governance/rule-tags`)).map((tag: string) => ({
      key: tag,
      label: tag,
      value: tag,
    }));
  }

  async searchRuleTags({
    searchTerm,
    limit,
    offset,
  }: {
    searchTerm: string;
    limit?: number;
    offset?: number;
  }): Promise<RuleTag[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (await this.#asyncCache.suspend(this.getRuleTags))
      .filter((tag: RuleTag) => tag.key.toLowerCase().indexOf(lowerSearchTerm) >= 0)
      .slice(offset, offset + limit || 20);
  }

  async saveRule(rule: StubAny): Promise<ApiiroGovernanceRuleValidationError[]> {
    const modifiedRule = flatRuleOptionTypes({ ...rule });
    try {
      await this.#client.put(`/governance/rules/${rule.key}`, modifiedRule);
      this.#asyncCache.invalidateAll(this.getRules);
      this.#asyncCache.invalidateAll(this.getRule, { key: rule.key });
      this.#asyncCache.invalidateAll(this.getRuleTags);

      return null;
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data instanceof Array) {
          return error.response.data;
        }
        return [{ message: error.response.data?.message ?? error.response.data }];
      }

      return [{ message: error }];
    }
  }

  async saveApiiroQlSmartPolicyRule(
    rule: ApiiroQlSmartPolicyRule
  ): Promise<ApiiroGovernanceRuleValidationError[]> {
    try {
      await this.#client.put(`/governance/rules/${rule.key}`, rule);
      this.#asyncCache.invalidateAll(this.getRules);
      this.#asyncCache.invalidateAll(this.getRule, { key: rule.key });
      this.#asyncCache.invalidateAll(this.getRuleTags);

      return null;
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data instanceof Array) {
          return error.response.data;
        }
        return [
          {
            message: error.response.data?.message ?? error.response.data,
            errorCode: error.response.data?.errorCode,
          },
        ];
      }

      return [{ message: error }];
    }
  }
}
