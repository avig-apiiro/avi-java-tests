import { observer } from 'mobx-react';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { LogoSpinner } from '@src-v2/components/animations/spinner';
import { Button } from '@src-v2/components/button-v2';
import { InlineButton, TextIconButton } from '@src-v2/components/buttons';
import { Dropdown } from '@src-v2/components/dropdown';
import { FileReaderButton } from '@src-v2/components/file-reader-button';
import { DiscardModal } from '@src-v2/components/forms/form-actions';
import { Textarea } from '@src-v2/components/forms/textarea';
import { BaseIcon, SvgIcon } from '@src-v2/components/icons';
import { CommonInventoryQueryResultCells } from '@src-v2/components/inventory-query-result-cells';
import { Gutters } from '@src-v2/components/layout';
import { usePageModalPresenter } from '@src-v2/components/modals/page-modal-presenter';
import { SelectMenu } from '@src-v2/components/select-menu';
import { TableControls } from '@src-v2/components/table/table-addons';
import { Size } from '@src-v2/components/types/enums/size';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { ExternalLink, NavLink } from '@src-v2/components/typography';
import {
  CreateRuleActionButton,
  InventoryQueryToRuleModal,
  useValidateQueryToRule,
} from '@src-v2/containers/inventory-query/create-rule-action-button';
import { InventoryQueryEditor } from '@src-v2/containers/inventory-query/inventory-query-editor';
import {
  createGovernanceRuleTargetFromTargetObjectType,
  inventoryQueryObjectOptions,
} from '@src-v2/containers/inventory-query/inventory-query-object-options';
import { InventoryQueryResultsPane } from '@src-v2/containers/inventory-query/inventory-query-results-pane';
import {
  InventoryQuerySettings,
  createExportedQuerySettings,
  createNewQuerySettingsForObjectType,
  createQuerySettingsAnalyticsData,
  generateApiiroQlForQuerySettings,
  generateQuerySettingsUrl,
  loadExportedQuerySettingsJson,
  useImportQuery,
} from '@src-v2/containers/inventory-query/inventory-query-settings';
import { useSaveQueryModal } from '@src-v2/containers/inventory-query/modals/inventory-query-save-modal';
import { SmartPolicyModal } from '@src-v2/containers/modals/smart-policy-modal';
import { SplitView } from '@src-v2/containers/split-view/split-view';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { useInventoryQueryResultsTable } from '@src-v2/models/apiiroql-query/inventory-query-results-table';
import {
  ApiiroQlSchema,
  createQExpressionSchemaForQueriedType,
} from '@src-v2/models/apiiroql-query/query-tree-schema-builder';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { downloadFile } from '@src-v2/utils/dom-utils';

type InventoryQueryTabProperties = {
  initialQuerySettings: InventoryQuerySettings;
  queryTitle: string;
  onDirtyUpdated: (dirty: boolean) => void;
  apiiroQlSchema: ApiiroQlSchema;
  initialSuggestedSavePath: string[] | null;
  onTabSaved: (newPath: string[], newName: string, oldName: string) => void;
};

export const InventoryQueryTab = observer(
  ({
    queryTitle,
    onTabSaved,
    initialSuggestedSavePath,
    initialQuerySettings,
    onDirtyUpdated,
    apiiroQlSchema,
  }: InventoryQueryTabProperties) => {
    const { inventoryQuery, toaster, application, rbac } = useInject();
    const trackAnalytics = useTrackAnalytics();
    const [modalElement, setModal, closeModal] = useModalState();

    const [querySettings, setQuerySettings] = useState(
      initialQuerySettings ||
        createNewQuerySettingsForObjectType(
          inventoryQueryObjectOptions[0],
          createQExpressionSchemaForQueriedType(
            apiiroQlSchema,
            inventoryQueryObjectOptions[0].typeName
          )
        )
    );
    const { query } = querySettings;
    const setQuery = useCallback(
      query => setQuerySettings(querySettings => ({ ...querySettings, query })),
      [setQuerySettings]
    );
    const [dirty, setDirtyState] = useState(false);
    const setDirty = useCallback(
      dirty => {
        setDirtyState(dirty);
        onDirtyUpdated?.(dirty);
      },
      [setDirtyState, dirty]
    );
    const [suggestedSavePath, setSuggestedSavePath] = useState(initialSuggestedSavePath);

    const validationQueryToRuleResult = useValidateQueryToRule(querySettings, apiiroQlSchema);
    const pageModalPresenter = usePageModalPresenter();
    const showRuleSaveSuccessToaster = useCallback(
      (ruleKey: string) =>
        toaster.success(
          <>
            Policy was created successfully.{' '}
            <NavLink to={`/governance/rules#${ruleKey}`}>View created policy</NavLink>
          </>
        ),
      [toaster]
    );
    const handleRuleCreateModalClose = useCallback(
      (result: string | false) => {
        closeModal();
        if (result) {
          showRuleSaveSuccessToaster(result);
        }
      },
      [closeModal, showRuleSaveSuccessToaster]
    );

    const handleOpenRuleModal = useCallback(
      async (_, governanceOptions: any) => {
        if (application.isFeatureEnabled(FeatureFlag.SmartPolicies)) {
          const createdRuleKey = await pageModalPresenter.showModal(SmartPolicyModal, {
            initialRuleEdits: {
              type: 'apiiroQlPolicyRule',
              name: queryTitle || '',
              governanceRuleTarget: createGovernanceRuleTargetFromTargetObjectType(
                querySettings.objectType,
                governanceOptions
              ),
              riskQueryPredicateExpression: {
                type: 'queryTree',
                queryTree: querySettings.query,
                apiiroQlSource: generateApiiroQlForQuerySettings(querySettings, querySchema),
              },
            },
            governanceOptions,
          });

          if (createdRuleKey) {
            showRuleSaveSuccessToaster(createdRuleKey);
          }
        } else {
          setModal(
            <InventoryQueryToRuleModal
              queryTitle={queryTitle}
              generatedApiiroQl={validationQueryToRuleResult.apiiroQlResult}
              queriedTypeName={querySettings.objectType?.typeName}
              onClose={handleRuleCreateModalClose}
            />
          );
        }
      },
      [
        queryTitle,
        validationQueryToRuleResult.apiiroQlResult,
        querySettings.objectType?.typeName,
        showRuleSaveSuccessToaster,
      ]
    );

    const [showSaveQueryModal, saveModalElement] = useSaveQueryModal();
    const [gateDiscardingOperationModalElement, gateDiscardingOperation] =
      useGateDiscardingOperation();

    const inventoryQueryResultsTable = useInventoryQueryResultsTable({
      columnsGenerator: CommonInventoryQueryResultCells,
    });
    const [tableEnabled, setTableEnabled] = useState(false);

    const querySchema = useMemo(
      () =>
        createQExpressionSchemaForQueriedType(apiiroQlSchema, querySettings.objectType.typeName),
      [apiiroQlSchema, querySettings]
    );

    const isFreeTextEnabled = useMemo(
      () => application.isFeatureEnabled(FeatureFlag.FreeTextExplorerQueries),
      [application]
    );
    const sessionId = useMemo(() => crypto.randomUUID(), []);
    const [isTranslationInProcess, setIsTranslationInProcess] = useState(false);
    const [freeTextQueryValue, setFreeTextQueryValue] = useState('');

    const handleRunQueryClick = useCallback(() => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Run',
        ...createQuerySettingsAnalyticsData(querySettings),
      });

      const apiiroQlQuery = generateApiiroQlForQuerySettings(querySettings, querySchema);
      setTableEnabled(true);
      inventoryQueryResultsTable.executeQuery({
        queriedType: querySettings.objectType.typeName,
        query: apiiroQlQuery,
        projectionFields: [],
        aggregationDefinition: querySettings.aggregation,
      });
    }, [querySchema, query, querySettings, trackAnalytics]);

    const handleClearQueryClick = useCallback(() => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Clear query',
      });

      setQuerySettings(createNewQuerySettingsForObjectType(querySettings.objectType, querySchema));
      setDirty(false);
    }, [setQuerySettings, querySettings, querySchema, setDirty]);

    const handleCopyLinkClick = useCallback(async () => {
      const link = generateQuerySettingsUrl(querySettings);
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Copy link',
        [AnalyticsDataField.QueryLink]: link,
      });

      await navigator.clipboard.writeText(link);
      toaster.success('Link copied to clipboard.');
    }, [querySettings]);

    const handleExportQueryClick = useCallback(async () => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Export query',
      });
      downloadFile(
        `${queryTitle}.query.json`,
        createExportedQuerySettings(querySettings),
        'application/json'
      );
      await inventoryQuery.logQueryExport(
        initialSuggestedSavePath,
        generateQuerySettingsUrl(querySettings)
      );
    }, [querySettings, queryTitle]);

    const handleExportQueryToApiClick = useCallback(() => {
      trackAnalytics(AnalyticsEventName.ActionClicked, {
        [AnalyticsDataField.ActionType]: 'Export query',
      });

      downloadFile(
        `${queryTitle}.apiiroqlapi.json`,
        JSON.stringify({
          queriedType: querySettings.objectType.typeName,
          query: generateApiiroQlForQuerySettings(querySettings, querySchema),
          aggregationDefinition: querySettings.aggregation,
          resultsLimit: 10000,
        }),
        'application/json'
      );
    }, [querySettings, queryTitle, querySchema, query]);

    const handleImportQuery = useImportQuery(
      useCallback(
        querySettings =>
          gateDiscardingOperation(dirty, queryTitle, () => {
            trackAnalytics(AnalyticsEventName.ActionClicked, {
              [AnalyticsDataField.ActionType]: 'Import',
            });
            setQuerySettings(querySettings);
          }),
        [gateDiscardingOperation, setQuery, dirty, queryTitle]
      )
    );

    const handleQuerySettingsChange = useCallback(
      (newQuerySettings: InventoryQuerySettings) => {
        setQuerySettings(newQuerySettings);
        setDirty(true);
      },
      [setQuerySettings, setDirty]
    );

    const saveQuery = useCallback(
      async ({ savePath, newFolderToCreate = '', folder = '', name }) => {
        const libraryName = 'explorer.userFavorites';

        const path = savePath
          ? savePath
          : newFolderToCreate
            ? [newFolderToCreate]
            : folder
              ? [folder]
              : [];

        if (newFolderToCreate) {
          await inventoryQuery.createFavoritesFolder({
            libraryName,
            folderPath: [newFolderToCreate],
          });
        }

        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Save query ',
        });

        await inventoryQuery.saveFavoritesItem({
          libraryName,
          savePath: path,
          name,
          querySettings,
          queryUrl: generateQuerySettingsUrl(querySettings),
        });

        setDirty(false);
        setSuggestedSavePath([...path, name]);
        onTabSaved(path, name, queryTitle);
      },
      [querySettings, setDirty]
    );

    const handleSaveQueryClick = useCallback(async () => {
      try {
        if (!suggestedSavePath) {
          handleSaveQueryAsClick();
        } else {
          const savePath = [...suggestedSavePath];
          const name = savePath.pop();
          await saveQuery({ savePath, name });
        }
      } catch (error) {
        console.error(error);
      }
    }, [suggestedSavePath, queryTitle, saveQuery]);

    const handleSaveQueryAsClick = useCallback(() => {
      showSaveQueryModal(saveQuery, 'explorer.userFavorites', queryTitle);
    }, [saveQuery, queryTitle, showSaveQueryModal]);

    const handleFreeTextQueryUpdated = event => {
      setFreeTextQueryValue(event.target.value);
    };

    const handleTranslateQueryClick = useCallback(async () => {
      setIsTranslationInProcess(true);
      let translationsAttemptsLeft = 3;
      let error_message = '';
      while (translationsAttemptsLeft > 0) {
        let predictorGeneratedQuery = '';
        try {
          predictorGeneratedQuery = await inventoryQuery.translateToExplorerQuery(
            freeTextQueryValue,
            sessionId,
            error_message,
            querySettings
          );
        } catch (e) {
          break;
        }
        try {
          const generatedQuerySettings = loadExportedQuerySettingsJson(
            apiiroQlSchema,
            predictorGeneratedQuery
          );
          setQuerySettings(generatedQuerySettings);
          translationsAttemptsLeft = 0;
        } catch (e) {
          error_message = e.message;
          translationsAttemptsLeft -= 1;
        }
      }
      setIsTranslationInProcess(false);
    }, [inventoryQuery, freeTextQueryValue]);

    return (
      <>
        <SplitView minSizes={[300]} defaultSizes={[400]}>
          <VerticalSplitView>
            <QueryEditorAndControlsStack>
              <>
                {gateDiscardingOperationModalElement}
                <ButtonsRow>
                  <FileReaderButton
                    fileType=".json"
                    button={({ onClick }) => (
                      <TextIconButton
                        onClick={onClick}
                        button={InlineButton}
                        iconName="Import"
                        status="secondary">
                        Import
                      </TextIconButton>
                    )}
                    onChange={handleImportQuery}
                  />
                  <TabOptionsSelectMenu
                    leftIconName="Save"
                    placeholder="Save"
                    disabled={!rbac.canEdit(resourceTypes.ExplorerFavorites)}>
                    <Dropdown.Item onClick={handleSaveQueryClick}>Save</Dropdown.Item>
                    <Dropdown.Item onClick={handleSaveQueryAsClick}>Save As...</Dropdown.Item>
                  </TabOptionsSelectMenu>
                  <TabOptionsSelectMenu leftIconName="Share" placeholder="Share">
                    <Dropdown.Item onClick={handleCopyLinkClick}>Copy link</Dropdown.Item>
                    <Dropdown.Item onClick={handleExportQueryClick}>Export query</Dropdown.Item>
                    <Dropdown.Item onClick={handleExportQueryToApiClick}>
                      Export ApiiroQL query API body
                    </Dropdown.Item>
                  </TabOptionsSelectMenu>

                  <CreateRuleActionButton
                    validationResult={validationQueryToRuleResult}
                    canEditGovernancePolicies={rbac.canEdit(resourceTypes.GovernancePolicies)}
                    onClick={handleOpenRuleModal}
                    queriedTypeName={querySettings.objectType.typeName}
                  />

                  <FlexSpacer />

                  <NeedHelpContainer>
                    <SvgIcon name="Help" />

                    <DocumentationLink href="https://docs.apiiro.com/risk-graph-explorer/risk_explorer">
                      View documentation
                    </DocumentationLink>
                  </NeedHelpContainer>
                </ButtonsRow>

                <TopLevelQueryContainer>
                  <QueryArea>
                    <InventoryQueryEditor
                      apiiroQlSchema={apiiroQlSchema}
                      querySettings={querySettings}
                      onQuerySettingsChange={handleQuerySettingsChange}
                    />
                  </QueryArea>
                  <QueryAreaBottomButtonsRow>
                    <Button
                      startIcon="Play"
                      variant={Variant.PRIMARY}
                      onClick={handleRunQueryClick}
                      size={Size.LARGE}>
                      Run
                    </Button>
                    <Button
                      startIcon="Trash"
                      variant={Variant.SECONDARY}
                      onClick={handleClearQueryClick}
                      size={Size.LARGE}>
                      Clear
                    </Button>
                  </QueryAreaBottomButtonsRow>
                </TopLevelQueryContainer>
              </>
            </QueryEditorAndControlsStack>
            {isFreeTextEnabled && (
              <TextareaContainer>
                <ButtonsRow>
                  <Button
                    disabled={!freeTextQueryValue || isTranslationInProcess}
                    startIcon="Play"
                    variant={Variant.PRIMARY}
                    onClick={handleTranslateQueryClick}>
                    Generate Explorer Query
                  </Button>
                  {isTranslationInProcess && <LogoSpinner />}
                </ButtonsRow>
                <Textarea
                  placeholder="APIs in high business impact application, that exposes PIIs."
                  onChange={handleFreeTextQueryUpdated}
                  rows={14}
                />
              </TextareaContainer>
            )}
          </VerticalSplitView>
          {!tableEnabled && <Gutters />}
          {tableEnabled && (
            <InventoryQueryResultsPane
              inventoryQueryResultsTable={inventoryQueryResultsTable}
              queryTitle={queryTitle}
            />
          )}
          {modalElement}
        </SplitView>
        {saveModalElement}
      </>
    );
  }
);

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 2rem;

  width: 100%;

  ${TableControls.Filters} {
    flex-grow: 0;
  }
`;

const TopLevelQueryContainer = styled.div`
  position: relative;

  flex-grow: 1;

  padding: 4rem 0 4rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;

  background: white;
  border: solid 1px;
  border-color: var(--color-blue-gray-30);
  border-radius: 3rem;

  min-height: 48rem;
`;

const QueryArea = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  overflow-y: auto;
`;

const QueryAreaBottomButtonsRow = styled(ButtonsRow)`
  position: absolute;

  right: 4rem;
  bottom: 4rem;

  width: unset;
`;

const FlexSpacer = styled.div`
  flex-grow: 1;
`;

const NeedHelpContainer = styled.div`
  font-size: var(--font-size-m);
  align-items: center;
  display: flex;
  gap: 1rem;

  ${BaseIcon} {
    color: var(--color-blue-gray-50);
  }
`;

const QueryEditorAndControlsStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
  gap: 5rem;
  padding: 5rem 0;
`;

const TabOptionsSelectMenu = styled(SelectMenu)`
  padding: 0 3rem;
`;

const TextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5rem;
  gap: 5rem;
  height: 100%;
`;

const VerticalSplitView = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;

  > *:nth-child(1) {
    flex: 3;
  }

  > *:nth-child(2) {
    flex: 1;
  }
`;

const DocumentationLink = styled(ExternalLink)`
  font-size: var(--font-size-s);
`;

export function useGateDiscardingOperation() {
  const [modalElement, setModal, closeModal] = useModalState();

  const gateDiscardingOperation = useCallback(
    (isDirty: boolean, queryTitle: string, action: () => void) => {
      return new Promise<boolean>(resolve => {
        if (!isDirty) {
          action();
          resolve(true);
        } else {
          setModal(
            <DiscardModal
              title="Discard query?"
              submitText="Discard"
              onSubmit={() => {
                closeModal();
                action();
                resolve(true);
              }}
              onClose={() => {
                closeModal();
                resolve(false);
              }}>
              There are unsaved changes in query ‘{queryTitle}’ that will be deleted.
              <br />
              Are you sure?
            </DiscardModal>
          );
        }
      });
    },
    [setModal, closeModal]
  );

  return [modalElement, gateDiscardingOperation] as const;
}
