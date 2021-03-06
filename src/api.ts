import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import axios from 'axios';

import type { Effect } from 'effector';
import { createEffect, createStore, is, sample } from 'effector';

import { EffectorApiController } from './controller';

import { EffectorApiRoute } from './route';

import type {
  ApiUnits,
  ControllerRouteOptions,
  RequestConfigHandler,
  RouteOptions
} from './types';

class EffectorApi {
  public constructor(
    baseConfig: AxiosRequestConfig = {},
    private readonly routeOptions: ControllerRouteOptions = {}
  ) {
    this.instance = axios.create(baseConfig);

    this.baseRequestFx = createEffect(async (config: AxiosRequestConfig) =>
      this.instance.request(config)
    );
  }

  private readonly units: ApiUnits<AxiosRequestHeaders, AxiosRequestHeaders> = {
    auth: createStore({}),
    custom: createStore({})
  };

  public readonly instance: AxiosInstance;

  public readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>;

  public readonly headers = <
    Auth extends AxiosRequestHeaders,
    Custom extends AxiosRequestHeaders
  >(
    source: Partial<ApiUnits<Auth, Custom>>
  ) => {
    const { custom, auth } = source;

    if (is.store(custom)) {
      sample({
        source: custom,
        target: this.units.custom
      });
    }

    if (is.store(auth)) {
      sample({
        source: auth,
        target: this.units.auth
      });
    }
  };

  public readonly createController = (
    urlSuffix = '',
    routeOptions: ControllerRouteOptions = {}
  ) =>
    new EffectorApiController(this.baseRequestFx, this.units, urlSuffix, {
      ...this.routeOptions,
      ...routeOptions
    });

  public createRoute = <Dto = void, Contract = void>(
    config: RequestConfigHandler<Dto>,
    options: Partial<RouteOptions<Dto, Contract>> = {}
  ) =>
    new EffectorApiRoute<
      Dto,
      Contract,
      AxiosRequestHeaders,
      AxiosRequestHeaders
    >(this.baseRequestFx, '', this.units, config, {
      ...this.routeOptions,
      ...options
    }).fx;
}

export { EffectorApi };
