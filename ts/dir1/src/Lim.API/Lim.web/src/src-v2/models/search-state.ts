import { computed, makeObservable, observable } from 'mobx';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StubAny } from '@src-v2/types/stub-any';
import { modify } from '@src-v2/utils/mobx-utils';

export interface ISearchState<TRow, TMetadata = never> {
  loading: boolean;
  error: any;
  items: TRow[];
  count?: number;
  total?: number;
  metadata: TMetadata;
  onSetActiveSort: () => void;
  params: { limit: number; pageNumber: number };
  latestPromise: Promise<any>;
  hasMore?: boolean;
  loadMore?: () => Promise<any>;
  currentPage: number;
  pageCount: number;
  pageNumber: number;
  limit: number;
}

export class SearchState<TRow, TMetadata = never> implements ISearchState<TRow, TMetadata> {
  loading = true;
  error: any = null;
  items: TRow[] = [];
  count: number = undefined; // TODO: change this name to `totalFiltered` or `totalMatchingItems` or something to clarify that this is the total number of items that match the search / filter criteria
  total: number = undefined;
  metadata: TMetadata = null;
  onSetActiveSort: () => void = null;
  params = { limit: 20, pageNumber: 0 };
  latestPromise: Promise<any> = null;
  latestTotalCountPromise: Promise<number> = null;
  latestFilteredCountPromise: Promise<number> = null;

  constructor() {
    makeObservable(this, {
      loading: observable,
      error: observable,
      items: observable,
      count: observable,
      total: observable,
      params: observable,
      onSetActiveSort: observable,
      metadata: observable,
      pageCount: computed,
      itemsRange: computed,
      isLoadingCounters: computed,
    });
  }

  observeRequest(
    requestPromise: Promise<AggregationResult<TRow> & { metadata: TMetadata }>,
    params: any,
    itemsOnly: boolean = false
  ) {
    this.latestPromise = requestPromise;

    modify(this, { loading: true, error: null, params });
    requestPromise.then(
      ({ items = [], count = 0, total = 0, metadata }) => {
        if (this.latestPromise !== requestPromise) {
          // there's been another, more recent promise. This promise is irrelevant.
          return;
        }

        let modification: Partial<SearchState<TRow, TMetadata>> = {
          loading: false,
          error: null,
          items,
          metadata,
        };
        if (!itemsOnly) {
          modification = {
            ...modification,
            count,
            total,
          };
        }
        modify(this, modification);
      },
      error => {
        if (this.latestPromise !== requestPromise) {
          return;
        }
        modify(this, { loading: false, error });
      }
    );
  }

  observeTotalCountPromise(request: Promise<number>) {
    modify(this, { total: undefined });
    this.latestTotalCountPromise = request;

    request.then(
      totalCount => {
        if (this.latestTotalCountPromise !== request) {
          // there's been another, more recent promise. This promise is irrelevant.
          return;
        }
        modify(this, {
          total: totalCount,
        });
      },
      (error: any) => {
        if (this.latestTotalCountPromise !== request) {
          return;
        }
        modify(this, { error });
      }
    );
  }

  observeFilteredCountRequest(request: Promise<number>) {
    modify(this, { count: undefined });
    this.latestFilteredCountPromise = request;

    request.then(
      filteredCount => {
        if (this.latestFilteredCountPromise !== request) {
          // there's been another, more recent promise. This promise is irrelevant.
          return;
        }
        modify(this, {
          count: filteredCount,
        });
      },
      (error: any) => {
        if (this.latestTotalCountPromise !== request) {
          return;
        }
        modify(this, { error });
      }
    );
  }

  get currentPage() {
    return this.params.pageNumber;
  }

  get pageCount() {
    return Math.ceil(this.count / this.limit);
  }

  get pageNumber(): number {
    return this.params?.pageNumber ? parseInt(this.params.pageNumber as any) : 0;
  }

  get limit(): number {
    return this.params?.limit ? parseInt(this.params.limit as any) : 1; // '1' is default value because it's used as a denominator
  }

  get isLoadingCounters(): boolean {
    return this.count === undefined || this.total === undefined;
  }

  get itemsRange() {
    return this.count && this.params
      ? [this.pageNumber * this.limit + 1, Math.min((this.pageNumber + 1) * this.limit, this.count)]
      : [0];
  }
}

export class PersistentSearchState<T> extends SearchState<T> {
  constructor() {
    super();
    makeObservable(this, { hasMore: computed });
  }

  observeRequest(requestPromise: StubAny, params: StubAny) {
    modify(this, { loading: true, error: null, params });
    requestPromise.then(
      ({ items = [], count = 0, total = 0 }) =>
        modify(this, {
          items: this.items.concat(items),
          loading: false,
          error: null,
          count,
          total,
        }),
      (error: StubAny) => modify(this, { loading: false, error })
    );
  }

  loadMore() {
    modify(this.params, 'pageNumber', this.params.pageNumber + 1);
  }

  get hasMore() {
    return this.items.length < this.count && !this.error;
  }
}
