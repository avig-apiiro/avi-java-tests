import styled from 'styled-components';
import { CheckboxToggle } from '@src-v2/components/forms/checkbox-toggle';

export const InputGroup = styled(({ input, label, children, ...props }) => (
  <div {...props}>
    <Label>
      <Cell>{input}</Cell>
      <Cell>{label}</Cell>
    </Label>
    {children && (
      <Content>
        <Cell>{children}</Cell>
      </Content>
    )}
  </div>
))`
  display: table;
`;

const Cell = styled.span`
  display: table-cell;
  vertical-align: text-top;
`;

const Label = styled.label`
  display: table-row;

  ${Cell} {
    padding-bottom: 3rem;

    &:first-child {
      padding-right: 2.5rem;
    }
  }

  ${CheckboxToggle} {
    top: -0.5rem;
  }
`;

const Content = styled.div`
  display: table-row;

  &:before {
    content: '';
    display: table-cell;
  }

  ${Label} ${Cell} {
    padding-top: 3rem;
  }
`;
