import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Effect } from 'effector';

type RouteFx<Dto, Contract> = Effect<Dto, Contract> & {
  /**
   * RouteEffect without mappings: (response) => response.data
   */
  rawResponseFx: Effect<Dto, AxiosResponse<Contract, Dto>>;
};

type RouteOptions = {
  /**
   * First effect call await publish handler result
   *
   * Rest calls, waiting until first resolved, receive same result
   */
  batch?: true;
};

type ValidationSchema<Shape> = {
  /**
   * Validator fn
   */
  validate: (shape: Shape) => Promise<any>;
};

type MockOptions<Dto, Contract> = {
  /**
   * await setTimeout
   */
  delay?: number;

  /**
   * Custom mock response
   *
   * Can provide fn: (dto:Dto) => Contract
   */
  response: Contract | MockResponseHandler<Dto, Contract>;

  /**
   * Batch mock effect calls
   *
   * Useful when `Dto = void`
   * and delay or custom setTimeout used to batch requests
   */
  batch?: boolean;
};

type MockResponseHandler<Dto, Contract> = (dto: Dto) => Contract;

type RequestConfigHandler<Dto> =
  | ApiRequestConfig<Dto>
  | NormalizedRequestHandler<Dto>;

type NormalizedRequestHandler<Dto> = (dto: Dto) => ApiRequestConfig<any>;

type ApiRequestConfig<Data> = AxiosRequestConfig<Data> & {
  /**
   * Flag to convert AxiosRequestConfig.data to FormData
   */
  formData?: boolean;
};

export type {
  RouteFx,
  RouteOptions,
  MockResponseHandler,
  ApiRequestConfig,
  RequestConfigHandler,
  NormalizedRequestHandler,
  MockOptions,
  AxiosRequestConfig,
  ValidationSchema
};
