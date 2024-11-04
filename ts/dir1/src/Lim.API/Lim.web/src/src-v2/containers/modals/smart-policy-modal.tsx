import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FieldErrors, useFormContext } from 'react-hook-form';
import { FieldError } from 'react-hook-form/dist/types/errors';
import styled from 'styled-components';
import { ApiiroQlInterpolatedStringEditorFormControl } from '@src-v2/components/apiiroql-interpolated-string-editor/apiiroql-interpolated-string-editor-form-control';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { CircleButton, TextButton } from '@src-v2/components/button-v2';
import { FormContext } from '@src-v2/components/forms';
import { FormActions } from '@src-v2/components/forms/form-actions';
import {
  InputControl,
  ItemProps,
  RadioGroupControl,
  SelectControlV2,
} from '@src-v2/components/forms/form-controls';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { SvgIcon } from '@src-v2/components/icons';
import { AlertMessageModal } from '@src-v2/components/modals/alert-message-modal';
import { Modal } from '@src-v2/components/modals/modal-presenter';
import { usePopupModalPresenter } from '@src-v2/components/modals/popup-modal-presenter';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading1, Heading3 } from '@src-v2/components/typography';
import { riskLevelItems } from '@src-v2/containers/action-modals/override-risk/override-risk-level';
import {
  createGovernanceRuleTargetFromTargetObjectType,
  getTargetObjectTypeFromGovernanceRuleTarget,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { generateQuerySettingsUrl } from '@src-v2/containers/inventory-query/inventory-query-settings';
import { SmartPolicyEntityQueryEditorFormControl } from '@src-v2/containers/smart-policy/smart-policy-entity-query-editor';
import { useInject, useToggle } from '@src-v2/hooks';
import { ApiiroGovernanceRuleValidationError } from '@src-v2/services';
import { RiskCategory } from '@src-v2/types/enums/risk-category';
import { ApiiroQlSmartPolicyRule } from '@src-v2/types/governance/governance-rules';
import { StubAny } from '@src-v2/types/stub-any';
import { dataAttr } from '@src-v2/utils/dom-utils';

const policyEnableRadioOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const expressionIdentifiersToFieldNames = {
  RiskDescriptionExpression: 'descriptionExpression',
};

const riskCategoryItems: ItemProps[] = Object.keys(RiskCategory)
  .filter(riskCategoryKey => Number.isNaN(Number.parseInt(riskCategoryKey)))
  .map(riskCategoryKey => {
    const value = RiskCategory[riskCategoryKey as keyof typeof RiskCategory];

    return {
      key: riskCategoryKey,
      label: typeof value === 'string' ? value : riskCategoryKey,
    };
  });

const defaultNewSmartPolicyRuleSettings: Partial<ApiiroQlSmartPolicyRule> = {
  type: 'apiiroQlPolicyRule',
  isDisabled: false,
  configuredRiskLevel: null,
  configuredRiskCategory: null,
  configuredTags: [],
  governanceRuleTarget: { type: 'diffable', diffableTypeName: 'ApiElement' },
  riskDescriptionExpression: { type: 'tokenString', components: [], apiiroQlSource: '""' },
};

export const SmartPolicyModal: Modal<
  {
    editedRule?: ApiiroQlSmartPolicyRule;
    initialRuleEdits: Partial<ApiiroQlSmartPolicyRule>;
    governanceOptions: any;
  },
  string | null
> = ({ presentationContext, modalInput }) => {
  const { governance } = useInject();

  useEffect(() => {
    presentationContext.setTitle('Create policy');
    presentationContext.setExternalDismissHandler(() => true);
  }, []);

  const { popupModalPresenter, popupModalPresenterElement } = usePopupModalPresenter();

  const ruleKey = useMemo(() => modalInput.editedRule?.key ?? crypto.randomUUID(), [modalInput]);
  const ruleOrdinalId = useMemo(() => modalInput.editedRule?.ordinalId, [modalInput]);

  const [explorerQueryFullScreen, toggleExplorerQueryFullScreen] = useToggle(false);

  const initialRule = useMemo(
    () => ({
      ...(modalInput.editedRule || defaultNewSmartPolicyRuleSettings),
      ...modalInput.initialRuleEdits,
    }),
    [modalInput]
  );

  const initialFormData = useMemo(() => {
    return {
      enabled: initialRule.isDisabled ? 'false' : 'true',
      tags: (initialRule.configuredTags || []).map(tag => ({ key: tag, label: tag, value: tag })),
      name: initialRule.name,
      targetObjectType: getTargetObjectTypeFromGovernanceRuleTarget(
        initialRule.governanceRuleTarget
      ),
      entityPredicate: initialRule.riskQueryPredicateExpression,
      riskLevel: riskLevelItems.find(item => item.key === initialRule.configuredRiskLevel),
      riskCategory: riskCategoryItems.find(item => item.key === initialRule.configuredRiskCategory),
      descriptionExpression: initialRule.riskDescriptionExpression,
    };
  }, [modalInput]);

  const [serverValidationErrors, setServerValidationErrors] = useState<
    ApiiroGovernanceRuleValidationError[]
  >([]);

  const serverFormErrors = useMemo<FieldErrors>(() => {
    const errors: Record<string, FieldError & { editableExpressionErrors?: any[] }> = {};

    serverValidationErrors.forEach(validationError => {
      if (validationError.expressionIdentifier) {
        const field =
          expressionIdentifiersToFieldNames[
            validationError.expressionIdentifier as keyof typeof expressionIdentifiersToFieldNames
          ];
        if (field) {
          errors[field] = {
            type: 'validation',
            message: validationError.message,
            editableExpressionErrors: validationError.editableExpressionErrors,
          };
        }
      } else {
        errors.name = {
          type: 'validation',
          message: validationError.message,
        };
      }
    });

    return errors;
  }, [serverValidationErrors]);

  const handleSubmit = useCallback(
    async (formData: any) => {
      const updatedRule: ApiiroQlSmartPolicyRule = {
        key: ruleKey,
        ordinalId: ruleOrdinalId,
        name: formData.name,
        type: 'apiiroQlPolicyRule',
        isDisabled: formData.enabled === 'false',
        configuredTags: (formData.tags || []).map(
          (tag: { key: string; label: string; value: string }) => tag.value
        ),
        governanceRuleTarget: createGovernanceRuleTargetFromTargetObjectType(
          formData.targetObjectType,
          modalInput.governanceOptions
        ),
        riskQueryPredicateExpression: formData.entityPredicate,
        riskDescriptionExpression: formData.descriptionExpression,
        configuredRiskLevel: formData.riskLevel.key,
        configuredRiskCategory: formData.riskCategory.key,
      };

      const validationErrors = await governance.saveApiiroQlSmartPolicyRule(updatedRule);
      if (!validationErrors) {
        presentationContext.requestClose(updatedRule.key);
      } else {
        setServerValidationErrors(validationErrors);
      }
    },
    [presentationContext, modalInput.governanceOptions]
  );

  const handleMaximizeToggleButtonClicked = useCallback(
    (event: StubAny) => {
      toggleExplorerQueryFullScreen();
      event.preventDefault();
      event.stopPropagation();
    },
    [toggleExplorerQueryFullScreen]
  );

  const confirmFormCancel = useCallback(async () => {
    return await popupModalPresenter.showModal(AlertMessageModal, {
      title: 'Discard changes?',
      prompt: 'Are you sure you want to discard changes made to this Explorer Policy?',
      options: [{ caption: 'Discard', returnValue: 'discard', buttonVariant: Variant.ATTENTION }],
    });
  }, [popupModalPresenter]);

  const handleFormCancel = useCallback(async () => {
    if (await confirmFormCancel()) {
      presentationContext.requestClose(null);
    }
  }, [presentationContext, confirmFormCancel]);

  return (
    <FormContext
      defaultValues={initialFormData}
      onSubmit={handleSubmit}
      displayPromptOnLeave
      enableServerErrors
      serverErrors={serverFormErrors}
      form={FormLayoutV2}
      data-fullscreen={dataAttr(explorerQueryFullScreen)}>
      <FormLayoutV2.Container>
        {!explorerQueryFullScreen && (
          <FormLayoutV2.Section>
            <Heading1>{modalInput.editedRule ? 'Edit' : 'New'} policy</Heading1>

            <FormLayoutV2.Label>
              <RadioGroupControl
                size={Size.SMALL}
                horizontal
                name="enabled"
                options={policyEnableRadioOptions}
              />
            </FormLayoutV2.Label>

            <FormLayoutV2.Label>
              <Caption required>Policy name</Caption>
              <InputControl
                name="name"
                placeholder="Type a name for this policy..."
                rules={{ required: true }}
              />
            </FormLayoutV2.Label>

            <FormLayoutV2.Label>
              <Caption description="Add optional tags for grouping, filtering, and querying risks">
                Tags
              </Caption>
              <FullWidthTagEditor
                multiple
                creatable
                name="tags"
                searchMethod={governance.searchRuleTags}
              />
            </FormLayoutV2.Label>
          </FormLayoutV2.Section>
        )}

        <RiskQuerySection data-expand={explorerQueryFullScreen ? 'expand' : null}>
          <AsyncBoundary>
            <Heading3>Risk query</Heading3>
            <Tooltip content={explorerQueryFullScreen ? 'Exit full screen' : 'Full screen'}>
              <CircleButton
                onClick={handleMaximizeToggleButtonClicked}
                size={Size.MEDIUM}
                variant={Variant.TERTIARY}>
                <SvgIcon
                  size={Size.XSMALL}
                  name={explorerQueryFullScreen ? 'Minimize' : 'Maximize'}
                />
              </CircleButton>
            </Tooltip>
            <SmartPolicyEntityQueryEditorFormControl
              targetObjectTypeFieldName="targetObjectType"
              entityPredicateFieldName="entityPredicate"
            />
            <OpenInExplorerButton />
          </AsyncBoundary>
        </RiskQuerySection>

        {!explorerQueryFullScreen && (
          <ExpandableFormSection>
            <Heading3>Risk properties</Heading3>
            <FormCardHorizontalStack>
              <FormLayoutV2.Label>
                <Caption
                  required
                  description="Assign a severity to the risks generated by the policy, for filtering, querying, and prioritization">
                  Risk level
                </Caption>
                <SelectControlV2
                  name="riskLevel"
                  rules={{ required: true }}
                  options={riskLevelItems}
                  placeholder="Select risk level..."
                  formatOptionLabel={(option: ItemProps) => (
                    <>
                      {option.icon} {option.label}
                    </>
                  )}
                />
              </FormLayoutV2.Label>

              <FormLayoutV2.Label>
                <Caption
                  required
                  description="Choose a predefined risk group for filtering and querying risks">
                  Risk category
                </Caption>
                <SelectControlV2
                  name="riskCategory"
                  rules={{ required: true }}
                  options={riskCategoryItems}
                  placeholder="Select risk category..."
                />
              </FormLayoutV2.Label>
            </FormCardHorizontalStack>

            <FormLayoutV2.Label>
              <Caption
                required
                description={
                  <>
                    The text you enter in the Description field is enriched with embedded “smart
                    chips”.
                    <br />
                    Each smart chip contains an expression that’s evaluated when a new risk is
                    generated from the policy.
                    <br />
                    The result generates the risk description that you see in the Apiiro interface.
                  </>
                }>
                Risk Description
              </Caption>
              <ApiiroQlInterpolatedStringEditorFormControl
                name="descriptionExpression"
                formErrors={serverFormErrors}
                objectTypeFieldName="targetObjectType"
              />
            </FormLayoutV2.Label>
          </ExpandableFormSection>
        )}
      </FormLayoutV2.Container>
      <FormLayoutV2.Footer>
        <FormLayoutV2.Actions>
          <FormActions allowSubmitNonDirty={!modalInput.editedRule} onCancel={handleFormCancel} />
        </FormLayoutV2.Actions>
      </FormLayoutV2.Footer>
      {popupModalPresenterElement}
    </FormContext>
  );
};

function OpenInExplorerButton() {
  const { watch } = useFormContext();

  const link = generateQuerySettingsUrl({
    objectType: watch('targetObjectType'),
    query: watch('entityPredicate')?.queryTree,
  });

  return (
    <ViewInExplorerRowContainer>
      <TextButton showArrow="external" underline href={link}>
        View in Explorer
      </TextButton>
    </ViewInExplorerRowContainer>
  );
}

const FormCardHorizontalStack = styled.div`
  display: grid;
  grid-template-columns: 40% 40%;
  gap: 4rem;
`;

function Caption({
  required = false,
  description,
  children,
}: {
  required?: boolean;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <CaptionContainer>
      <CaptionText required={required}>{children}</CaptionText>
      {description && <InfoTooltipWithHover content={description} />}
    </CaptionContainer>
  );
}

const CaptionContainer = styled.div`
  display: inline-flex;
`;

const CaptionText = styled(({ required, ...props }) => (
  <span {...props} data-required={dataAttr(Boolean(required))} />
))`
  display: flex;
  align-items: center;
  color: var(--color-blue-gray-70);
  font-size: 3.5rem;

  &[data-required]:after {
    content: '*';
    color: var(--color-red-50);
  }
`;

const FullWidthTagEditor = styled(SelectControlV2)`
  width: 100%;
  max-width: none;
`;

const ExpandableFormSection = styled(FormLayoutV2.Section)`
  &[data-expand='expand'] {
    max-width: calc(100% - 10rem);
    flex-grow: 1;
  }
`;

const RiskQuerySection = styled(ExpandableFormSection)`
  position: relative;

  ${CircleButton} {
    position: absolute;
    right: 4rem;
    top: 4rem;
  }
`;

const ViewInExplorerRowContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const InfoTooltipWithHover = styled(InfoTooltip)`
  &:hover {
    color: var(--color-blue-gray-60);
  }
`;
