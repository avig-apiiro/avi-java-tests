import { makeObservable, observable } from 'mobx';
import { SearchState } from '@src-v2/models/search-state';
import { StubAny } from '@src-v2/types/stub-any';

export class DataTableGrouping<TRow extends { key: string }, TMetadata = never> {
  columns: any;
  key: string;
  searchParams?: Record<string, string | string[]>;
  searchState: SearchState<TRow, TMetadata>;

  constructor({ searchState, columns, key, searchParams }: StubAny) {
    this.searchState = searchState;
    this.columns = columns;
    this.searchParams = searchParams;
    this.key = key;

    makeObservable(this, {
      columns: observable,
      searchState: observable,
      searchParams: observable,
    });
  }
}
