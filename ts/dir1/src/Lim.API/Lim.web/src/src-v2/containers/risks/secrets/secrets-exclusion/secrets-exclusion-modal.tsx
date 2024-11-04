import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Form } from '@src-v2/components/forms/form-layout';
import { Modal } from '@src-v2/components/modals';
import { SecretsExclusionExamples } from '@src-v2/containers/risks/secrets/secrets-exclusion/secrets-exclusion-examples';
import { SecretsExclusionForm } from '@src-v2/containers/risks/secrets/secrets-exclusion/secrets-exclusion-form';
import { useInject } from '@src-v2/hooks';
import { SecretsExclusionDefinition } from '@src-v2/services';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';

interface SecretsExclusionModalProps {
  onClose: () => void;
  onSubmit: (itemsToSave: SecretsExclusionDefinition) => void;
  definition?: SecretsExclusionDefinition;
}

export const SecretsExclusionModal = styled(
  ({ onSubmit, onClose, definition, ...props }: SecretsExclusionModalProps) => {
    const { rbac } = useInject();

    const transformAndSubmit = useCallback(
      (itemToSave: SecretsExclusionDefinition) => {
        if (containsAnyElement(itemToSave.repositories)) {
          itemToSave.repositories = [];
          itemToSave.anyRepository = true;
        } else {
          itemToSave.anyRepository = false;
        }

        if (containsAnyElement(itemToSave.applications)) {
          itemToSave.applications = [];
          itemToSave.anyApplication = true;
        } else {
          itemToSave.anyApplication = false;
        }

        return onSubmit(itemToSave);
      },
      [onSubmit]
    );

    const editedDefinition = useMemo(() => {
      if (_.isNil(definition)) {
        return newDefinition();
      }

      if (definition.anyRepository) {
        definition.repositories = [{ key: 'Any', name: 'Any' }];
      }

      if (definition.anyApplication) {
        definition.applications = [{ key: 'Any', name: 'Any' }];
      }

      return definition;
    }, [definition]);

    const missingPermissions = useMemo(
      () =>
        !_.isNil(definition) &&
        ((!definition.anyRepository &&
          definition.repositoryKeys.length !== definition.repositories.length) ||
          (!definition.anyApplication &&
            definition.applicationKeys.length !== definition.applications.length) ||
          (!rbac.hasGlobalScopeAccess && (definition.anyApplication || definition.anyRepository))),
      [definition]
    );

    return (
      <ConfirmationModal
        {...props}
        as={Form}
        title="Define secrets exclusion"
        defaultValues={editedDefinition}
        submitText={definition ? 'Save' : 'Create'}
        onSubmit={transformAndSubmit}
        onClose={onClose}>
        <SecretsExclusionWrapper>
          <SecretsExclusionForm missingPermissions={missingPermissions} />
          <VerticalDivider />
          <SecretsExclusionExamples />
        </SecretsExclusionWrapper>
      </ConfirmationModal>
    );
  }
)`
  width: 269rem;

  ${Modal.Header} {
    padding-bottom: 1rem;
  }
`;

function containsAnyElement(elements: Partial<LeanConsumableProfile>[]) {
  return !_.isNil(elements?.find(_ => _.key === 'Any'));
}

const SecretsExclusionWrapper = styled.div`
  display: flex;
  margin-bottom: 8rem;
`;

const VerticalDivider = styled.div`
  flex-grow: 0;
  border-left: 0.25rem solid var(--color-blue-gray-30);
  margin: 0 8rem;
`;

function newDefinition(): Partial<SecretsExclusionDefinition> {
  return {
    key: crypto.randomUUID(),
    name: '',
    filesPathRegex: [],
    regexMatch: [],
    repositoryKeys: [],
    applicationKeys: [],
    anyRepository: false,
    anyApplication: false,
  };
}
