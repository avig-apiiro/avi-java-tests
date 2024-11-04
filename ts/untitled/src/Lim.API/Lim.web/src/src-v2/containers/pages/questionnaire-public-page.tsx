import { useParams } from 'react-router-dom';
import { Questionnaire } from '@src-v2/containers/questionnaire/questionnaire';

const PublicQuestionnaire = () => {
  const { hash } = useParams<{ hash: string }>();
  return <Questionnaire responseKey={hash} />;
};

export default PublicQuestionnaire;
