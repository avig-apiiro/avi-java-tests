import _ from 'lodash';
import { Route, Switch } from 'react-router-dom';
import { Button } from '@src-v2/components/button-v2';
import { UpgradeButton } from '@src-v2/components/marketing/upgrade-button';
import { Tooltip } from '@src-v2/components/tooltips/tooltip';
import { Size } from '@src-v2/components/types/enums/size';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

type Props = {
  disabled: boolean;
  assetCollectionCount: number;
  applicationGroupsCount?: number;
};

export const SwitchButtonByRoute = ({
  disabled,
  assetCollectionCount,
  applicationGroupsCount,
  ...props
}: Props) => {
  const {
    application,
    subscription: {
      limitations: { productsMaxCount },
    },
  } = useInject();

  return (
    <Switch>
      <Route path={['/profiles/applications', '/profiles/repositories']}>
        {!_.isNil(productsMaxCount) && assetCollectionCount >= productsMaxCount ? (
          <UpgradeButton>Create application</UpgradeButton>
        ) : (
          <Tooltip content="Contact your admin to create an application" disabled={!disabled}>
            <Button
              {...props}
              to="/profiles/applications/create"
              disabled={disabled}
              size={Size.LARGE}>
              Create application
            </Button>
          </Tooltip>
        )}
      </Route>

      {!(application.isFeatureEnabled(FeatureFlag.EmptyStates) && applicationGroupsCount === 0) && (
        <Route path="/profiles/groups">
          <Tooltip content="Contact your admin to create a group" disabled={!disabled}>
            <Button {...props} to="/profiles/groups/create" disabled={disabled}>
              Create Group
            </Button>
          </Tooltip>
        </Route>
      )}
    </Switch>
  );
};
