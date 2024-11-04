import styled from 'styled-components';
import { AttackSurfaceSummary } from '@src-v2/types/profiles/code-profile-response';
import { dataAttr } from '@src-v2/utils/dom-utils';

export function AttackSurfaceSummaryChips({
  attackSurfaceSummary,
  ...props
}: {
  attackSurfaceSummary: AttackSurfaceSummary;
}) {
  return (
    <SummaryContainer {...props}>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.isDeployed)}>
        Deployed
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.hasSensitiveData)}>
        Sensitive Data
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.isUserFacing)}>
        User Facing
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.hasEncryptionUsage)}>
        Encryption{' '}
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.isInternetExposed)}>
        Internet exposed
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.hasAuthenticationUsage)}>
        Authentication
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.hasApis)}>
        APIs
      </SummaryLegacyChip>
      <SummaryLegacyChip data-active={dataAttr(attackSurfaceSummary.hasAuthorizationUsage)}>
        Authorization
      </SummaryLegacyChip>
    </SummaryContainer>
  );
}

export const SummaryLegacyChip = styled.div`
  max-width: 100%;
  height: 6rem;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-s);
  font-weight: 300;
  line-height: 6rem;
  border-radius: 100vmax;
  padding: 0 2rem;

  width: calc(50% - 1rem);
  background-color: var(--color-white);

  &:after {
    content: '';
    min-width: 3.5rem;
    height: 3.5rem;
    margin: 1rem 0 1rem 2rem;
    border: 0.25rem solid var(--color-blue-60);
    border-radius: 100vmax;
  }

  &[data-active]:after {
    background-color: var(--color-blue-60);
  }
`;

const SummaryContainer = styled.div`
  display: flex;
  height: min-content;
  align-content: flex-end;
  flex-wrap: wrap;
  gap: 2rem;
`;
