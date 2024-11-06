import styled from 'styled-components';
import { CenteredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { ConditionalProviderIcon } from '@src-v2/components/icons';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { Provider } from '@src-v2/types/enums/provider';

const ProvidersContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
`;

export const SourceEvidenceLine = ({
  providers,
  isExtendedWidth,
}: {
  providers: Provider[];
  isExtendedWidth?: boolean;
}) => (
  <CenteredEvidenceLine isExtendedWidth={isExtendedWidth} label="Source">
    <ProvidersContainer>
      {providers.map(provider => (
        <Tooltip key={provider} content={getProviderDisplayName(provider)}>
          <ConditionalProviderIcon name={provider} />
        </Tooltip>
      ))}
    </ProvidersContainer>
  </CenteredEvidenceLine>
);
