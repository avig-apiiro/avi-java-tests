import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { SelectMenu } from '@src-v2/components/select-menu';
import { ToastParagraph } from '@src-v2/components/toastify';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading } from '@src-v2/components/typography';
import { SecretsExclusionModal } from '@src-v2/containers/risks/secrets/secrets-exclusion/secrets-exclusion-modal';
import { useInject } from '@src-v2/hooks';
import { useModalState } from '@src-v2/hooks/use-modal-state';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';
import DefinitionConsts from '@src/blocks/GovernancePage/blocks/Definitions/DefinitionConsts';

export const ToastSuccessMessage = () => (
  <ToastWrapper>
    <Heading>Secrets exclusion pattern added successfully</Heading>
    <ToastParagraph>
      Applying this pattern may take several hours, depending on your environment
    </ToastParagraph>
  </ToastWrapper>
);

export const SecretsExclusionMenu = () => {
  const [modalElement, setModal, closeModal] = useModalState();
  const { toaster, definitions } = useInject();
  const history = useHistory();

  const onCreateDefinitionSubmit = useCallback(async (itemsToSave: StubAny) => {
    await definitions.applyDefinition({
      definitionRaw: { ...itemsToSave, key: crypto.randomUUID() },
      definitionType: DefinitionConsts.types.SecretsExclusion,
    });
    closeModal();
    toaster.success(ToastSuccessMessage);
  }, []);

  const handleClickCreateNewDefinition = useCallback(() => {
    setModal(<SecretsExclusionModal onSubmit={onCreateDefinitionSubmit} onClose={closeModal} />);
  }, [setModal, closeModal]);

  const handleRedirectToDefinitions = useCallback(() => {
    history.push(
      makeUrl('/governance/definitions', {
        fl: { searchTerm: 'secrets exclusion' },
      })
    );
  }, [setModal, closeModal]);

  return (
    <>
      <SelectMenu appendTo="parent" placeholder="Secrets exclusion" variant={Variant.FILTER}>
        <FilterLabel onClick={handleClickCreateNewDefinition}>Create new definition</FilterLabel>
        <FilterLabel onClick={handleRedirectToDefinitions}>View existing exclusions</FilterLabel>
      </SelectMenu>
      {modalElement}
    </>
  );
};

const FilterLabel = styled(SelectMenu.Label)`
  width: 100%;
  display: block;
  padding: 1rem 2rem;
  border-radius: 2rem;
  cursor: pointer;

  &:hover {
    background-color: var(--color-blue-gray-15);
  }
`;

const ToastWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
