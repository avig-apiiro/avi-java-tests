import styled from 'styled-components';
import { Combobox } from '@src-v2/components/forms';
import { FormLayoutV2 } from '@src-v2/components/forms/form-layout-v2';
import { AssetFindingsSection } from '@src-v2/containers/manual-findings/form/sections/assets-findings-section';
import { GlobalIdentifiersSection } from '@src-v2/containers/manual-findings/form/sections/global-identifiers-section';
import { NewFindingSection } from '../sections/new-finding-section';

export const FormContent = () => {
  return (
    <FormContainer>
      <NewFindingSection />
      <GlobalIdentifiersSection />
      <AssetFindingsSection />
    </FormContainer>
  );
};

const FormContainer = styled(FormLayoutV2.Container)`
  font-size: var(--font-size-s);

  ${Combobox} {
    width: auto;
    max-width: unset;
  }
`;
