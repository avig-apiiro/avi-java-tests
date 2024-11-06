import { useCallback } from 'react';
import styled from 'styled-components';
import {
  AnalyticsDataField,
  AnalyticsEventName,
  useTrackAnalytics,
} from '@src-v2/components/analytics-layer';
import { AsyncBoundary } from '@src-v2/components/async-boundary';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { InputControl, SelectControl } from '@src-v2/components/forms/form-controls';
import { Field, Label } from '@src-v2/components/forms/modal-form-layout';
import { pathExists } from '@src-v2/containers/inventory-query/inventory-query-sidebar/library-utils';
import { useInject, useSuspense } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';

export const useSaveQueryModal = (isRename = false) => {
  const [modalElement, setModal, closeModal] = useModalState();

  const showModal = (handleSubmit, libraryName, queryTitle) => {
    setModal(
      <AsyncBoundary>
        <SaveQueryModal
          closeModal={closeModal}
          handleSubmit={handleSubmit}
          libraryName={libraryName}
          defaultName={queryTitle}
          isRename={isRename}
        />
      </AsyncBoundary>
    );
  };
  return [showModal, modalElement] as const;
};

const SaveQueryModal = ({ closeModal, handleSubmit, libraryName, defaultName, isRename }) => {
  const { inventoryQuery } = useInject();
  const folders = useSuspense(inventoryQuery.getFavoritesFoldersNames, {
    libraryName,
  });
  const tree = useSuspense(inventoryQuery.getBetaFeatureFavoriteQueriesLibrary, {
    libraryName,
  });

  const trackAnalytics = useTrackAnalytics();

  const validateQuerySettings = useCallback(
    querySettings => {
      const { folder, name } = querySettings;
      const savePath = folder ? [folder, name] : [name];

      if (!querySettings.name) {
        return 'Query name is required';
      }
      if (pathExists(tree, savePath)) {
        return 'Query path already exists';
      }
    },
    [inventoryQuery]
  );

  return (
    <ConfirmationModal
      onError={null}
      title={isRename ? 'Rename Query' : 'Save query'}
      onSubmit={data => {
        const errorMessage = validateQuerySettings(data);
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        handleSubmit({
          ...data,
          newFolderToCreate: data.folder?.value,
        });
        trackAnalytics(AnalyticsEventName.ActionClicked, {
          [AnalyticsDataField.ActionType]: 'Save query as',
        });
        closeModal();
      }}
      submitText={isRename ? 'Rename' : 'Save'}
      onClose={closeModal}
      cancelText="Cancel">
      <Field>
        <Label required>Name</Label>
        <InputControl autoFocus name="name" defaultValue={defaultName} />
      </Field>

      {!isRename && (
        <Field>
          <Label data-required="true">Location</Label>
          <FolderContorl
            creatable
            appendTo="parent"
            items={folders}
            name="folder"
            label="Folder"
            placeholder="Select or create a folder"
          />
        </Field>
      )}
    </ConfirmationModal>
  );
};

const FolderContorl = styled(SelectControl)`
  width: 100%;
`;
