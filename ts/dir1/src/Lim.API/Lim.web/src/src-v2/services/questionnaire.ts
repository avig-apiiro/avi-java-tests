import { transformFilterGroups } from '@src-v2/data/transformers';
import type { ApiClient } from '@src-v2/services/api-client';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { MultipleErrors } from '@src-v2/types/multipleErrors';
import { QuestionnaireRequest } from '@src-v2/types/queastionnaire/questionnaire-request';
import type {
  QuestionnaireResponse,
  Respondent,
} from '@src-v2/types/queastionnaire/questionnaire-response';
import {
  QuestionnaireSummary,
  QuestionnaireTemplateSummary,
} from '@src-v2/types/queastionnaire/questionnaire-summary';
import { Template } from '@src-v2/types/queastionnaire/template';
import { StubAny } from '@src-v2/types/stub-any';

function throwUserFriendlyMessage(error: StubAny) {
  const messages =
    error?.response?.status !== 400 ? ['Something went wrong'] : error.response.data.split('\n');
  throw new MultipleErrors(messages);
}

export class Questionnaires {
  #client: ApiClient;
  #asyncCache;

  constructor({ apiClient, asyncCache }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  getFilterOptions() {
    return this.#client
      .get('questionnaires/filterOptions')
      .then((options: StubAny) => options.map(transformFilterGroups));
  }

  getQuestionnaireResponses(params: StubAny): Promise<AggregationResult<QuestionnaireSummary>> {
    return this.#client.search('questionnaires/search', params);
  }

  getQuestionnaire({
    responseKey,
    accessKey,
    isAdminView = false,
  }: StubAny): Promise<QuestionnaireResponse> {
    return this.#client.get(
      `questionnaires${
        isAdminView ? '/' : '/anonymous/'
      }${responseKey}?accessKey=${encodeURIComponent(accessKey)}`
    );
  }

  async submitResponse(
    responseKey: string,
    accessKey: string,
    respondent: Respondent,
    data: StubAny
  ): Promise<void> {
    const answers = Object.entries(data).map(([questionId, answer]) => {
      return {
        questionId,
        answer: answer === null || Array.isArray(answer) ? answer : [answer],
      };
    });

    await this.#client.post(
      `questionnaires/${responseKey}/response?accessKey=${encodeURIComponent(accessKey)}`,
      {
        answers,
        respondent,
      }
    );
    this.#asyncCache.invalidateAll(this.getQuestionnaireResponses);
    this.#asyncCache.invalidateAll(this.getQuestionnaire, { responseKey, accessKey });
  }

  async newQuestionnaire(request: QuestionnaireRequest) {
    this.#asyncCache.invalidateAll(this.getQuestionnaireResponses);
    try {
      return await this.#client.post<{ id: string; accessKey: string }>('/questionnaires', request);
    } catch (error) {
      throwUserFriendlyMessage(error);
    }
  }

  async discard(id: StubAny) {
    await this.#client.post(`/questionnaires/${id}/discard`, {});
    this.#asyncCache.invalidateAll(this.getQuestionnaireResponses);
    this.#asyncCache.invalidateAll(this.getQuestionnaire);
  }

  async getNewQuestionnaireOptions(): Promise<{
    templates: { id: string; title: string }[];
  }> {
    const { templates } = await this.#client.get<{
      templates: { id: string; title: string }[];
    }>('questionnaires/new-questionnaire-options');

    return { templates };
  }

  async getQuestionnaireTemplates(
    params: StubAny
  ): Promise<AggregationResult<QuestionnaireTemplateSummary>> {
    return await this.#client.search('questionnaire-templates/search', params);
  }

  async getTemplate(id: StubAny): Promise<Template> {
    return id
      ? await this.#client.get(`questionnaire-templates/${id}`)
      : Promise.resolve({ id: '', title: '', description: '', sections: [] });
  }

  async saveTemplate(template: Template) {
    try {
      await this.#client.post(`questionnaire-templates/${template.id}`, template);
    } catch (error) {
      throwUserFriendlyMessage(error);
    }
    this.#asyncCache.invalidateAll(this.getQuestionnaireTemplates);
    this.#asyncCache.invalidateAll(this.getTemplate);
    this.#asyncCache.invalidateAll(this.getTemplatePreview);
  }

  async duplicateTemplate(id: string, newTitle: string) {
    try {
      await this.#client.post(`questionnaire-templates/duplicate/${id}`, { newTitle });
    } catch (error) {
      throwUserFriendlyMessage(error);
    }
    this.#asyncCache.invalidateAll(this.getQuestionnaireTemplates);
  }

  getTemplatePreview({ templateKey }: { templateKey: string }): Promise<QuestionnaireResponse> {
    return this.#client.get(`questionnaire-templates/preview/${templateKey}`);
  }
}
