import { Route, Switch } from 'react-router-dom';
import ManualFindingsContent from '@src-v2/containers/manual-findings/manual-findings-content';
import { ManualFindingsForm } from '@src-v2/containers/manual-findings/manual-findings-form';

export default () => {
  return (
    <Switch>
      <Route path={['/manual-findings/create', '/manual-findings/:key/edit']}>
        <ManualFindingsForm />
      </Route>
      <Route path="/manual-findings" exact>
        <ManualFindingsContent />
      </Route>
    </Switch>
  );
};
