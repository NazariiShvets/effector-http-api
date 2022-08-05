import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Effect } from 'effector';

type RouteFx<Dto, Contract> = Effect<
  Dto,
  Contract,
  AxiosError<Contract, Dto>
> & {
  rawResponseFx: Effect<
    Dto,
    AxiosResponse<Contract, Dto>,
    AxiosError<Contract, Dto>
  >;
};

type RouteOptions = {
  batch?: true;
};

type MockOptions<Dto, Contract> = {
  delay?: number;
  response: Contract | RouteOptionsMockResponseHandler<Dto, Contract>;
  batch?: boolean;
};

type RouteOptionsMockResponseHandler<Dto, Contract> = (dto: Dto) => Contract;

type RequestConfigHandler<Dto> =
  | ApiRequestConfig<Dto>
  | NormalizedRequestHandler<Dto>;

type NormalizedRequestHandler<Dto> = (dto: Dto) => ApiRequestConfig<Dto>;

type ApiRequestConfig<Data> = AxiosRequestConfig<Data> & {
  formData?: true;
};

export type {
  RouteFx,
  RouteOptions,
  RouteOptionsMockResponseHandler,
  ApiRequestConfig,
  RequestConfigHandler,
  NormalizedRequestHandler,
  MockOptions,
  AxiosRequestConfig
};
