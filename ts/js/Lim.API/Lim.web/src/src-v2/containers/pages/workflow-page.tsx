import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { Button } from '@src-v2/components/button-v2';
import { FormContext } from '@src-v2/components/forms';
import { SearchFilterInput } from '@src-v2/components/forms/search-input';
import { Gutters, StickyHeader } from '@src-v2/components/layout';
import { WorkflowsFirstTimeLayout } from '@src-v2/components/layout/first-time-layouts/workflows-first-time-layout';
import { PersistentSearchStateScroller } from '@src-v2/components/persistent-search-state/persistent-search-state-scroller';
import { TableControls } from '@src-v2/components/table/table-addons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useConfirmWorkflowDeleteModal } from '@src-v2/containers/workflow/hooks/use-confirm-delete-modal';
import {
  transformRecipeToWorkflow,
  transformWorkflowBeforeDisplay,
  transformWorkflowBeforeDuplication,
} from '@src-v2/containers/workflow/transformers';
import { Workflow, WorkflowCard } from '@src-v2/containers/workflow/workflow';
import { WorkflowModal } from '@src-v2/containers/workflow/workflow-modal';
import { WorkflowRecipes } from '@src-v2/containers/workflow/workflow-recipes';
import { resourceTypes } from '@src-v2/data/rbac-types';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useFilters } from '@src-v2/hooks/use-filters';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { Page } from '@src/src-v2/components/layout/page';

const WorkflowsPage = observer(() => {
  const { workflows, rbac, toaster, application } = useInject();
  const [editWorkflowModal, setModal, closeModal] = useModalState();
  const canEditWorkflows = rbac.canEdit(resourceTypes.Workflows);
  const { activeFilters } = useFilters();
  const { searchTerm } = activeFilters;
  const { pathname } = useLocation();

  const searchWorkflows = useSuspense(workflows.searchWorkflows);

  const handleEditWorkflow = useCallback(
    workflowData => setModal(<WorkflowModal workflowData={workflowData} closeModal={closeModal} />),
    [setModal, closeModal]
  );

  const handleCreateWorkflowFromRecipe = workflowData => {
    setModal(
      <WorkflowModal
        workflowData={transformRecipeToWorkflow(workflowData)}
        closeModal={closeModal}
      />
    );
  };

  const handleCreateWorkflow = useCallback(
    () => setModal(<WorkflowModal isNewWorkflow={true} closeModal={closeModal} />),
    [setModal, closeModal]
  );

  const handleDuplicateWorkflow = useCallback(
    workflowData =>
      setModal(
        <WorkflowModal
          workflowData={transformWorkflowBeforeDuplication(workflowData)}
          closeModal={closeModal}
        />
      ),
    [setModal, closeModal]
  );

  const handleDeleteWorkflow = useCallback(
    async workflowData => {
      try {
        await workflows.deleteWorkflow(workflowData.key);
        toaster.success(`Workflow ${workflowData.name} deleted successfully!`);
      } catch (error) {
        toaster.error(error.response.data);
      }
    },
    [workflows]
  );

  const [showDeleteModal, deleteModalElement] = useConfirmWorkflowDeleteModal({
    handleDeleteWorkflow,
  });

  const location = useLocation();
  const isEmptyState =
    application.isFeatureEnabled(FeatureFlag.EmptyStates) && !searchWorkflows?.count;

  return (
    <Page title="Workflows">
      <StickyHeader
        navigation={[
          { label: 'My Workflows', to: '/workflows/manager' },
          { label: 'Workflow Recipes', to: '/workflows/recipes' },
        ]}>
        {!isEmptyState && (
          <Tooltip content="Contact your admin to create a workflow" disabled={canEditWorkflows}>
            <Button onClick={handleCreateWorkflow} disabled={!canEditWorkflows} size={Size.LARGE}>
              Create workflow
            </Button>
          </Tooltip>
        )}
      </StickyHeader>
      {!isEmptyState && pathname.includes('manager') && (
        <Gutters>
          <TableControls>
            <SearchFilterInput
              key={searchTerm}
              defaultValue={searchTerm}
              placeholder={`Search by ${location.pathname.includes('recipes') ? 'recipe' : 'workflow'} name`}
              autoFocus
            />
          </TableControls>
        </Gutters>
      )}
      <Switch>
        <Route path="/workflows/recipes">
          <RecipesContainer>
            <WorkflowRecipes
              searchTerm={searchTerm}
              onRecipeSelect={handleCreateWorkflowFromRecipe}
            />
          </RecipesContainer>
        </Route>
        <Route path="/workflows/manager">
          {isEmptyState ? (
            <WorkflowsFirstTimeLayout onClick={handleCreateWorkflow} />
          ) : (
            <AsyncBoundary>
              <PersistentSearchStateScroller
                dataFetcher={workflows.searchWorkflows}
                itemTypeDisplayName="workflow"
                itemRender={workflow => (
                  <WorkflowItem
                    key={workflow.item.key}
                    workflow={workflow.item}
                    canEditWorkflows={canEditWorkflows}
                    handleEditWorkflow={handleEditWorkflow}
                    handleDuplicateWorkflow={handleDuplicateWorkflow}
                    showDeleteModal={showDeleteModal}
                  />
                )}
              />
            </AsyncBoundary>
          )}
        </Route>
      </Switch>
      {editWorkflowModal}
      {deleteModalElement}
    </Page>
  );
});

const WorkflowItem = ({
  workflow,
  canEditWorkflows,
  handleEditWorkflow,
  handleDuplicateWorkflow,
  showDeleteModal,
}) => {
  const data = useMemo(() => transformWorkflowBeforeDisplay(workflow), [workflow]);

  return (
    <FormContext
      // The goal of this FormContext is only to display the workflow data, hence no onSubmit is needed.
      onSubmit={null}
      displayPromptOnLeave={false}
      defaultValues={{ ...data, isReadonly: true }}>
      <WorkflowCard
        canEdit={canEditWorkflows}
        title={getWorkflowTitle(data)}
        editWorkflow={() => handleEditWorkflow(data)}
        deleteWorkflow={() => showDeleteModal(data)}
        duplicateWorkflow={() => handleDuplicateWorkflow(data)}>
        <Workflow />
      </WorkflowCard>
    </FormContext>
  );
};

export default WorkflowsPage;

const getWorkflowTitle = workflow =>
  workflow && workflow.ordinalId && workflow.name
    ? `FLOW-${workflow.ordinalId} · ${workflow.name}`
    : '';

const RecipesContainer = styled(Gutters)`
  margin-top: 5rem;
`;
