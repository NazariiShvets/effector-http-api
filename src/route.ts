import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Store } from 'effector';
import { attach } from 'effector';
import deepmerge from 'deepmerge';

import type {
  NormalizedRequestConfig,
  RequestConfig,
  RouteFx,
  RouteOptions
} from './types';
import { createEffect } from 'effector/compat';

class EffectorApiRoute<Dto, Contract, AuthHeaders extends AxiosRequestHeaders> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,

    private readonly prefix: string,

    private readonly authHeaders: Store<AuthHeaders>,

    private readonly routeConfig: RequestConfig<Dto>,

    options: Partial<RouteOptions> = {}
  ) {
    this.mergeOptions(options);

    this.fx = this.createFx();
  }

  private options: RouteOptions = {
    abortOnConcurrent: false,
    auth: false
  };

  private abortController = new AbortController();

  public readonly fx: RouteFx<Dto, Contract>;

  private readonly createFx = () => {
    const requestFx = createEffect<Dto, Contract>() as RouteFx<Dto, Contract>;

    const internalFx = attach({
      source: this.authHeaders,
      mapParams: (dto: Dto, authHeaders): AxiosRequestConfig => {
        const config = this.normalizeConfig(this.routeConfig)(dto);

        this.attachPrefix(config);

        if (this.options.auth) {
          this.attachAuth(config, authHeaders);
        }

        if (this.options.abortOnConcurrent) {
          this.attachAbortController(config);
        }

        return config;
      },
      effect: this.baseRequestFx
    }) as unknown as Effect<Dto, AxiosResponse<Contract, Dto>>;

    requestFx.use(async dto => internalFx(dto).then(data => data.data));

    requestFx.doneParams = internalFx.doneData;

    return requestFx;
  };

  private readonly normalizeConfig = (
    config: RequestConfig<Dto>
  ): NormalizedRequestConfig<Dto> => {
    if (typeof config === 'function') {
      return dto => config(dto);
    }

    return dto => ({ ...config, data: dto });
  };

  private readonly mergeOptions = (options: Partial<RouteOptions>) => {
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

  private readonly attachAbortController = (config: AxiosRequestConfig) => {
    this.abortController.abort();

    this.abortController = new AbortController();

    config.signal = this.abortController.signal;
  };
}

export { EffectorApiRoute };
