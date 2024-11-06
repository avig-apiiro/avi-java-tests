import _ from 'lodash';
import { SvgIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Size } from '@src-v2/components/types/enums/size';
import { Tooltip } from './Tooltip';

export const autoIgnoreRiskLevel = 'AutoIgnored';

const defaultAutoIgnoreTip = 'Auto ignored by Apiiro';

const buildTipString = (riskLevel: string, tip: string) => {
  if (!_.isEmpty(tip)) {
    return tip;
  }
  if (riskLevel === 'Ignored' || riskLevel === 'AutoIgnored') {
    return defaultAutoIgnoreTip;
  }
  if (riskLevel === 'None') {
    return '';
  }

  return riskLevel;
};

export default ({
  riskLevel,
  className,
  tip,
  hideTip = false,
  size = Size.XLARGE,
}: {
  riskLevel: string;
  className?: string;
  tip?: string;
  hideTip?: boolean;
  size?: Size;
}) => (
  <Tooltip
    className={className}
    tip={!hideTip ? buildTipString(riskLevel, tip) : ''}
    isLimited={false}>
    {riskLevel === 'Ignored' || riskLevel === 'AutoIgnored' ? (
      <SvgIcon name="Invisible" size={size} />
    ) : riskLevel === 'Accepted' || riskLevel === 'Compliant' ? (
      <SvgIcon name="Accept" size={size} />
    ) : (
      <RiskIcon riskLevel={_.camelCase(riskLevel)} size={size} />
    )}
  </Tooltip>
);
