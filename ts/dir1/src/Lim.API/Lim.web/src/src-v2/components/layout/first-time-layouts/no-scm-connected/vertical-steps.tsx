import { observer } from 'mobx-react';
import styled from 'styled-components';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { StyledProps } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

export const VerticalSteps = styled(
  observer(
    ({ steps, ...props }: StyledProps & { steps: { label: string; checked?: boolean }[] }) => {
      return (
        <VerticalStepsContainer {...props}>
          <Line />
          <IconsContainer>
            {steps.map(step => (
              <IconLabelContainer key={step.label}>
                <SuccessIcon
                  name="Success"
                  size={Size.XSMALL}
                  data-connected={dataAttr(step.checked)}
                />
                {step.label}
              </IconLabelContainer>
            ))}
          </IconsContainer>
        </VerticalStepsContainer>
      );
    }
  )
)``;

const IconLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SuccessIcon = styled(SvgIcon)`
  color: var(--color-blue-gray-40);

  &[data-connected] {
    color: var(--color-green-50);
  }
`;

const VerticalStepsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6rem;
  justify-content: space-between;
`;

const Line = styled.div`
  height: calc(100% - 5.5rem);
  position: absolute;
  top: 4.5rem;
  left: 2.5rem;
  border-left: 1px dashed var(--color-blue-gray-30);
`;
