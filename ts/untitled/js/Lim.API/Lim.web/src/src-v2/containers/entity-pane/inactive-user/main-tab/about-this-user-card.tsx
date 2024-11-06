import { Avatar } from '@src-v2/components/avatar';
import { Badge } from '@src-v2/components/badges';
import { ControlledCard, ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import { DiscoveredEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-date';
import { DueDateEvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-due-date';
import { EvidenceLine } from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskLevelWidget } from '@src-v2/components/entity-pane/evidence/risk-level-widget';
import { DateTime } from '@src-v2/components/time';
import { Size } from '@src-v2/components/types/enums/size';
import { Link } from '@src-v2/components/typography';
import { dateFormats } from '@src-v2/data/datetime';
import { RiskTriggerSummaryResponse } from '@src-v2/types/risks/risk-trigger-summary-response';

export enum UserActionType {
  Commit = 'Last commit',
  Activity = 'Last activity',
}

export function AboutThisUserCard({
  risk,
  userType,
  actionType,
  lastActionTime,
  developerKey,
  ...props
}: ControlledCardProps & {
  risk: RiskTriggerSummaryResponse;
  userType: string;
  developerKey: string;
  lastActionTime: Date;
  actionType: UserActionType;
}) {
  return (
    <ControlledCard title="About this risk" {...props}>
      <DiscoveredEvidenceLine risk={risk} />
      <DueDateEvidenceLine risk={risk} />
      <EvidenceLine label={`Inactive ${userType}`}>
        <Avatar username={risk.riskName} size={Size.MEDIUM} />
        {developerKey ? (
          <Link to={`/users/contributors/${developerKey}/profile`}>{risk.riskName}</Link>
        ) : (
          risk.riskName
        )}
      </EvidenceLine>
      <RiskLevelWidget risk={risk} />
      <EvidenceLine label="User permission">
        <Badge>{userType === 'Admin' ? 'Admin' : 'Write'}</Badge>
      </EvidenceLine>
      <EvidenceLine label={actionType}>
        {lastActionTime ? <DateTime date={lastActionTime} format={dateFormats.longDate} /> : 'None'}
      </EvidenceLine>
      <EvidenceLine label="Risk category">{risk.riskCategory}</EvidenceLine>
    </ControlledCard>
  );
}
