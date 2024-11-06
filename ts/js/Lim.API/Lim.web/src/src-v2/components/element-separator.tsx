import { Children, ExoticComponent, Fragment, ReactNode } from 'react';
import { StyledProps } from '@src-v2/types/styled';

export type ElementSeparatorProps = {
  as?: ExoticComponent<{ children?: ReactNode }> | string;
  separator?: ReactNode;
  children: ReactNode;
};

export function ElementSeparator({
  as: Container = Fragment,
  separator = <>&middot;</>,
  children,
  ...props
}: StyledProps<ElementSeparatorProps>) {
  return (
    <Container {...props}>
      {Children.toArray(children)
        .filter(Boolean)
        .map((child, index) =>
          index
            ? [
                <Fragment key={index}>
                  {' '}
                  {separator} {child}
                </Fragment>,
              ]
            : child
        )}
    </Container>
  );
}
