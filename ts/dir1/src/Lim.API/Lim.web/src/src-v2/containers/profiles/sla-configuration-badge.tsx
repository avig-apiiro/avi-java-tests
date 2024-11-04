import _ from 'lodash';
import { useMemo } from 'react';
import styled from 'styled-components';
import { TextButton } from '@src-v2/components/button-v2';
import { InfoTooltip } from '@src-v2/components/tooltips/icon-tooltips';
import { SubHeading4 } from '@src-v2/components/typography';
import { SlaTag } from '@src-v2/containers/sla/sla-tag';
import { riskOrder } from '@src-v2/data/risk-data';
import { ApplicationProfileResponse } from '@src-v2/types/profiles/application-profile-response';
import { StyledProps } from '@src-v2/types/styled';

export const SlaConfigurationBadge = styled(
  ({
    profile: { slaProfileResponse },
    ...props
  }: StyledProps & { profile: ApplicationProfileResponse }) => {
    const orderedSlaDetails = useMemo(() => {
      const hasSlaResponse = slaProfileResponse?.sla.some(({ slaDays }) => Boolean(slaDays));
      return hasSlaResponse
        ? _.orderBy(
            slaProfileResponse?.sla,
            details => riskOrder.indexOf(details.riskLevel),
            'desc'
          )
        : [];
    }, [slaProfileResponse?.sla]);

    return (
      <div {...props}>
        <SubHeading4>SLA:</SubHeading4>
        {!orderedSlaDetails.length ? (
          <>
            Not defined.{' '}
            <TextButton showArrow to="/settings/general">
              Define Global SLA
            </TextButton>{' '}
          </>
        ) : (
          <>
            {orderedSlaDetails.map(detail => (
              <SlaTag
                key={detail.riskLevel}
                value={detail.slaDays}
                severity={detail.riskLevel}
                affectedBy={slaProfileResponse?.isConfigured ? detail.policyName : undefined}
              />
            ))}
            {slaProfileResponse?.isConfigured ? (
              <>
                <SubHeading4>(Configured)</SubHeading4>{' '}
                <InfoTooltip
                  content={
                    <>
                      Based on the most stringent SLA <br />
                      policies for this entity
                    </>
                  }
                />
              </>
            ) : (
              <SubHeading4>(Global)</SubHeading4>
            )}
          </>
        )}
      </div>
    );
  }
)`
  display: flex;
  gap: 1rem;
  line-height: 5rem;
`;
