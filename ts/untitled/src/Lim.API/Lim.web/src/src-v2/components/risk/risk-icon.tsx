import _ from 'lodash';
import { forwardRef } from 'react';
import styled from 'styled-components';
import { SvgIcon } from '@src-v2/components/icons';
import { Size } from '@src-v2/components/types/enums/size';
import { getRiskColor } from '@src-v2/data/risk-data';

export const RiskIcon = styled(
  forwardRef<HTMLImageElement, { riskLevel?: string; size?: Size }>(
    ({ riskLevel, size, ...props }, ref) =>
      riskLevel === 'Ignored' || riskLevel === 'AutoIgnored' ? (
        <SvgIcon {...props} ref={ref} {...props} name="Invisible" size={size} />
      ) : riskLevel === 'Accepted' || riskLevel === 'Compliant' ? (
        <SvgIcon {...props} ref={ref} name="Accept" size={size} />
      ) : (
        <BaseRiskIcon {...props} ref={ref} riskLevel={_.camelCase(riskLevel)} size={size} />
      )
  )
)``;

const BaseRiskIcon = styled(
  forwardRef<
    HTMLImageElement,
    {
      riskLevel: string;
      size?: Size;
    }
  >(({ riskLevel, size, ...props }, ref) => (
    <SvgIcon ref={ref} {...props} name="Risk" data-risk-level={riskLevel} size={size} />
  ))
)`
  color: ${getRiskColor} !important;
`;
