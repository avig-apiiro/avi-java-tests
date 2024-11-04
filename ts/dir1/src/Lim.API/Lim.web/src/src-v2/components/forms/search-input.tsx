import debounce from 'lodash/debounce';
import React, { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { InputProps, InputV2 } from '@src-v2/components/forms/inputV2';
import { Variant } from '@src-v2/components/types/enums/variant-enum';
import { useFilters } from '@src-v2/hooks/use-filters';
import { StyledProps } from '@src-v2/types/styled';

interface SearchInputProps {
  wait?: number | false;
  variant?: Variant;
}

export const SearchInput = styled(
  forwardRef<HTMLInputElement, StyledProps<InputProps> & SearchInputProps>(
    (
      { placeholder = 'Search...', variant = Variant.PRIMARY, wait = 500, onChange, ...props },
      ref
    ) => {
      const handleChange = useMemo(
        () => (wait ? debounce(onChange, wait) : onChange),
        [onChange, wait]
      );

      return (
        <InputV2
          {...props}
          data-variant={variant}
          placeholder={placeholder}
          onChange={handleChange}
          iconName="Search"
          ref={ref}
        />
      );
    }
  )
)`
  border-radius: 100vmax;
  width: 75rem;

  &[data-variant=${Variant.SECONDARY}] {
    background-color: var(--color-blue-gray-10);
  }
`;

export const SearchFilterInput = forwardRef<
  HTMLInputElement,
  StyledProps<InputProps & { namespace?: string }>
>(({ onChange, namespace, ...props }, ref) => {
  const { updateFilters } = useFilters(namespace);
  return (
    <SearchInput
      ref={ref}
      {...props}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        updateFilters({
          key: 'searchTerm',
          value: event?.target?.value?.length > 0 ? event.target.value : undefined,
        });
        onChange?.(event);
      }}
    />
  );
});
