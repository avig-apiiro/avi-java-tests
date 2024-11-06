import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { Button } from '@src-v2/components/button-v2';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { createGovernanceRuleTargetFromTargetObjectType } from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { InventoryQuerySettings } from '@src-v2/containers/inventory-query/inventory-query-settings';
import { useInject, useSuspense } from '@src-v2/hooks';
import {
  CodeGenerationErrorInvalidProperty,
  generateApiiroQl,
} from '@src-v2/models/apiiroql-query/apiiroql-generator';
import {
  ApiiroQlSchema,
  createQExpressionSchemaForVariant,
} from '@src-v2/models/apiiroql-query/query-tree-schema-builder';
import { CategorySelect } from '@src/blocks/GovernancePage/blocks/CategorySelect';
import { ProcessTags } from '@src/blocks/GovernancePage/blocks/ProcessTags';
import Rule from '@src/blocks/GovernancePage/blocks/Rule';
import { filterReadOnlyGivenOptions, filterReadOnlyOptions } from '@src/blocks/GovernancePage/view';
import {
  EditRuleModal,
  EditRuleModalErrorContextProvider,
} from '@src/components/Rule/EditRuleModal';
import rulesService from '@src/services/rulesService';

export function CreateRuleActionButton({
  validationResult,
  onClick,
  queriedTypeName,
  canEditGovernancePolicies,
}: {
  validationResult: {
    isValid: boolean;
    reason?: string;
    apiiroQlResult?: string;
  };
  onClick: Function;
  queriedTypeName: string;
  canEditGovernancePolicies: boolean;
}) {
  const { governance, asyncCache } = useInject();
  const trackAnalytics = useTrackAnalytics();

  const handleCreate = useCallback(async () => {
    const [rules, ruleOptions] = await Promise.all([
      asyncCache.suspend(governance.getRules),
      asyncCache.suspend(governance.getRuleOptions),
    ]);

    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Create Policy',
      [AnalyticsDataField.QueryType]: queriedTypeName,
    });

    onClick(rules, ruleOptions);
  }, [onClick]);

  const isValid = canEditGovernancePolicies && validationResult.isValid;
  const reason = !canEditGovernancePolicies
    ? 'Contact your admin to edit or delete a policy'
    : validationResult.reason;

  return (
    <Tooltip content={reason} disabled={isValid}>
      <div>
        <Button
          variant={Variant.SECONDARY}
          startIcon="Rules"
          size={Size.LARGE}
          disabled={!isValid}
          onClick={handleCreate}>
          Create policy
        </Button>
      </div>
    </Tooltip>
  );
}

export function InventoryQueryToRuleModal({
  queryTitle,
  generatedApiiroQl,
  queriedTypeName,
  onClose,
}: {
  queryTitle: string;
  generatedApiiroQl: string;
  queriedTypeName: string;
  onClose: (ruleKey: string | false) => void;
}) {
  const { governance } = useInject();

  const trackAnalytics = useTrackAnalytics();
  const [rules, options] = useSuspense([
    [governance.getRules] as const,
    [governance.getRuleOptions] as const,
  ]);

  const [editErrors, setEditErrors] =
    useState<{ message: string; rulePortionType?: 'Given' | 'When' | 'Then' }[]>();

  const generatedRule = useMemo(() => {
    let rule = {
      ...rulesService.newRule(filterReadOnlyOptions(options)),
      name: queryTitle,
      isDuplicated: true,
    };
    rule = rulesService.setOption(
      rule,
      {
        portion: 'when',
        index: 0,
        type: 'EntitySatisfiesExpression',
        subType: queriedTypeName,
        values: [generatedApiiroQl],
      },
      options
    );
    rule = rulesService.addProperty(
      rule,
      { optionIndex: 0, portion: 'when', type: 'Type' },
      options
    );

    return rule;
  }, []);

  const errorMessage = useMemo(
    () => editErrors?.map(error => error.message).join(', '),
    [editErrors]
  );

  const handleConfirm = useCallback(async rule => {
    trackAnalytics(AnalyticsEventName.ActionClicked, {
      [AnalyticsDataField.ActionType]: 'Create Policy confirmed',
      [AnalyticsDataField.QueryType]: queriedTypeName,
    });

    const resultErrors = await governance.saveRule(rule);
    if (!resultErrors?.length) {
      onClose(rule.key);
      return;
    }

    setEditErrors(resultErrors);
    return true;
  }, []);

  return (
    <EditRuleModalErrorContextProvider errorMessage={errorMessage}>
      <EditRuleModal
        ruleTitleName="policy"
        rule={generatedRule}
        rules={rules}
        options={options}
        filterReadOnlyOptions={filterReadOnlyOptions}
        onConfirm={handleConfirm}
        onCancel={() => onClose(false)}
        sideComponent={props => (
          <>
            <CategorySelect required {...props} />
            <ProcessTags {...props} />
          </>
        )}
        ruleByDefinition={undefined}
        setRuleByDefinition={undefined}
        openedCreateRuleFromBanner={undefined}
        setOpenedCreateRuleFromBanner={undefined}>
        {props => (
          <Rule
            {...props}
            validationErrors={editErrors}
            is
            filterReadOnlyGivenOptions={filterReadOnlyGivenOptions}
          />
        )}
      </EditRuleModal>
    </EditRuleModalErrorContextProvider>
  );
}

export function useValidateQueryToRule(
  querySettings: InventoryQuerySettings,
  apiiroQlSchema: ApiiroQlSchema
) {
  const { governance, asyncCache } = useInject();
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    reason?: string;
    apiiroQlResult?: string;
  }>({ isValid: false });

  useEffect(() => {
    validate();

    async function validate() {
      if (!apiiroQlSchema) {
        setValidationResult({ isValid: false });
        return;
      }

      const options = await asyncCache.suspend(governance.getRuleOptions);

      if (!createGovernanceRuleTargetFromTargetObjectType(querySettings.objectType, options)) {
        setValidationResult({
          isValid: false,
          reason: `Cannot create rule based on ${querySettings.objectType.displayName}`,
        });
        return;
      }

      try {
        const qExpressionSchema = createQExpressionSchemaForVariant(
          apiiroQlSchema,
          'ApiiroQlRiskDiffableCondition'
        );
        const apiiroQlResult = generateApiiroQl(
          qExpressionSchema[querySettings.objectType.typeName],
          qExpressionSchema,
          'subject',
          querySettings.query
        );
        setValidationResult({
          isValid: true,
          apiiroQlResult,
        });
      } catch (error: any) {
        const validationError =
          error instanceof CodeGenerationErrorInvalidProperty
            ? `Cannot use property "${error.propertyName}" in a rule`
            : error?.message ?? 'Cannot create rule based on the current query';

        setValidationResult({
          isValid: false,
          reason: validationError,
        });
      }
    }
  }, [apiiroQlSchema, querySettings]);

  return validationResult;
}
