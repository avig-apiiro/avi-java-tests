import _ from 'lodash';
import styled from 'styled-components';
import { ConfirmationModal } from '@src-v2/components/confirmation-modal';
import { Modal } from '@src-v2/components/modals';
import { SecretsExclusionDefinitionForm } from '@src/blocks/GovernancePage/blocks/Definitions/SecretsExclusionDefinitionForm';

export const SecretsExclusionDefinitionModal = styled(
  ({ definition, onSubmit, onClose, ...props }) => (
    <ConfirmationModal
      {...props}
      title="Secrets Exclusion Definition"
      submitText={definition ? 'Save' : 'Create'}
      defaultValues={definition ?? newDefinition()}
      resolver={secretsExclusionDefinitionResolver}
      mode="onChange"
      onSubmit={onSubmit}
      onClose={onClose}>
      <>
        <FormPane>
          <SecretsExclusionDefinitionForm />
        </FormPane>
        <VerticalDivider />
        <IndicatorPane>Placeholder</IndicatorPane>
      </>
    </ConfirmationModal>
  )
)`
  min-width: 300rem;

  ${Modal.Content} {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}`;

const FormPane = styled.div`
  flex: 5;
`;

const IndicatorPane = styled.div`
  display: flex;
  flex: 3;
  flex-direction: column;
  align-items: center;
`;

const VerticalDivider = styled.div`
  margin: 0 8rem;
  border-left: 0.25rem solid var(--color-blue-gray-30);
`;

function secretsExclusionDefinitionResolver(data) {
  const errors: { [key: string]: string } = {};

  if (_.isEmpty(data.filesPathRegex) && _.isEmpty(data.regexMatch)) {
    errors.filesPathRegex = 'No filter provided';
  }

  return {
    values: {
      ...data,
      filesPathRegex: data.filesPathRegex.filter(pattern => !_.isEmpty(pattern)).map(_ => _.trim()),
      regexMatch: data.regexMatch.filter(pattern => !_.isEmpty(pattern)).map(_ => _.trim()),
    },
    errors,
  };
}

function newDefinition() {
  return {
    key: crypto.randomUUID(),
    name: '',
    applicationKeys: [],
    repositoryKeys: [],
    filesPathRegex: [],
    regexMatch: [],
  };
}
