import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Store } from 'effector';
import { attach, createStore, sample } from 'effector';

import type { RequestConfigHandler } from './route';
import { Route } from './route';
import type { Routes } from './http-routes';
import { HttpRoutes } from './http-routes';

class Http {
  public constructor(private readonly instance: AxiosInstance) {
    this.baseRequestFx = attach({
      source: this.$headers,
      effect: async (headers, config: AxiosRequestConfig) =>
        instance.request({
          ...config,
          headers: { ...(config.headers ?? {}), ...headers }
        })
    });
  }

  private readonly $headers = createStore<AxiosRequestHeaders>({});

  private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>;

  private routes: undefined | (<T>() => HttpRoutes<T>);

  public createRoute = <D, C>(config: RequestConfigHandler<D>) =>
    new Route<D, C>(this.baseRequestFx, config);

  public headers = (unit: Store<AxiosRequestHeaders>) => {
    sample({
      source: unit,
      target: this.$headers
    });
  };

  public createHttpRoutes = <T>(routes: Routes<T>) => {
    const httpRoutes = new HttpRoutes<T>(routes);

    this.routes = () => httpRoutes;

    return httpRoutes.routes;
  };
}

export { Http };
