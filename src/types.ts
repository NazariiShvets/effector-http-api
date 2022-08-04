import type { AxiosRequestConfig } from 'axios';

type RouteOptions = {
  batch?: true;
  rawResponse?: true;
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
  RouteOptions,
  RouteOptionsMockResponseHandler,
  ApiRequestConfig,
  RequestConfigHandler,
  NormalizedRequestHandler,
  MockOptions,
  AxiosRequestConfig
};
