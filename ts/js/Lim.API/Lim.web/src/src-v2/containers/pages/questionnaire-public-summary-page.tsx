import { useParams } from 'react-router-dom';
import { QuestionnaireSummary } from '@src-v2/containers/questionnaire/questionnaire-summary';

const PublicSummary = () => {
  const { hash } = useParams<{ hash: string }>();
  return <QuestionnaireSummary responseKey={hash} />;
};

export default PublicSummary;
