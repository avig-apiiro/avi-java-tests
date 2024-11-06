import { observer } from 'mobx-react';
import { forwardRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MotionAnimation } from '@src-v2/components/animations/motion-animation';
import { Avatar } from '@src-v2/components/avatar';
import { Breadcrumbs, Divider } from '@src-v2/components/breadcrumbs';
import { TextButton } from '@src-v2/components/button-v2';
import { ProfileCard } from '@src-v2/components/cards/profile-card';
import { ClampText } from '@src-v2/components/clamp-text';
import { Dropdown } from '@src-v2/components/dropdown';
import { DropdownMenu } from '@src-v2/components/dropdown-menu';
import { RiskScoreWidget } from '@src-v2/components/risk-score-widget';
import { RiskIcon } from '@src-v2/components/risk/risk-icon';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { Heading1, Heading2, Paragraph, Small } from '@src-v2/components/typography';
import { useDeleteTeamPrompt } from '@src-v2/containers/organization-teams/use-delete-team-prompt';
import { useInject, useSuspense } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';
import { RiskLevel } from '@src-v2/types/enums/risk-level';
import { OrganizationTeamProfileResponse } from '@src-v2/types/profiles/organization-team-profile-response';
import { dataAttr, preventDefault } from '@src-v2/utils/dom-utils';
import { abbreviate } from '@src-v2/utils/number-utils';

export const TeamCard = observer(
  ({ item: teamItem }: { item?: OrganizationTeamProfileResponse }) => {
    const { orgTeamProfiles, history, application } = useInject();
    const [modalElement, onDelete] = useDeleteTeamPrompt();

    const handleEdit = useCallback(() => {
      history.push(`/profiles/teams/${teamItem.key}/edit`);
    }, [history, teamItem]);

    const handleDelete = useCallback(() => onDelete(teamItem), [teamItem, onDelete]);

    const teamHierarchyChart = useSuspense(orgTeamProfiles.getTeamHierarchyChart);

    const [teamHierarchy, teamChildren] = useMemo(() => {
      const teamChildren = teamHierarchyChart.filter(
        hierarchyItem =>
          hierarchyItem.key !== teamItem.key &&
          hierarchyItem.hierarchy.some(({ key }) => key === teamItem.key)
      );
      const teamHierarchyRecords =
        teamHierarchyChart.find(({ key }) => key === teamItem.key)?.hierarchy || [];

      return [
        teamHierarchyRecords.filter(record => record.key !== teamItem.key),
        teamChildren,
      ] as const;
    }, [teamItem.key, teamHierarchyChart]);

    const teamOwner = teamItem.pointsOfContact?.find(member => member.jobTitle === 'TeamOwner');

    return (
      <>
        <TeamCardWrapper
          data-has-description={dataAttr(Boolean(teamItem.description))}
          to={`/profiles/teams/${teamItem.key}`}
          key={teamItem.key}>
          <TeamCardContent>
            {Boolean(teamHierarchy?.length) && (
              <HierarchyContainer>
                <OwnersHierarchy>
                  {teamHierarchy.map(({ name, key }, index) => (
                    <TextButton key={index} to={`/profiles/teams/${key}`}>
                      {name}
                    </TextButton>
                  ))}
                </OwnersHierarchy>
              </HierarchyContainer>
            )}
            <TitleContainer>
              <Heading2>
                <ClampText>{teamItem.name}</ClampText>
              </Heading2>
              {teamItem.stillProcessing && (
                <Tooltip content="Initial learning is in progress">
                  <LearningContainer>
                    <MotionAnimation size={3} width={2} margin={3} />
                  </LearningContainer>
                </Tooltip>
              )}
            </TitleContainer>

            {teamItem.description && <Paragraph>{teamItem.description}</Paragraph>}
            <WidgetsContainer>
              {teamOwner && <TeamOwnerWidget name={teamOwner?.username} />}
              <AssetCollectionWidget
                name="Repositories"
                count={teamItem.repositoryKeys?.length ?? 0}
              />
              <AssetCollectionWidget
                name="Applications"
                count={teamItem.applicationKeys?.length ?? 0}
              />
              <Tooltip
                disabled={!teamChildren?.length}
                content={
                  <>
                    {teamChildren.map(child => (
                      <div>{child.name}</div>
                    ))}
                  </>
                }>
                <AssetCollectionWidget name="Teams" count={teamChildren?.length ?? 0} />
              </Tooltip>
              <RiskIconWidget riskLevel={teamItem.riskLevel} />
              {application.isFeatureEnabled(FeatureFlag.RiskScore) && (
                <RiskScoreWidget
                  profile={{
                    ...teamItem,
                    riskScore: abbreviate(teamItem.riskScore),
                  }}
                />
              )}
            </WidgetsContainer>
          </TeamCardContent>

          <DropdownMenu onClick={preventDefault} onItemClick={preventDefault}>
            <Dropdown.Item key="edit" onClick={handleEdit}>
              Edit team
            </Dropdown.Item>
            <Dropdown.Item disabled={Boolean(teamItem.source)} key="delete" onClick={handleDelete}>
              Delete team
            </Dropdown.Item>
          </DropdownMenu>
        </TeamCardWrapper>

        {modalElement}
      </>
    );
  }
);

const TeamOwnerWidget = ({ name }: { name: string }) => (
  <TeamWidgetWrapper>
    <Avatar username={name} size={Size.LARGE} />
    <WidgetLabel>{name}</WidgetLabel>
  </TeamWidgetWrapper>
);

const AssetCollectionWidget = forwardRef<HTMLDivElement, { count: number; name: string }>(
  ({ count, name }, ref) => (
    <TeamWidgetWrapper ref={ref}>
      <Heading1>{count}</Heading1>
      <WidgetLabel>{name}</WidgetLabel>
    </TeamWidgetWrapper>
  )
);

const RiskIconWidget = ({ riskLevel }: { riskLevel: keyof typeof RiskLevel }) => (
  <RiskIconWrapper>
    <RiskIcon riskLevel={riskLevel} size={Size.LARGE} />
    <WidgetLabel>Risk</WidgetLabel>
  </RiskIconWrapper>
);

const HierarchyContainer = styled.div``;

const OwnersHierarchy = styled(Breadcrumbs)`
  ${Divider}:last-of-type {
    display: unset;
  }
`;

const WidgetLabel = styled(Small)`
  color: var(--default-text-color);
  white-space: nowrap;
`;

const TeamCardWrapper = styled(ProfileCard)`
  flex-direction: row;
`;

const TeamCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  > ${Heading1} {
    max-width: 150rem;
  }

  > ${Paragraph} {
    margin-bottom: 0;
  }
`;

const TeamWidgetWrapper = styled.div`
  min-width: 6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const WidgetsContainer = styled.div`
  display: flex;
  gap: 8rem;
  margin-top: 6rem;
`;

const LearningContainer = styled.span`
  display: inline-block;
  margin-left: 12px;
  vertical-align: text-bottom;
`;

const TitleContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const RiskIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding-top: 0.75rem;
  margin-left: 1.5rem;
`;
