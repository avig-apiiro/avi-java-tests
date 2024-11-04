import { ForwardedRef, forwardRef } from 'react';
import styled from 'styled-components';
import { Circle, CircleProps, VendorCircle, VendorState } from '@src-v2/components/circles';
import { CircleGroup } from '@src-v2/components/circles/circle-group';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { TrimmedCollectionDisplay } from '@src-v2/components/trimmed-collection-display';
import { Size } from '@src-v2/components/types/enums/size';
import { getProviderDisplayName } from '@src-v2/data/providers';
import { Provider } from '@src-v2/types/enums/provider';

export interface Vendor {
  key: string;
  displayName: string;
  iconName?: string;
  state?: VendorState;
}

export interface VendorStackProps {
  vendors: Vendor[];
  limit?: number;
  size?: Size;
  disabledTooltip?: boolean;
}

export const VendorStack = styled(
  ({
    vendors,
    limit = 3,
    size = Size.SMALL,
    disabledTooltip = false,
    ...props
  }: VendorStackProps) => (
    <CircleGroup {...props} size={size}>
      <TrimmedCollectionDisplay<Vendor>
        limit={limit}
        item={({ value: vendor, index }) => (
          <Tooltip
            disabled={disabledTooltip}
            content={vendor.displayName ?? getProviderDisplayName(vendor.key as Provider)}>
            <VendorCircle
              name={vendor.iconName ?? vendor.key}
              zIndex={vendors.length - index}
              state={vendor.state}
            />
          </Tooltip>
        )}
        excessiveItem={({ value: vendor }) => <div>{vendor.displayName ?? vendor.key}</div>}
        counter={forwardRef((props, ref: ForwardedRef<any>) => (
          <MoreCircle {...props} ref={ref} zIndex={vendors.length - limit} />
        ))}>
        {vendors}
      </TrimmedCollectionDisplay>
    </CircleGroup>
  )
)``;

const MoreCircle = styled(Circle)<CircleProps>`
  background-color: var(--color-white);
  border: 0.4rem solid var(--color-blue-gray-30);
`;
