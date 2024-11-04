import { useFieldArray, useFormContext } from 'react-hook-form';

export const useTemplateEditor = () => {
  const { control, watch, setValue } = useFormContext();

  const { append, insert, remove } = useFieldArray({
    control,
    name: 'sections',
  });

  const template = watch();

  return {
    appendSection: () => {
      append({
        id: crypto.randomUUID(),
        title: '',
        description: '',
        questions: [],
      });
    },

    insertSection: index => {
      insert(index + 1, {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        questions: [],
      });
    },

    removeSection: remove,

    addQuestion: sectionIndex => {
      setValue(`sections[${sectionIndex}].questions`, [
        ...template.sections[sectionIndex].questions,
        {
          id: crypto.randomUUID(),
          type: 'singleselect',
          title: '',
          description: '',
          options: [
            {
              value: 'Yes',
              score: '0.0',
            },
            {
              value: 'No',
              score: '0.0',
            },
          ],
          enabledBy: null,
          answer: null,
          answeredBy: null,
          score: null,
        },
      ]);
    },

    updateQuestion: (sectionIndex, questionIndex, updatedQuestion) =>
      setValue(`sections[${sectionIndex}].questions[${questionIndex}]`, updatedQuestion),

    deleteQuestion: ({ sectionIndex, questionIndex }) =>
      setValue(
        `sections[${sectionIndex}].questions`,
        template.sections[sectionIndex].questions.filter((_, index) => index !== questionIndex)
      ),
    template,
  };
};
