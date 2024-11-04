import { AvatarProfile } from '@src-v2/components/avatar';
import { ControlledCard } from '@src-v2/components/cards/controlled-card';
import {
  EvidenceLine,
  EvidenceLinesWrapper,
} from '@src-v2/components/entity-pane/evidence/evidence-line';
import { RiskTag } from '@src-v2/components/tags';
import { DateTime } from '@src-v2/components/time';
import { SubHeading4 } from '@src-v2/components/typography';
import { usePullRequestScanContext } from '@src-v2/containers/pr-logs/pane/pr-scan-context-provider';
import { ReleaseSideView } from '@src-v2/containers/releases/release-side-view';
import { humanize } from '@src-v2/utils/string-utils';

export function AboutThisPrScanCard() {
  const { pullRequestScan } = usePullRequestScanContext();

  return (
    <ControlledCard triggerOpenState={{ isOpen: true }} title="About this pull request scan">
      <EvidenceLinesWrapper>
        <EvidenceLine isExtendedWidth label="Risk">
          <RiskTag riskLevel={pullRequestScan.riskLevel?.toLowerCase()}>
            {pullRequestScan.riskLevel ?? humanize(pullRequestScan.scanStatus)}
          </RiskTag>
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Risks count">
          {pullRequestScan.risksCount ?? 0}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Branches">
          <ReleaseSideView side={pullRequestScan.candidate} /> →{' '}
          <ReleaseSideView side={pullRequestScan.baseline} />
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="PR #">
          {pullRequestScan.pullRequestId}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="PR URL">
          {pullRequestScan.url}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Unblocked by">
          {pullRequestScan.unblockedBy ? (
            <AvatarProfile username={pullRequestScan.unblockedBy} showViewProfile={false}>
              {pullRequestScan.unblockedBy}
            </AvatarProfile>
          ) : (
            <SubHeading4>Not available</SubHeading4>
          )}
        </EvidenceLine>
        <EvidenceLine isExtendedWidth label="Unblocked at">
          {pullRequestScan.unblockedAt ? (
            <DateTime date={pullRequestScan.unblockedAt} />
          ) : (
            <SubHeading4>Not available</SubHeading4>
          )}
        </EvidenceLine>

        <EvidenceLine isExtendedWidth label="Last scan date">
          <DateTime date={pullRequestScan.lastScanDate} />
        </EvidenceLine>
      </EvidenceLinesWrapper>
    </ControlledCard>
  );
}
