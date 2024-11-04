import { CSSProperties, ComponentType, ReactNode } from 'react';

export type StyledProps<T = {}> = T &
  Partial<{
    className: string;
    style: CSSProperties;
    as: string | ComponentType<any>;
    children: ReactNode;
  }>;

type StyledNodes<T> = {
  [K in keyof T]: T[K];
};

export function assignStyledNodes<T, K>(mainComponent: T, nodes: StyledNodes<K>) {
  return Object.assign(mainComponent, nodes);
}
