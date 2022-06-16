import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Event, Store } from 'effector';

type RouteOptions = {
  abortOnConcurrent?: boolean;
  auth?: boolean;
};

type RouteFx<Dto, Contract> = Effect<Dto, Contract> & {
  doneParams: Event<AxiosResponse<Contract, Dto>>;
};

type RequestConfig<Dto> =
  | AxiosRequestConfig<Dto>
  | NormalizedRequestConfig<Dto>;

type NormalizedRequestConfig<Dto> = (dto: Dto) => AxiosRequestConfig;

type ApiUnits<
  Auth extends AxiosRequestHeaders,
  Custom extends AxiosRequestHeaders
> = {
  authHeaders: Store<Auth>;
  customHeaders: Store<Custom>;
};

export type {
  RouteFx,
  RouteOptions,
  RequestConfig,
  NormalizedRequestConfig,
  ApiUnits
};
