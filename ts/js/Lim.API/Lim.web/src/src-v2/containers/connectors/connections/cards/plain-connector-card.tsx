import { ReactNode } from 'react';
import styled from 'styled-components';
import { CorneredCard } from '@src-v2/components/cards/cornered-card';
import { VendorCircle, VendorStack, VendorState } from '@src-v2/components/circles';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { getProviderGroupState } from '@src-v2/containers/connectors/connections/cards/default-card';
import { ApiProviderGroup } from '@src-v2/types/providers/api-provider-group';
import { ProviderGroup } from '@src-v2/types/providers/provider-group';

export const PlainConnectorCard = styled(
  ({
    provider,
    icons,
    children,
    ...props
  }: {
    provider: ProviderGroup & ApiProviderGroup;
    icons: string[];
    children: ReactNode;
  }) => {
    const providerGroupState = getProviderGroupState({ provider });
    const vendors = getVendors(icons, providerGroupState.type);

    return (
      <CorneredCard.VerticalStack {...props}>
        {vendors.length === 1 ? (
          <Tooltip content={providerGroupState.tooltip} disabled={!providerGroupState.tooltip}>
            <VendorCircle
              name={vendors[0].iconName ?? vendors[0].key}
              size={Size.XXLARGE}
              state={vendors[0].state}
            />
          </Tooltip>
        ) : (
          <VendorStack disabledTooltip vendors={vendors} size={Size.XLARGE} />
        )}
        <CardContent>{children}</CardContent>
      </CorneredCard.VerticalStack>
    );
  }
)`
  min-height: 39rem;
`;

const CardContent = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const getVendors = (icons: string[], state?: VendorState) =>
  icons.map(icon => ({
    key: icon,
    displayName: icon,
    iconName: icon,
    state,
  }));
