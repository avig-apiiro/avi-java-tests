import { Status } from '@src-v2/containers/modals/new-feedback-modal';
import { ApiClient } from '@src-v2/services/api-client';
import { DiffableEntityDataModelReference } from '../types/data-model-reference/data-model-reference';
import { AsyncCache } from './async-cache';

export interface FeedbackContext {
  dependencyDataModelReference: DiffableEntityDataModelReference;
  dependencyFindingId: string;
  fieldName: string;
}

export interface FeedbackObject {
  sentiment: Status;
  selectedReasons?: Record<string, boolean>;
  freeText?: string;
  context: FeedbackContext;
}

export class Feedback {
  #client: ApiClient;
  #asyncCache: AsyncCache;

  constructor({ apiClient, asyncCache }: { apiClient: ApiClient; asyncCache: AsyncCache }) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  async createNewFeedback(feedbackObject: FeedbackObject) {
    const res = await this.#client.post<{ key: string }>('feedbacks', feedbackObject);
    this.#asyncCache.invalidate(this.getFeedback, feedbackObject.context);
    return res;
  }

  async deleteFeedback(key: string) {
    await this.#client.delete(`feedbacks/${key}`);
    this.#asyncCache.invalidateAll(this.getFeedback);
  }

  getFeedback(context: FeedbackContext) {
    return this.#client.get<{
      feedback: {
        sentiment: Status;
        key: string;
      };
    }>('feedbacks', {
      params: {
        ...context.dependencyDataModelReference,
        dependencyFindingId: context.dependencyFindingId,
        fieldName: context.fieldName,
      },
    });
  }
}
