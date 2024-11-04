import { ReactNode } from 'react';
import styled from 'styled-components';
import { Divider } from '@src-v2/components/divider';
import { SearchInput } from '@src-v2/components/forms/search-input';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { Heading5 } from '@src-v2/components/typography';
import { humanize } from '@src-v2/utils/string-utils';

export type SingleBoxDisplayProps = {
  prefix: 'selected' | 'available';
  itemTypeDisplayName: string;
  count: number;
  total: number;
  debounceSearch?: boolean;
  onSearch: (value: string) => void;
  footer?: ReactNode;
  children: ReactNode;
};

export const SingleBoxDisplay = styled(
  ({
    prefix,
    itemTypeDisplayName,
    debounceSearch = true,
    count,
    total,
    onSearch,
    children,
    footer,
    ...props
  }: SingleBoxDisplayProps) => {
    return (
      <div {...props}>
        <Heading5>
          {humanize(`${prefix} ${itemTypeDisplayName}`)} (
          {count !== total ? `${count.toLocaleString()} of out ` : ''}
          {total.toLocaleString()})
        </Heading5>
        <SearchInput
          variant={Variant.SECONDARY}
          wait={!debounceSearch ? false : undefined}
          onChange={event => onSearch(event.target.value)}
        />
        {children}
        {footer && (
          <>
            <Divider />
            {footer}
          </>
        )}
      </div>
    );
  }
)`
  display: flex;
  height: 117rem;
  padding: 3rem;
  flex-direction: column;
  gap: 2rem;
  overflow: hidden;
  box-shadow: var(--elevation-0);
  font-size: var(--font-size-s);
  border-radius: 3rem;

  &[data-main] {
    grid-area: main;
  }

  &[data-secondary] {
    grid-area: secondary;
  }

  ${SearchInput} {
    width: 100%;
    height: 8rem;
  }
`;
