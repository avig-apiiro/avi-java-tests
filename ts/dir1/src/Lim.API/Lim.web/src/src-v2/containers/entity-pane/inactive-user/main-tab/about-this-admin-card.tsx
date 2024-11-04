import { ControlledCardProps } from '@src-v2/components/cards/controlled-card';
import {
  AboutThisUserCard,
  UserActionType,
} from '@src-v2/containers/entity-pane/inactive-user/main-tab/about-this-user-card';
import { useInactiveAdminContext } from '@src-v2/containers/entity-pane/inactive-user/use-inactive-admin-pane-context';

export function AboutThisAdminCard(props: ControlledCardProps) {
  const { element, risk } = useInactiveAdminContext();

  return (
    <AboutThisUserCard
      {...props}
      risk={risk}
      userType="Admin"
      developerKey={element.developerKey}
      lastActionTime={element.lastActivity}
      actionType={UserActionType.Activity}
    />
  );
}
