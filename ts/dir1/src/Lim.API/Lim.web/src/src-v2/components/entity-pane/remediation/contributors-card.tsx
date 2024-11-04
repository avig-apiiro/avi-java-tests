import { Fragment, ReactNode } from 'react';
import styled from 'styled-components';
import { Avatar, AvatarProfile } from '@src-v2/components/avatar';
import { Card, DoubleCollapsibleCard } from '@src-v2/components/cards';
import { useEntityPaneContext } from '@src-v2/components/entity-pane/entity-context-provider';
import { CardTitle } from '@src-v2/components/panes/pane-body';
import { Size } from '@src-v2/components/types/enums/size';
import { Link, ListItem, Paragraph, UnorderedList } from '@src-v2/components/typography';
import { useInject, useSuspense } from '@src-v2/hooks';
import { LeanConsumableProfile } from '@src-v2/types/profiles/lean-consumable-profile';
import { LeanDeveloper } from '@src-v2/types/profiles/lean-developer';
import { StyledProps } from '@src-v2/types/styled';
import { humanize } from '@src-v2/utils/string-utils';

export function ContributorsCard({ codeOwnerIsRepoAdmin }: { codeOwnerIsRepoAdmin?: boolean }) {
  const { risk, element, relatedProfile, applications } = useEntityPaneContext();
  const { developers, contributors } = useInject();

  const [introducer, lastModifier, applicationsWithPointsOfContact] = useSuspense([
    [
      developers.getLeanDeveloperProfile,
      {
        key: element.codeOwnerEntity?.identityKey,
      },
    ] as const,
    [
      contributors.getElementLastModifier,
      {
        repositoryKey: relatedProfile.key,
        entityKey: encodeURIComponent(element.entityId),
        entityType: element.entityType,
      },
    ] as const,
    [
      contributors.getApplicationsPointsOfContact,
      { applicationKeys: applications?.map(app => app.key) },
    ] as const,
  ]);

  const isIntroducerAlsoModifier =
    Boolean(introducer) && introducer.identityKey === lastModifier?.identityKey;

  const contributorsCount = [
    risk?.codeOwner,
    introducer,
    isIntroducerAlsoModifier ? null : lastModifier,
  ].filter(Boolean).length;

  return (
    <CardContainer
      card={Card}
      showMoreText="Show more points of contact"
      defaultOpen={!contributorsCount}
      content={
        <>
          <CardTitle>
            Contributors {Boolean(contributorsCount) && `(${contributorsCount})`}
          </CardTitle>
          <UnorderedList>
            {risk?.codeOwner && (
              <ContributorListItem contributor={risk.codeOwner} relatedEntity={relatedProfile}>
                <ContributorUsernameLink contributor={risk.codeOwner} />
                &nbsp;
                {codeOwnerIsRepoAdmin
                  ? 'is an admin in this repository'
                  : 'is a main contributor for this context'}
              </ContributorListItem>
            )}

            {introducer && (
              <ContributorListItem contributor={introducer} relatedEntity={relatedProfile}>
                Introduced {isIntroducerAlsoModifier ? 'and last modified' : ''} by&nbsp;
                <ContributorUsernameLink contributor={introducer} />
              </ContributorListItem>
            )}

            {lastModifier && !isIntroducerAlsoModifier && (
              <ContributorListItem contributor={lastModifier} relatedEntity={relatedProfile}>
                Last modified by&nbsp;
                <ContributorUsernameLink contributor={lastModifier} />
              </ContributorListItem>
            )}
          </UnorderedList>
        </>
      }
      nestedContent={applicationsWithPointsOfContact
        ?.filter(application => Boolean(application.pointsOfContact?.length))
        .map(application => (
          <Fragment key={application.key}>
            <PointsOfContactTitle>
              "{application.name}" application's points of contact:
            </PointsOfContactTitle>
            <UnorderedList>
              {application.pointsOfContact
                .filter(contact => Boolean(contact.username))
                .map(contact => (
                  <ContributorListItem
                    key={contact.identityKey}
                    contributor={contact}
                    relatedEntity={relatedProfile}>
                    <ContributorUsernameLink contributor={contact} />
                    &nbsp;is the {humanize(contact.jobTitle, true)}
                  </ContributorListItem>
                ))}
            </UnorderedList>
          </Fragment>
        ))}
    />
  );
}

const CardContainer = styled(DoubleCollapsibleCard)`
  ${UnorderedList}:not(:last-child) {
    margin-bottom: 3rem;
  }
`;

export const ContributorListItem = styled(
  ({
    contributor,
    children,
    relatedEntity,
    ...props
  }: StyledProps<{
    contributor: LeanDeveloper;
    relatedEntity: Partial<LeanConsumableProfile>;
    children?: ReactNode;
  }>) => (
    <ListItem {...props}>
      <AvatarProfile
        username={contributor.username}
        size={Size.MEDIUM}
        identityKey={contributor.identityKey}
        active={relatedEntity?.isActive}
        activeSince={new Date(relatedEntity?.activeSince)}
        lastActivity={new Date(relatedEntity?.lastActivity)}
      />
      {children}
    </ListItem>
  )
)`
  display: flex;
  align-items: center;
  margin-bottom: 4rem !important;

  ${Avatar} {
    margin-right: 2rem;
  }
`;

export function ContributorUsernameLink({
  contributor: { username, identityKey },
}: {
  contributor: LeanDeveloper;
}) {
  return <Link to={`/users/contributors/${identityKey}`}>{username}</Link>;
}

const PointsOfContactTitle = styled(Paragraph)`
  padding-top: 3rem;
  margin-bottom: 3rem;
  font-size: var(--font-size-m);
  font-weight: 500;

  &:not(:first-child) {
    margin-top: 6rem;
  }
`;
