import { Children, ReactNode } from 'react';
import styled from 'styled-components';
import { UnderlineButton } from '@src-v2/components/buttons';
import { Circle } from '@src-v2/components/circles';
import { BaseIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { ListItem, TextLink, UnorderedList } from '@src-v2/components/typography';
import { StyledProps } from '@src-v2/types/styled';

export const RemediationSteps = styled(({ children, ...props }: StyledProps) => {
  const childrenAsArray = Children.toArray(children);

  return (
    <UnorderedList {...props}>
      {childrenAsArray.map((element, index) => (
        <RemediationStep key={index} bullet={index + 1}>
          {element}
        </RemediationStep>
      ))}
    </UnorderedList>
  );
})`
  padding: 0;
`;

export const RemediationStep = styled(
  ({ bullet, children, ...props }: StyledProps<{ bullet: ReactNode }>) => (
    <ListItem {...props}>
      <Circle size={Size.MEDIUM}>{bullet}</Circle>
      <StepContent>{children}</StepContent>
    </ListItem>
  )
)`
  display: flex;
  align-items: center;
  gap: 2rem;

  ${Circle} {
    margin-bottom: auto;
    background-color: transparent;
    border: 0.25rem solid var(--color-blue-gray-30);

    ${BaseIcon} {
      &[data-name='Workflow'] {
        color: var(--color-blue-gray-50);
      }
    }
  }

  ${UnderlineButton},
  ${TextLink} {
    color: var(--color-blue-gray-70);
    text-decoration: underline;
  }
`;

const StepContent = styled.div``;
