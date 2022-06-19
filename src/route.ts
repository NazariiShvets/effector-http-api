import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';

import deepmerge from 'deepmerge';

import type { Effect } from 'effector';
import { attach, createEffect } from 'effector';

import { createBatchedEffect, createMockEffect } from './custom-effects';
import { formatConfig, normalizeConfigHandler } from './lib';

import type { ApiUnits, RequestConfigHandler, RouteOptions } from './types';

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
    this.options = deepmerge(this.options, options);

    this.fx = this.createFx();
  }

  private readonly options: RouteOptions<Dto, Contract> = {
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
        const config = normalizeConfigHandler(this.routeConfigHandler)(dto);

        config.headers = deepmerge(
          config.headers ?? {},
          units.customHeaders ?? {}
        );

        config.url = `${this.prefix}${config.url}`;

        if (!this.options.disableAuth) {
          if (!units.authHeaders) {
            //TODO: Add console.warn to prevent usage {auth:true} without headers
          }

          config.headers = deepmerge(
            config.headers ?? {},
            units.authHeaders ?? {}
          );
        }

        return formatConfig(config);
      },
      effect: createFx(async (params: AxiosRequestConfig) =>
        this.baseRequestFx(params).then(this.options.mapRawResponse)
      )
    }) as unknown as Effect<Dto, Contract>;
  };
}

export { EffectorApiRoute };
