import { useEffect } from 'react';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { AnalyticsDataField, AnalyticsLayer } from '@src-v2/components/analytics-layer';
import { Page } from '@src-v2/components/layout/page';
import { NewQuestionnaireForm } from '@src-v2/containers/questionnaire/new-questionnaire-form';
import { Questionnaire } from '@src-v2/containers/questionnaire/questionnaire';
import { QuestionnairesList } from '@src-v2/containers/questionnaire/questionnaires-list';
import { TemplateEditor } from '@src-v2/containers/questionnaire/templates/template-editor';
import { TemplatePreview } from '@src-v2/containers/questionnaire/templates/template-preview';
import { TemplatesList } from '@src-v2/containers/questionnaire/templates/templates-list';
import { useInject } from '@src-v2/hooks';
import { FeatureFlag } from '@src-v2/types/enums/feature-flag';

export default () => {
  const { key } = useParams<{ key: string }>();

  const navigationLinks = [
    {
      label: 'Questionnaires',
      to: '/questionnaire',
      isActive: () => !key || key === 'questionnaires',
    },
    {
      label: 'Templates',
      to: '/questionnaire/templates',
      isActive: () => {
        return key === 'templates';
      },
    },
  ];

  const { application } = useInject();
  const history = useHistory();

  useEffect(() => {
    if (!application.isFeatureEnabled(FeatureFlag.Questionnaire)) {
      history.push('/');
    }
  }, []);

  return (
    <Page>
      <AnalyticsLayer analyticsData={{ [AnalyticsDataField.Context]: 'Questionnaire' }}>
        <Switch>
          <Route path="/questionnaire/create-questionnaire">
            <NewQuestionnaireForm />
          </Route>
          <Route path={['/questionnaire/template-editor/:key', '/questionnaire/template-editor']}>
            <TemplateEditor />
          </Route>
          <Route path="/questionnaire/templates">
            <TemplatesList navigation={navigationLinks} />
          </Route>
          <Route path="/questionnaire/template-preview/:key">
            <TemplatePreview />
          </Route>
          <Route path="/questionnaire/:key">
            <Questionnaire responseKey={key} />
          </Route>
          <Route path="/questionnaire">
            <QuestionnairesList navigation={navigationLinks} />
          </Route>
        </Switch>
      </AnalyticsLayer>
    </Page>
  );
};
