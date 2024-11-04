import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { parseISO } from 'date-fns';
import _ from 'lodash';
import { Session } from '@src-v2/services/session';
import { AggregationResult } from '@src-v2/types/aggregation-result';
import { StubAny } from '@src-v2/types/stub-any';
import { qs } from '@src-v2/utils/history-utils';
import { entries } from '@src-v2/utils/ts-utils';

const dateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d*)?$/;

type RequestConfig<T extends boolean = false> = AxiosRequestConfig & {
  noInterceptor?: T extends true ? T : never;
};

type Response<TResult, TConfig extends boolean = false> = Promise<
  TConfig extends true ? AxiosResponse<TResult> : TResult
>;

export interface SearchParams extends Pick<AxiosRequestConfig, 'params'> {
  limit: number;
  pageNumber: number;
  sort: string;
  searchTerm: string;
  sortBy: string;
  sortDirection: 'Ascending' | 'Descending';
  filters: any;
  operator: any;
  moduleRoot: string;
  experimentalOperatorFilters?: boolean;
}

export class ApiClient {
  static HTTP_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  };

  static #proxyErrorStatuses = [502, 503, 504];

  #client: AxiosInstance;

  constructor({ config: { API_CLIENT_BASE_URL } }: { config: { API_CLIENT_BASE_URL: string } }) {
    this.#client = axios.create({
      baseURL: API_CLIENT_BASE_URL,
      paramsSerializer: { serialize: params => qs.stringify(params) },
    });
    this.#client.interceptors.response.use(dateStringsTransformer);
    this.#client.interceptors.response.use(
      res => (res.config.noInterceptor ? res : res.data),
      error => {
        const isGatewayEnv = error.response?.headers['x-apiiro-source'] === 'gateway';
        if (
          !error.response.headers.location &&
          error.config.url !== Session.authVerifyEndpoint &&
          (error.response?.status === ApiClient.HTTP_STATUS.UNAUTHORIZED ||
            error.response?.status === ApiClient.HTTP_STATUS.FORBIDDEN ||
            (isGatewayEnv && ApiClient.#proxyErrorStatuses.includes(error.response?.status)))
        ) {
          if (isGatewayEnv) {
            window.location.reload();
            return;
          }
          if (!document.cookie.includes('refreshed')) {
            document.cookie = `refreshed=true; expires=${new Date(
              new Date().getTime() + 10 * 60 * 1000
            ).toUTCString()}`;
            window.location.reload();
          }
        }
        throw error;
      }
    );
  }

  search<T = StubAny>(
    url: string,
    {
      limit = 20,
      pageNumber = 0,
      sort,
      searchTerm,
      sortBy,
      sortDirection,
      filters = {},
      operator,
      experimentalOperatorFilters,
      ...params
    }: Partial<SearchParams>,
    config?: RequestConfig
  ) {
    const tableFilterToQuery = experimentalOperatorFilters
      ? filters
      : transformLegacyFilters(filters);

    return this.get<AggregationResult<T>>(url, {
      ...config,
      params: {
        ...params,
        sortBy,
        sortDirection,
        searchTerm,
        pageSize: limit,
        sortOption: sort,
        skip: pageNumber * limit,
        tableFilterToQuery,
        tableFilterOperator: operator,
      },
    });
  }

  downloadBlob<TResult = unknown>(url: string, params?: StubAny) {
    return this.get<TResult, true>(url, {
      params,
      noInterceptor: true,
      responseType: 'blob',
    });
  }

  request<TResult, TConfig extends boolean = false>(
    config: RequestConfig<TConfig>
  ): Response<TResult, TConfig> {
    return this.#client.request(config);
  }

  get<TResult = StubAny, TConfig extends boolean = false>(
    url: string,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'get', url });
  }

  delete<TResult = void, TConfig extends boolean = false>(
    url: string,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'delete', url });
  }

  options<TResult = void, TConfig extends boolean = false>(
    url: string,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'options', url });
  }

  post<TResult = void, TPayload = StubAny, TConfig extends boolean = false>(
    url: string,
    data?: TPayload,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'post', url, data });
  }

  put<TResult = void, TPayload = StubAny, TConfig extends boolean = false>(
    url: string,
    data?: TPayload,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'put', url, data });
  }

  patch<TResult, TPayload = StubAny, TConfig extends boolean = false>(
    url: string,
    data?: TPayload,
    config?: RequestConfig<TConfig>
  ) {
    return this.request<TResult, TConfig>({ ...config, method: 'patch', url, data });
  }

  createCancelToken() {
    return axios.CancelToken.source();
  }

  isCancel(value: StubAny) {
    return axios.isCancel(value);
  }
}

function dateStringsTransformer(response: AxiosResponse): AxiosResponse {
  if (response.config.shouldTransformDates) {
    response.data = transformDates(response.data);
  }

  return response;
}

function transformDates(data: unknown): any {
  if (data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(transformDates);
  }

  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, transformDates(value)])
    );
  }

  if (typeof data !== 'string') {
    return data;
  }

  try {
    if (dateRegex.test(data)) {
      const dataAsDate = parseISO(data);
      if (!isNaN(dataAsDate.getTime())) {
        return dataAsDate;
      }
    }
  } catch {}

  return data;
}

export function transformLegacyFilters(
  filters: Record<string, string | string[] | { values?: string[]; operator?: 'Or' | 'And' }>
): Record<string, string[]> {
  return entries(filters).reduce((query, [key, filterData]) => {
    if (!filterData) {
      return query;
    }

    if (typeof filterData === 'string') {
      if (key !== 'searchTerm') {
        console.warn(
          `A string-based filter entry isn't searchTerm, filterKey: ${key}, value: ${filterData}`
        );
      }

      return { ...query, [key]: filterData };
    }

    if (_.isArray(filterData)) {
      console.warn(`A filter entry with array, filterKey: ${key}, value: ${filterData.join(', ')}`);

      return { ...query, [key]: filterData };
    }

    const values = filterData.values ?? [];
    if (filterData.operator === 'And' && !values.includes('And')) {
      values.push('And');
    }

    return { ...query, [key]: values };
  }, {});
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    noInterceptor?: boolean;
    shouldTransformDates?: boolean;
  }
}
