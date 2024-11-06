import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Section } from '@src-v2/types/queastionnaire/questionnaire-response';
import { toArray } from '@src-v2/utils/collection-utils';

export const useEnabledQuestions = (sections: Section[]) => {
  const allQuestions = sections.flatMap(section => section.questions);
  const [enabledQuestions, setEnabledQuestions] = useState(
    allQuestions.map(question => question.id)
  );
  const answers = useFormContext().watch();

  allQuestions.forEach(({ enabledBy, id }) => {
    if (!enabledBy) {
      return;
    }

    const parentQuestionAnswer = toArray(answers[enabledBy.questionId]);
    const isParentQuestionEnabled = enabledQuestions.includes(enabledBy.questionId);
    const shouldEnable =
      parentQuestionAnswer?.includes(enabledBy.answer) && isParentQuestionEnabled;
    const isCurrentlyEnabled = enabledQuestions.includes(id);

    if (shouldEnable && !isCurrentlyEnabled) {
      enabledQuestions.push(id);
      setEnabledQuestions(enabledQuestions);
    }

    if (!shouldEnable && isCurrentlyEnabled) {
      enabledQuestions.splice(enabledQuestions.indexOf(id), 1);
      setEnabledQuestions(enabledQuestions);
    }
  });

  return enabledQuestions;
};
