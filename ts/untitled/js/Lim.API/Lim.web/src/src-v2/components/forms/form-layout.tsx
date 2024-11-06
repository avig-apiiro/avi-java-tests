import styled from 'styled-components';
import { Collapsible } from '@src-v2/components/collapsible';
import { Input } from '@src-v2/components/forms/input';
import { MultiSelect } from '@src-v2/components/forms/multi-select';
import { Heading, Paragraph } from '@src-v2/components/typography';
import { assignStyledNodes } from '@src-v2/types/styled';

const Header = styled.header`
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  padding: 6rem 0;
  margin-bottom: 4rem;
  align-items: center;
  border-bottom: 1.5rem solid var(--color-blue-gray-20);
  background-color: var(--color-white);
`;

const Details = styled.div`
  flex-grow: 1;

  ${Heading} {
    font-size: var(--font-size-xxl);
    font-weight: 500;
  }
`;

const Label = styled.label`
  display: block;
  margin-top: 4rem;

  &:not(:last-child) {
    margin-bottom: 4rem;
  }

  > ${Heading} {
    font-size: 1em;
    font-weight: 600;
  }

  > ${Paragraph} {
    color: var(--color-blue-gray-60);
  }
`;

const LabelCell = styled.div``;

const LabelGroup = styled.div`
  display: table;
  margin-top: 4rem;
  border-collapse: collapse;
  border-style: hidden;

  &:not(:last-child) {
    margin-bottom: 4rem;
  }

  ${Label} {
    display: table-row;

    > ${Heading}, > ${LabelCell} {
      display: table-cell;
      border: 4rem solid transparent;
    }

    > ${Heading} {
      min-width: 25rem;
      white-space: nowrap;
    }
  }
`;

const Fieldset = styled.fieldset`
  display: block;
  padding-bottom: 8rem;
  margin: 6rem 0 4rem;

  &:not(:last-child) {
    border-bottom: 0.25rem solid var(--color-blue-gray-30);
  }

  > ${Heading} {
    margin-bottom: 4rem;
    font-size: var(--font-size-l);

    & + ${Paragraph} {
      margin-top: -2rem;
    }

    & ~ ${Paragraph}:last-of-type {
      margin-bottom: 4rem;
    }
  }

  > ${Paragraph} {
    color: var(--color-blue-gray-60);
  }
`;

const _Collapsible = styled(Collapsible)`
  ${(Collapsible as any).Head} {
    margin-bottom: 4rem;
    justify-content: start;
    gap: 6rem;
  }

  ${(Collapsible as any).Chevron} {
    margin-left: 0;
  }

  ${(Collapsible as any).Title} {
    font-size: var(--font-size-m);
    font-weight: 600;
  }
`;

/**
 * @deprecated Please use form-layout-v2
 */
export const Form = assignStyledNodes(
  styled.form`
    ${Input} {
      width: 85rem;
    }

    ${(MultiSelect as any).Combobox} {
      min-width: 85rem;
    }
  `,
  {
    Header,
    Details,
    Label,
    LabelCell,
    LabelGroup,
    Fieldset,
    Collapsible: _Collapsible,
  }
);
