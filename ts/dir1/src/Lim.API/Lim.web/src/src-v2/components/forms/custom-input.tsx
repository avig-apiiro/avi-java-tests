import { ComponentProps, forwardRef } from 'react';
import styled from 'styled-components';
import { InputAttributes } from '@src-v2/data/element-attributes';
import { useUniqueId } from '@src-v2/hooks';
import { useGroupProperties } from '@src-v2/hooks/react-helpers/use-group-properties';
import { assignStyledNodes } from '@src-v2/types/styled';
import { dataAttr, stopPropagation } from '@src-v2/utils/dom-utils';

const InternalCustomInput = forwardRef(
  (props: ComponentProps<'input'> & { checked?: boolean }, ref) => {
    const [inputProps, labelProps] = useGroupProperties(props, InputAttributes);
    const id = useUniqueId('custom-input-');
    return (
      <>
        <CustomInput.HiddenInput {...inputProps} ref={ref} id={id} />
        <label
          {...labelProps}
          htmlFor={id}
          data-disabled={dataAttr(inputProps.disabled)}
          onClick={stopPropagation}
        />
      </>
    );
  }
);

export const CustomInput = assignStyledNodes(InternalCustomInput, {
  HiddenInput: styled.input`
    display: none;
  `,
});
