import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Store } from 'effector';
import type { RequestConfig, RouteOptions } from './types';
import deepmerge from 'deepmerge';
import { EffectorApiRoute } from './route';

class EffectorApiController<AuthHeaders extends AxiosRequestHeaders> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,

    private readonly authHeaders: Store<AuthHeaders>,

    private readonly urlSuffix: string,

    private readonly options: RouteOptions
  ) {}

  public createRoute = <Dto = void, Contract = void>(
    config: RequestConfig<Dto>,
    options: Partial<RouteOptions> = {}
  ) =>
    new EffectorApiRoute<Dto, Contract, AuthHeaders>(
      this.baseRequestFx,
      this.urlSuffix,
      this.authHeaders,
      config,
      deepmerge(this.options, options)
    ).fx;
}

export { EffectorApiController };
