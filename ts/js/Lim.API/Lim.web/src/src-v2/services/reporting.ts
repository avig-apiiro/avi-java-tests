import {
  MetabaseCollection,
  MetabaseDashboard,
  MetabaseReport,
} from '@src-v2/containers/pages/reporting/types';
import { ApiClient } from '@src-v2/services/api-client';
import { StubAny } from '@src-v2/types/stub-any';
import { makeUrl } from '@src-v2/utils/history-utils';

export class Reporting {
  #client: ApiClient;
  #asyncCache;
  #proxyPrefix = '/proxy/reporting/';
  #hideLogo = false;
  #breadcrumbs = false;
  #header = false;
  #side_nav = false;
  #top_nav = false;
  #action_buttons = false;
  #additional_info = false;
  #new_button = false;
  #search = false;

  constructor({ apiClient, asyncCache }: StubAny) {
    this.#client = apiClient;
    this.#asyncCache = asyncCache;
  }

  async getMetabaseDashboardIframeUrl(dashboard: StubAny): Promise<string> {
    const jwt = await this.#getSsoJwt();
    const dashboardId = await this.#getDashboardId(dashboard);

    return makeUrl(`${this.#proxyPrefix}auth/sso`, {
      jwt,
      return_to: makeUrl(`/proxy/reporting/dashboard/${dashboardId}`, {
        logo: this.#hideLogo,
        breadcrumbs: this.#breadcrumbs,
        header: this.#header,
        side_nav: this.#side_nav,
        top_nav: this.#top_nav,
        action_buttons: this.#action_buttons,
        additional_info: this.#additional_info,
        new_button: this.#new_button,
        search: this.#search,
      }),
    });
  }

  async getDisplayCustomReportIframeUrl(dashboardId: StubAny): Promise<string> {
    const jwt = await this.#getSsoJwt();

    return makeUrl(`${this.#proxyPrefix}auth/sso`, {
      jwt,
      return_to: makeUrl(`/proxy/reporting/dashboard/${dashboardId}`, {
        logo: this.#hideLogo,
        breadcrumbs: this.#breadcrumbs,
        header: this.#header,
        side_nav: this.#side_nav,
        top_nav: this.#top_nav,
        action_buttons: this.#action_buttons,
        additional_info: this.#additional_info,
        new_button: this.#new_button,
        search: this.#search,
      }),
    });
  }

  async getEditCustomReportIframeUrl(dashboardId: StubAny): Promise<string> {
    const jwt = await this.#getSsoJwt();

    return makeUrl(`${this.#proxyPrefix}auth/sso`, {
      jwt,
      return_to: makeUrl(`/proxy/reporting/dashboard/${dashboardId}`, {
        logo: false,
        breadcrumbs: true,
        header: true,
        side_nav: true,
        top_nav: true,
        action_buttons: true,
        additional_info: true,
        new_button: true,
        search: true,
      }),
    });
  }

  async getMetabaseCustomOptionsIframeUrl(): Promise<string> {
    const jwt = await this.#getSsoJwt();

    return makeUrl(`${this.#proxyPrefix}auth/sso`, {
      jwt,
      return_to: makeUrl(`/proxy/reporting/question/notebook`, {
        logo: false,
        breadcrumbs: true,
        header: true,
        side_nav: true,
        top_nav: true,
        action_buttons: true,
        additional_info: true,
        new_button: true,
        search: true,
      }),
    });
  }

  async getOrganizationReportsUrl(): Promise<string> {
    const id = await this.#getPersonalCollectionID();
    const jwt = await this.#getSsoJwt();

    return makeUrl(`${this.#proxyPrefix}auth/sso`, {
      jwt,
      return_to: makeUrl(`/proxy/reporting/collection/${id}`, {
        logo: false,
        breadcrumbs: true,
        header: true,
        side_nav: true,
        top_nav: true,
        action_buttons: true,
        additional_info: true,
        new_button: true,
        search: true,
      }),
    });
  }

  async getCustomReports(): Promise<MetabaseReport[]> {
    return await this.#client.get('reporting/customReports');
  }

  async getDashboardById(dashboardId: string): Promise<MetabaseDashboard> {
    return await this.#client.get('reporting/dashboard', {
      params: { dashboardId },
    });
  }

  async deleteDashboardById(dashboardId: string): Promise<void> {
    await this.#client.delete('reporting/dashboard', {
      params: { dashboardId },
    });

    await this.#asyncCache.invalidateAll(this.getCustomReports);
  }

  async getCollectionById({ collectionId }: StubAny): Promise<MetabaseCollection> {
    return await this.#client.get('reporting/collection', {
      params: { collectionId },
    });
  }

  async #getSsoJwt(): Promise<string> {
    return await this.#client.get('reporting/signedJwt');
  }

  async #getDashboardId(path: string): Promise<string> {
    return await this.#client.get('reporting/dashboardId', {
      params: { dashboardName: this.getDashboardName(path) },
    });
  }

  async #getPersonalCollectionID(): Promise<string> {
    const data = await this.#client.get<StubAny>('reporting/collectionId', {
      params: { collectionName: 'Personal Collection' },
    });
    return data.id;
  }

  getDashboardName(pageTitle: StubAny) {
    switch (pageTitle) {
      case 'risk':
        return 'Risk';
      case 'application':
        return 'Application';
      case 'business':
        return 'Business';
      case 'teams':
        return 'Teams';
      case 'CVE risk insights':
        return 'Vulnerabilities';
      case 'licensing':
        return 'Licensing';
      case 'secrets':
        return 'Secrets';
      case 'sast':
        return 'SAST';
      case 'sscs':
        return 'SSCS';
      case 'api':
        return 'API';
      default:
        throw new Error("Dashboard doesn't exist");
    }
  }
}
