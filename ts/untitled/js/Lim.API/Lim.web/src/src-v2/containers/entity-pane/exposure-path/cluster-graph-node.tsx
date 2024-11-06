import { ReactNode } from 'react';
import styled from 'styled-components';
import { Circle, VendorCircle, VendorState } from '@src-v2/components/circles';
import { ClampText } from '@src-v2/components/clamp-text';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Caption1, Caption2, EllipsisText } from '@src-v2/components/typography';
import { RiskLevel } from '@src-v2/types/enums/risk-level';

interface ClusterGraphNodeProps {
  name: string;
  title: string;
  subTitle: ReactNode;
  isVendor?: boolean;
  vendorState?: VendorState;
  size?: Size;
  icon?: string;
  badge?: ReactNode;
  riskLevel?: RiskLevel;
}

export const ClusterGraphNode = ({
  name,
  title,
  subTitle,
  isVendor = false,
  vendorState,
  icon,
  riskLevel,
}: ClusterGraphNodeProps) => {
  return (
    <ClusterGraphNodeContainer>
      <ClusterGraphCircleNodeContainer>
        {Boolean(icon) && <ClusterGraphCircleIcon name={icon} size={Size.XXSMALL} />}
        {Boolean(riskLevel) && <RiskIcon riskLevel={riskLevel.toString()} size={Size.XXSMALL} />}

        {isVendor ? (
          <VendorCircle name={name} size={Size.LARGE} data-risk={vendorState} />
        ) : (
          <Circle size={Size.LARGE} data-risk={vendorState}>
            <SvgIcon name={name} />
          </Circle>
        )}
      </ClusterGraphCircleNodeContainer>
      <ClusterGraphCircleText>
        <ClampText>{title}</ClampText>
        <Caption2>
          {typeof subTitle === 'string' ? <ClampText lines={2}>{subTitle}</ClampText> : subTitle}
        </Caption2>
      </ClusterGraphCircleText>
    </ClusterGraphNodeContainer>
  );
};

export const DashedLineWithTitle = ({
  text,
  growFactor = 5,
  tooltipText,
}: {
  text: string;
  growFactor: number;
  tooltipText?: string;
}) => (
  <DashedLine growFactor={growFactor}>
    <Tooltip content={tooltipText} disabled={!tooltipText}>
      <Caption1>
        <EllipsisText>{text}</EllipsisText>
      </Caption1>
    </Tooltip>
  </DashedLine>
);

const ClusterGraphCircleIcon = styled(SvgIcon)`
  position: absolute;
  z-index: 1;
  bottom: 6rem;
  right: 5rem;
`;

const ClusterGraphNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ClusterGraphCircleText = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  max-width: 27rem;
  padding: 0 2rem;

  ${Caption2} {
    line-height: initial;
    color: var(--color-blue-gray-60);
  }
`;

const ClusterGraphCircleNodeContainer = styled.div`
  position: relative;

  ${VendorCircle} {
    &[data-risk=${VendorState.Error}] {
      border: 0.5rem solid var(--color-red-50);
    }

    &[data-risk=${VendorState.Warning}] {
      border: 0.5rem solid var(--color-orange-55);
    }
  }

  ${Circle} {
    background-color: var(--color-white);
    border: 0.25rem solid var(--color-blue-gray-30);

    &[data-risk=${VendorState.Error}] {
      border: 0.5rem solid var(--color-red-50);
    }

    &[data-risk=${VendorState.Warning}] {
      border: 0.5rem solid var(--color-orange-55);
    }
  }

  ${RiskIcon} {
    position: absolute;
    bottom: 6rem;
    right: 5rem;
  }
`;

export const DashedLine = styled.div<{ growFactor?: number }>`
  flex-grow: 1;
  border-top: 1px dashed var(--color-blue-gray-30);
  margin: ${props => `3.5rem -${14 - props.growFactor}rem 0`};
  position: relative;
  z-index: 0;

  ${Caption1} {
    position: absolute;
    width: 100%;
    bottom: 1rem;
    left: 0;
    text-align: center;
    color: var(--color-blue-gray-60);

    &:last-of-type {
      right: 4rem;
    }
  }
`;
