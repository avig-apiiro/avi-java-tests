import { HTMLProps, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@src-v2/components/button-v2';
import { Card } from '@src-v2/components/cards';
import { Divider, HeadingWithDivider } from '@src-v2/components/divider';
import { GroupControlContainer } from '@src-v2/components/forms/form-controls';
import { Radio } from '@src-v2/components/forms/radio';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, Heading5 } from '@src-v2/components/typography';
import { customScrollbar } from '@src-v2/style/mixins';
import { StyledProps, assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr } from '@src-v2/utils/dom-utils';

const Container = styled.div`
  ${customScrollbar};

  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rem 5rem 6rem 7rem;
  gap: 4rem;
`;

const Section = styled(Card)`
  width: 100%;
  max-width: 240rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;

  ${Card} {
    padding: 3rem;
  }
`;

const SectionFooter = styled((props: StyledProps) => {
  return (
    <>
      <Divider />
      <Caption1 {...props} />
    </>
  );
})`
  display: flex;
  gap: 1rem;
  align-items: center;
  color: var(--color-blue-gray-55);
`;

const Label = styled(
  ({
    required,
    disabled,
    ...props
  }: HTMLProps<HTMLLabelElement> & { required?: boolean; disabled?: boolean }) => (
    <label {...props} data-required={dataAttr(required)} data-disabled={dataAttr(disabled)} />
  )
)`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${Heading5} {
    display: flex;
    align-items: center;

    > [data-name='Info'] {
      margin-left: 1rem;
    }
  }

  &[data-required] ${Heading5}:after {
    content: '*';
    color: var(--color-red-50);
  }

  &[data-disabled] ${Heading5} {
    color: var(--color-blue-gray-35);
  }

  ${GroupControlContainer} {
    margin-top: 1rem;
  }

  ${Radio} {
    height: 4rem;
    width: 4rem;
  }
`;

const DependentInputsLabel = styled(Label)<{}>`
  display: grid;
  grid-template-areas:
    'heading heading'
    'first-input second-input';

  grid-template-columns: 54rem 1fr;
`;

const Footer = styled.div`
  width: calc(100% + 6rem);
  height: 16rem;
  display: flex;
  justify-content: flex-end;
  gap: 3rem;
  padding: 0 10rem;
  margin-left: calc(var(--scrollbar-width) * -1);
  background-color: var(--color-blue-gray-10);
  border: 0.25rem solid var(--color-blue-gray-25);
  z-index: 9;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const SubmitButton = ({ children = 'Save' }: { children?: ReactNode }) => {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button type="submit" size={Size.LARGE} loading={isSubmitting}>
      {children}
    </Button>
  );
};

const FormGroup = styled.div`
  display: flex;
  gap: 4rem;

  > * {
    flex: 1;
  }
`;

export const FormLayoutV2 = assignStyledNodes(
  styled.form`
    width: 100%;
    height: calc(100vh - var(--top-bar-height));
    display: grid;
    grid-template-rows: calc(100% - 16rem) 16rem;
  `,
  {
    Container,
    Section,
    SectionFooter,
    Footer,
    Label,
    DependentInputsLabel,
    Actions,
    SubmitButton,
    FormGroup,
    HorizontalDivider: HeadingWithDivider,
  }
);

export const InputLabel = styled.label``;
export const InputClickableLabel = styled(InputLabel)`
  cursor: pointer;

  &[data-disabled] {
    cursor: default;
  }
`;
