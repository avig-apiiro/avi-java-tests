import styled from 'styled-components';
import { BaseIcon } from '@src-v2/components/icons';
import { Heading5 } from '@src-v2/components/typography';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const Field = styled.label`
  display: flex;
  margin: 7rem 0;
  flex-direction: column;
  font-size: var(--font-size-m);
  font-weight: 600;
  gap: 2rem;

  &:first-child {
    margin-top: 0;
  }
`;

export const LabelWithDescription = styled.div`
  display: flex;
  flex-direction: column;

  ${BaseIcon} {
    padding: 1rem;
  }
`;

export const Label = styled(({ required, ...props }) => (
  <Heading5 {...props} data-required={dataAttr(Boolean(required))} />
))`
  display: flex;
  align-items: center;

  &[data-required]:after {
    content: '*';
    color: var(--color-red-50);
  }
`;
