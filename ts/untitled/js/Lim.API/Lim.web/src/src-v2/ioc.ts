import Bottle from 'bottlejs';
import { createBrowserHistory } from 'history';
import { bindAll, camelCase } from 'lodash';
import { Services } from '@src-v2/hooks';
import * as services from './services';

export const bottle = new Bottle();

bottle.constant('config', process.env.APIIRO_CONFIG);
bottle.constant('history', createBrowserHistory());

for (const [serviceName, Service] of Object.entries(services)) {
  bottle.factory(camelCase(serviceName), container => {
    // @ts-expect-error
    const service = new Service(container);
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(service)).filter(
      propertyName => typeof service[propertyName] === 'function' && propertyName !== 'constructor'
    );
    return bindAll(service, methods);
  });
}

export default bottle.container as unknown as Services;

if (module.hot) {
  // @ts-expect-error
  window.ioc = bottle.container;
}
