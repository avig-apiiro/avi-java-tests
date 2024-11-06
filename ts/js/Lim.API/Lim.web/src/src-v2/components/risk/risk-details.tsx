import styled from 'styled-components';
import { BusinessImpactIndicator } from '@src-v2/components/business-impact-indictor';
import { Label } from '@src-v2/components/forms/modal-form-layout';
import { BaseIcon } from '@src-v2/components/icons';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { BusinessImpactPopover, RiskFactorPopover } from '@src-v2/components/risk/risk-popovers';
import { Size } from '@src-v2/components/types/enums/size';
import { BusinessImpact } from '@src-v2/types/enums/business-impact';
import { humanize } from '@src-v2/utils/string-utils';

export const RiskDetails = ({
  profile,
  showLabel = true,
  small = false,
  ...props
}: {
  profile: { businessImpactLevel: BusinessImpact; riskLevel: string };
  showLabel?: boolean;
  small?: boolean;
}) => (
  <RiskDetailsContainer {...props}>
    {/*@ts-expect-error*/}
    {profile.businessImpactLevel !== 'none' && (
      <BusinessImpactPopover
        interactive
        profile={{ ...profile, businessImpact: humanize(profile.businessImpactLevel) }}>
        <RiskDetailsContent>
          <InlineBusinessImpactIndicator
            businessImpact={profile.businessImpactLevel}
            size={Size.LARGE}
          />
          {showLabel && <Label>Business Impact</Label>}
        </RiskDetailsContent>
      </BusinessImpactPopover>
    )}
    <RiskFactorPopover
      title={profile.riskLevel !== 'none' ? humanize(`${profile.riskLevel} Risk`, true) : undefined}
      profile={profile}
      interactive>
      <RiskDetailsIconContainer>
        <RiskIcon size={Size.XXLARGE} riskLevel={profile.riskLevel} />
        {showLabel && <Label>Risk</Label>}
      </RiskDetailsIconContainer>
    </RiskFactorPopover>
  </RiskDetailsContainer>
);

export const RiskDetailsContainer = styled.div`
  display: flex;
  user-select: none;
  gap: 10rem;
  cursor: pointer;

  ${Label} {
    color: var(--default-text-color);
    font-size: var(--font-size-xs);
    font-weight: 300;
    white-space: nowrap;
    line-height: 1;
  }
`;

const RiskDetailsContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

export const RiskDetailsIconContainer = styled.div`
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;

  ${BaseIcon} {
    width: 15rem;
    height: 9rem;
    font-size: var(--font-size-s);
  }
`;

export const HeaderRiskDetails = styled(props => <RiskDetails {...props} showLabel={false} />)`
  ${RiskDetailsContainer}& {
    justify-content: space-between;
    gap: 1rem;
  }
`;

const InlineBusinessImpactIndicator = styled(BusinessImpactIndicator)`
  text-transform: uppercase;
`;
