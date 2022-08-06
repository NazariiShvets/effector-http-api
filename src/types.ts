import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Effect } from 'effector';

type RouteFx<Dto, Contract> = Effect<Dto, Contract> & {
  rawResponseFx: Effect<Dto, AxiosResponse<Contract, Dto>>;
};

type RouteOptions = {
  batch?: true;
};

type ValidationSchema<Shape> = {
  validate: (shame: Shape) => Promise<any>;
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

type NormalizedRequestHandler<Dto> = (dto: Dto) => ApiRequestConfig<any>;

type ApiRequestConfig<Data> = AxiosRequestConfig<Data> & {
  formData?: boolean;
};

export type {
  RouteFx,
  RouteOptions,
  RouteOptionsMockResponseHandler,
  ApiRequestConfig,
  RequestConfigHandler,
  NormalizedRequestHandler,
  MockOptions,
  AxiosRequestConfig,
  ValidationSchema
};
