import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';

import deepmerge from 'deepmerge';

import type { Effect } from 'effector';
import { attach, createEffect } from 'effector';

import { createBatchedEffect, createMockEffect } from './lib';

import type {
  ApiUnits,
  ControllerRouteOptions,
  NormalizedRequestHandler,
  RequestConfigHandler,
  RouteOptions
} from './types';

class EffectorApiRoute<
  Dto,
  Contract,
  AuthHeaders extends AxiosRequestHeaders,
  CustomHeaders extends AxiosRequestHeaders
> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,

    private readonly prefix: string,

    private readonly units: ApiUnits<AuthHeaders, CustomHeaders>,

    private readonly routeConfigHandler: RequestConfigHandler<Dto>,

    options: Partial<RouteOptions<Dto, Contract>> = {}
  ) {
    this.mergeOptions(options);

    this.fx = this.createFx();
  }

  private options: RouteOptions<Dto, Contract> = {
    disableAuth: false,

    batchConcurrentRequests: false,

    mapRawResponse: (data: AxiosResponse<Contract, Dto>) => data.data
  };

  public readonly fx: Effect<Dto, Contract>;

  private readonly createFx = () => {
    if (this.options.mock)
      return createMockEffect<Dto, Contract>(this.options.mock);

    const createFx = this.options.batchConcurrentRequests
      ? createBatchedEffect
      : createEffect;

    return attach({
      source: this.units,
      mapParams: (dto: Dto, units): AxiosRequestConfig => {
        const config = this.normalizeConfigHandler(this.routeConfigHandler)(
          dto
        );

        config.headers = deepmerge(
          config.headers ?? {},
          units.customHeaders ?? {}
        );

        this.attachPrefix(config);

        if (!this.options.disableAuth) {
          this.attachAuth(config, units.authHeaders);
        }

        return this.formatConfig(config);
      },
      effect: createFx(async (params: AxiosRequestConfig) =>
        this.baseRequestFx(params).then(this.options.mapRawResponse)
      )
    }) as unknown as Effect<Dto, Contract>;
  };

  private readonly normalizeConfigHandler = (
    config: RequestConfigHandler<Dto>
  ): NormalizedRequestHandler<Dto> => {
    if (typeof config === 'function') {
      return dto => config(dto);
    }

    return dto => ({ ...config, data: dto });
  };

  private readonly mergeOptions = (
    options: Partial<ControllerRouteOptions>
  ) => {
    this.options = deepmerge(this.options, options);
  };

  private readonly attachPrefix = (config: AxiosRequestConfig) => {
    config.url = `${this.prefix}${config.url}`;
  };

  private readonly attachAuth = (
    config: AxiosRequestConfig,
    authHeaders: AxiosRequestConfig['headers']
  ) => {
    if (!authHeaders) {
      //TODO: Add console.warn to prevent usage {auth:true} without headers
    }
    config.headers = deepmerge(config.headers ?? {}, authHeaders ?? {});
  };

  private readonly attachDataAsParams = (config: AxiosRequestConfig) => {
    config.params = { ...(config.params ?? {}), ...config.data };
  };

  private readonly formatConfig = (config: AxiosRequestConfig) => {
    if (!config.method) {
      config.method = 'GET';
    }

    if (config.method.toUpperCase() === 'GET') {
      if (!!config.data && typeof config.data === 'object') {
        if (config.data && config.params) {
          //TODO: add console.warn to prevent usage
        }

        this.attachDataAsParams(config);
      }
    }

    return config;
  };
}

export { EffectorApiRoute };
