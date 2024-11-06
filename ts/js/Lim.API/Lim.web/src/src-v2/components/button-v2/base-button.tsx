import { Ref, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BaseButtonProps,
  ExternalLinkButtonProps,
  LinkButtonProps,
} from '@src-v2/components/button-v2/types';
import { preventDefault } from '@src-v2/utils/dom-utils';
import { isTypeOf } from '@src-v2/utils/ts-utils';

export const BaseButton = forwardRef(
  (
    {
      disabled,
      ...props
    }: (ExternalLinkButtonProps | LinkButtonProps | BaseButtonProps) & { disabled?: boolean },
    ref: Ref<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (isTypeOf<LinkButtonProps>(props, 'to')) {
      return (
        <Link
          ref={ref as Ref<HTMLAnchorElement>}
          {...props}
          onClick={disabled ? preventDefault : props.onClick}
        />
      );
    }
    if (isTypeOf<ExternalLinkButtonProps>(props, 'href')) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          onClick={disabled ? preventDefault : props.onClick}
        />
      );
    }
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        {...props}
        disabled={disabled}
        type={props.type ?? 'button'}
      />
    );
  }
);
