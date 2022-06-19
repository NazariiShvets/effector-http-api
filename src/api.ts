import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import axios from 'axios';

import deepmerge from 'deepmerge';

import type { Effect } from 'effector';
import { createEffect, createStore, is } from 'effector';

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
    private readonly baseConfig: AxiosRequestConfig = {},
    private readonly routeOptions: ControllerRouteOptions = {}
  ) {
    this.instance = axios.create(this.baseConfig);

    this.baseRequestFx = createEffect(async (config: AxiosRequestConfig) =>
      this.instance.request(config)
    );
  }

  private readonly units: ApiUnits<AxiosRequestHeaders, AxiosRequestHeaders> = {
    authHeaders: createStore({}),
    customHeaders: createStore({})
  };

  private readonly instance: AxiosInstance;

  public readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>;

  public readonly headers = <
    Auth extends AxiosRequestHeaders,
    Custom extends AxiosRequestHeaders
  >(
    source: Partial<ApiUnits<Auth, Custom>>
  ) => {
    const { customHeaders, authHeaders } = source;

    if (is.store(customHeaders)) {
      this.units.customHeaders = customHeaders;
    }

    if (is.store(authHeaders)) {
      this.units.authHeaders = authHeaders;
    }
  };

  public readonly createController = (
    urlSuffix = '',
    routeOptions: ControllerRouteOptions = {}
  ) =>
    new EffectorApiController(
      this.baseRequestFx,
      this.units,
      urlSuffix,
      deepmerge(this.routeOptions, routeOptions)
    );

  public createRoute = <Dto = void, Contract = void>(
    config: RequestConfigHandler<Dto>,
    options: Partial<RouteOptions<Dto, Contract>> = {}
  ) =>
    new EffectorApiRoute<
      Dto,
      Contract,
      AxiosRequestHeaders,
      AxiosRequestHeaders
    >(
      this.baseRequestFx,
      '',
      this.units,
      config,
      deepmerge(this.routeOptions, options)
    ).fx;
}

export { EffectorApi };
