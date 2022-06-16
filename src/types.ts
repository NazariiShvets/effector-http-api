import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';

import type { Store } from 'effector';

type ControllerRouteOptions = {
  /**
   * Don`t send options.authHeaders with request
   */
  disableAuth?: boolean;

  /**
   * If route called multiple times while request is pending,
   * calls will be batched with call which start a request
   */
  batchConcurrentRequests?: boolean;
};

type RouteOptions<Dto, Contract> = ControllerRouteOptions & {
  /**
   * Custom resolver for mapping response
   *
   * Example: POST request Dto has {id: string}, backend returns void,
   *
   *`mapRawResponse: (response) => response.request.data.id` returns id what you send
   *
   * Note: response.request.data in AxiosResponse is non required field. This case you need match yourself
   */
  mapRawResponse?: <Response extends AxiosResponse<any, Dto>>(
    raw: Response
  ) => Contract;

  mock?: {
    /**
     * Returns instead real call request
     */
    response: Contract | RouteOptionsMockResponseHandler<Dto, Contract>;

    /**
     * Delay before return `mock.response`
     */
    delay?: number;
  };
};

type RouteOptionsMockResponseHandler<Dto, Contract> = (dto: Dto) => Contract;

type RequestConfigHandler<Dto> =
  | AxiosRequestConfig<Dto>
  | NormalizedRequestHandler<Dto>;

type NormalizedRequestHandler<Dto> = (dto: Dto) => AxiosRequestConfig;

type ApiUnits<
  Auth extends AxiosRequestHeaders,
  Custom extends AxiosRequestHeaders
> = {
  authHeaders: Store<Auth>;
  customHeaders: Store<Custom>;
};

export type {
  RouteOptions,
  RequestConfigHandler,
  ControllerRouteOptions,
  NormalizedRequestHandler,
  ApiUnits,
  RouteOptionsMockResponseHandler
};
