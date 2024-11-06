import { forwardRef } from 'react';
import styled from 'styled-components';
import { Chip } from '@src-v2/components/chips';
import { VendorIcon } from '@src-v2/components/icons';
import { RepositoryInfoTooltip } from '@src-v2/components/repositories/repository-info-tooltip';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';

export const RepositoryProviderChipWithTooltip = forwardRef(
  // @ts-expect-error
  ({ item, selectedItem, ...props }, ref) => {
    const providerItem = item ?? selectedItem;
    return (
      <Tooltip content={<RepositoryInfoTooltip item={providerItem} />}>
        <Chip {...props} onClick={null}>
          <RepositoryProviderChipContent>
            <VendorIcon name={providerItem.server.provider} />
            {providerItem.name ?? providerItem.displayName}
          </RepositoryProviderChipContent>
        </Chip>
      </Tooltip>
    );
  }
);

const RepositoryProviderChipContent = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;
