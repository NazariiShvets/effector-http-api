import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders
} from 'axios';
import type { Effect, Store, Unit } from 'effector';
import { attach, createStore, sample } from 'effector';
import type { RequestConfigHandler } from './types';
import type { ShapeConfig } from './lib/typescript';
import { Route } from './route';
import { Routes } from './routes';

class Http {
  public constructor(
    private httpInstance: AxiosInstance,

    $defaultHeaders: Store<RawAxiosRequestHeaders> = createStore({})
  ) {
    this.$headers = $defaultHeaders;

    this.baseHttpFx = attach({
      source: this.$headers,
      effect: async (headers, config: AxiosRequestConfig) =>
        this.httpInstance(this.attachHeaders(config, headers))
    });
  }

  private readonly $headers: Store<RawAxiosRequestHeaders>;

  public readonly baseHttpFx: Effect<AxiosRequestConfig, AxiosResponse>;

  private readonly attachHeaders = (
    config: AxiosRequestConfig,
    storeHeaders: RawAxiosRequestHeaders
  ): AxiosRequestConfig => ({
    ...config,
    headers: { ...storeHeaders, ...(config?.headers ?? {}) }
  });

  public headers = ($headers: Unit<RawAxiosRequestHeaders>) => {
    sample({
      clock: $headers,
      target: this.$headers
    });

    return this;
  };

  public setHttpInstance = (httpInstance: AxiosInstance) => {
    this.httpInstance = httpInstance;
  };

  public createRoute = <Dto = void, Contract = void>(
    config: RequestConfigHandler<Dto>
  ) => new Route<Dto, Contract>(this.baseHttpFx, config);

  public createRoutesConfig = <
    Shape extends ShapeConfig<object, Route<any, any>>
  >(
    routes: Shape
  ) => new Routes(routes);
}

export { Http };
