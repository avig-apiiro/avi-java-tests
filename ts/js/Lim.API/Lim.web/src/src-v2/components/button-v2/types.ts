import { HTMLAttributes, ReactEventHandler } from 'react';

export type LinkButtonProps = {
  to: string | { pathname: string; hash?: string; state?: any };
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'to'>;

export type ExternalLinkButtonProps = {
  href: string;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'href' & 'target'>;

export type BaseButtonProps =
  | ({
      type: 'button' | 'submit';
    } & Omit<HTMLAttributes<HTMLButtonElement>, 'type'>)
  | ({
      onClick: ReactEventHandler;
      type?: 'submit' | 'reset' | 'button' | undefined;
    } & Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>);
