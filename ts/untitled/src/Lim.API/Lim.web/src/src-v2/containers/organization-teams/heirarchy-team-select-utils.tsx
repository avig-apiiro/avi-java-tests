import styled from 'styled-components';
import { ClampText } from '@src-v2/components/clamp-text';
import { SubHeading4 } from '@src-v2/components/typography';
import { ConfigurationRecord } from '@src-v2/services/profiles/asset-collection-profiles-base';

export const TeamOption = styled(({ data, ...props }: { data: ConfigurationRecord }) => {
  const hierarchy =
    data.hierarchy?.filter(record => record.key !== data.key).map(item => item.name) ?? [];

  return (
    <div {...props}>
      <ClampText as={SubHeading4}>{hierarchy.join(' / ')}</ClampText>
      {Boolean(hierarchy.length) && ' / '}
      {data.name}
    </div>
  );
})`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export function filterConfigurationRecord(
  { data }: { data: ConfigurationRecord },
  searchValue: string
) {
  return (
    !searchValue ||
    [
      ...(data.hierarchy ?? []).map(hierarchy => hierarchy.name.toLowerCase()),
      data.name.toLowerCase(),
    ]
      .join('/')
      .includes(searchValue.toLowerCase())
  );
}
