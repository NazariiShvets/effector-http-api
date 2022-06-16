import type { Effect } from 'effector';
import { attach, createEffect, createStore, is } from 'effector';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import axios from 'axios';
import deepmerge from 'deepmerge';

import type { ApiUnits, RouteOptions } from './types';
import { EffectorApiController } from './controller';

class EffectorApi {
  public constructor(
    private readonly baseConfig: AxiosRequestConfig = {},
    private readonly routeOptions: RouteOptions = {}
  ) {
    this.instance = axios.create(this.baseConfig);

    this.baseFx = attach({
      source: this.units.customHeaders,

      mapParams: (params: AxiosRequestConfig, headers) => {
        params.headers = deepmerge(headers, params.headers ?? {});

        return this.formatConfig(params);
      },

      effect: createEffect(async (config: AxiosRequestConfig) =>
        this.instance.request(config)
      )
    });
  }

  private readonly units: ApiUnits<AxiosRequestHeaders, AxiosRequestHeaders> = {
    authHeaders: createStore({}),
    customHeaders: createStore({})
  };

  private readonly options = {
    dataToParamsMethods: ['GET']
  };

  private readonly instance: AxiosInstance;

  public readonly baseFx: Effect<AxiosRequestConfig, AxiosResponse>;

  private readonly formatConfig = (config: AxiosRequestConfig) => {
    if (!config.method) {
      config.method = 'GET';
    }

    if (
      this.options.dataToParamsMethods.includes(config.method.toUpperCase())
    ) {
      if (!!config.data && typeof config.data === 'object') {
        if (config.data && config.params) {
          //TODO: add console.warn to prevent usage
        }

        this.attachDataAsParams(config);
      }
    }

    return config;
  };

  private readonly attachDataAsParams = (config: AxiosRequestConfig) => {
    config.params = { ...(config.params ?? {}), ...config.data };
  };

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
    routeOptions: RouteOptions = {}
  ) =>
    new EffectorApiController(
      this.baseFx,
      this.units.authHeaders,
      urlSuffix,
      deepmerge(this.routeOptions, routeOptions)
    );
}

export { EffectorApi };
