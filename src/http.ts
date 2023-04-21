import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders
} from 'axios';
import type { Effect, Store, Unit, Event } from 'effector';
import { createEvent, is } from 'effector';
import { attach, createStore, sample } from 'effector';
import type { RequestConfigHandler } from './types';
import type { ShapeConfig } from './lib/typescript';
import { Route } from './route';
import { Routes } from './routes';

class Http {
  public constructor(
    instance: AxiosInstance | Store<AxiosInstance>,

    $defaultHeaders: Store<RawAxiosRequestHeaders> = createStore({})
  ) {
    this.$headers = $defaultHeaders;
    this.updateHttpInstance = createEvent<AxiosInstance>();

    this.$instance = is.store(instance)
      ? (instance as Store<AxiosInstance>)
      : createStore(instance as AxiosInstance, { serialize: 'ignore' });

    this.$instance.on(
      this.updateHttpInstance,
      (_, httpInstance) => httpInstance
    );

    this.baseHttpFx = attach({
      source: { httpInstance: this.$instance, headers: this.$headers },
      effect: async ({ httpInstance, headers }, config: AxiosRequestConfig) =>
        httpInstance(this.attachHeaders(config, headers))
    });
  }

  private readonly $headers: Store<RawAxiosRequestHeaders>;

  /**
   * Http instance
   * Can be used in ForkAPI to separate different http instances
   */
  public readonly $instance: Store<AxiosInstance>;

  /**
   * Update scoped http instance by event
   */
  public readonly updateHttpInstance: Event<AxiosInstance>;

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

  /**
   * Update global http instance
   */
  public setHttpInstance = (httpInstance: AxiosInstance) => {
    this.updateHttpInstance(httpInstance);
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
