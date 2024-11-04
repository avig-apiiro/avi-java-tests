import { SimpleSelect } from '@src-v2/containers/simple-select';
import { useQueryParams } from '@src-v2/hooks';

export type SortOption = {
  key: string;
  label: string;
};

type SortOptionsSelectProps = {
  sortOptions: SortOption[];
};

export function SortOptionsSelect({ sortOptions }: SortOptionsSelectProps) {
  const { queryParams, updateQueryParams } = useQueryParams();

  return (
    <SimpleSelect
      title="Select sort criteria"
      options={sortOptions}
      // @ts-expect-error
      identity={(option: SortOption) => option.label}
      defaultValue={sortOptions.find(option => option.key === queryParams.sort) ?? sortOptions[0]}
      onSelect={(option: SortOption) => updateQueryParams({ sort: option.key })}
    />
  );
}
