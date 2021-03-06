import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';

import type { Effect } from 'effector';

import { EffectorApiRoute } from './route';

import type {
  ApiUnits,
  ControllerRouteOptions,
  RequestConfigHandler,
  RouteOptions
} from './types';

class EffectorApiController<
  AuthHeaders extends AxiosRequestHeaders,
  CustomHeaders extends AxiosRequestHeaders
> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,

    private readonly units: ApiUnits<AuthHeaders, CustomHeaders>,

    private readonly urlSuffix: string,

    private readonly options: ControllerRouteOptions = {}
  ) {}

  public createRoute = <Dto = void, Contract = void>(
    config: RequestConfigHandler<Dto>,
    options: Partial<RouteOptions<Dto, Contract>> = {}
  ) =>
    new EffectorApiRoute<Dto, Contract, AuthHeaders, CustomHeaders>(
      this.baseRequestFx,
      this.urlSuffix,
      this.units,
      config,
      { ...this.options, ...options }
    ).fx;
}

export { EffectorApiController };
