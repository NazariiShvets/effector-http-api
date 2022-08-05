import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Unit } from 'effector';
import { attach, createStore, sample } from 'effector';
import type { RequestConfigHandler } from './types';
import type { ShapeConfig } from './lib/typescript';
import { Route } from './route';
import { Routes } from './routes';

class Http {
  public constructor(http: AxiosInstance) {
    this.baseHttpFx = attach({
      source: this.$headers,
      effect: async (headers, config: AxiosRequestConfig) =>
        http(this.attachHeaders(config, headers))
    });
  }

  private readonly $headers = createStore({});

  public readonly baseHttpFx: Effect<AxiosRequestConfig, AxiosResponse>;

  private readonly attachHeaders = (
    config: AxiosRequestConfig,
    storeHeaders: AxiosRequestHeaders
  ): AxiosRequestConfig => ({
    ...config,
    headers: { ...storeHeaders, ...(config?.headers ?? {}) }
  });

  public headers = ($headers: Unit<AxiosRequestHeaders>) => {
    sample({
      clock: $headers,
      target: this.$headers
    });

    return this;
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
