import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse
} from 'axios';
import type { Effect, Store } from 'effector';
import { attach, createEffect, createStore, sample } from 'effector';
import {
  formatToFormData,
  isNeedFormatToFormData,
  isObject,
  normalizeConfigHandler
} from '../lib';
import { createBatchedEffect, createMockEffect } from '../custom-effects';

type CreateHttpOptions = {
  mapRawResponse?: <T>(response: AxiosResponse<T>) => T;
};

enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded'
}

type ApiRequestConfig<Data = any> = AxiosRequestConfig<Data> & {
  type?: ContentType;
};

type RequestConfigHandler<Dto> =
  | ApiRequestConfig<Dto>
  | NormalizedRequestHandler<Dto>;

type NormalizedRequestHandler<Dto> = (dto: Dto) => ApiRequestConfig;

type BuildOptions = {
  enableMock?: true;
};

type MockOptions<Dto, Contract> = {
  /**
   * Returns instead real call request
   */
  response: Contract | MockResponseHandler<Dto, Contract>;

  /**
   * Delay before return `mock.response`
   */
  delay?: number;
};
type MockResponseHandler<Dto, Contract> = (dto: Dto) => Contract;

type RouteOptions<Dto, Contract> = {
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

  /**
   * Trim payload provided to effect
   *
   * By design payload used as "data" if Dto=void
   * This option can remove this behavior
   */
  forceTrimPayload?: boolean;

  /**
   * If route called multiple times while request is pending,
   * calls will be batched with call which start a request
   */
  batchConcurrentRequests?: boolean;
};

type Traverse<D, C> = {
  route: Effect<AxiosRequestConfig<D>, AxiosResponse<D, C>>;
  options: RouteOptions<D, C>;
  mock: MockOptions<D, C>;
};

function createHttp(
  instance: AxiosInstance,
  { mapRawResponse = response => response.data }: CreateHttpOptions
) {
  const $headers = createStore<AxiosRequestHeaders>({});

  const baseRequestFx = attach({
    source: $headers,
    effect: async (headers, config: AxiosRequestConfig) =>
      instance.request({
        ...config,
        headers: { ...(config.headers ?? {}), ...headers }
      })
  });

  type Route = ReturnType<typeof createRoute>;

  function createHttpRoutes<
    Routes extends Record<string, Route>,
    Options extends Record<string, RouteOptions<any, any>>,
    Mocks extends Record<string, MockOptions<any, any>>,
    Traverses extends Record<string, Partial<Traverse<any, any>>>
  >(routes: Routes) {
    const tRoutes = createTraverse(isRoute, (keys, value) => {
      keys.forEach((key, index) => {
        result[key] = {};

        if (index === keys.length - 1) {
          result[key] = { route: value };
        }
      });
    });

    const result = {} as Traverses;
    Object.entries(routes).forEach(maybeRoute => tRoutes(maybeRoute, []));

    function options(_options: Options) {
      const traverse = createTraverse(isRouteOptions, (keys, value) => {
        let currentResult = result;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            currentResult.options = value;
          }

          currentResult = currentResult[key];
        });
      });

      Object.entries(_options).forEach(maybeOption =>
        traverse(maybeOption, [])
      );
    }

    function mock(_mocks: Mocks) {
      const traverse = createTraverse(isMockOptions, (keys, value) => {
        let currentResult = result;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            currentResult.options = value;
          }

          currentResult = currentResult[key];
        });
      });

      Object.entries(_mocks).forEach(maybeOption => traverse(maybeOption, []));
    }

    function build({ enableMock }: BuildOptions) {
      const traverce = createTraverse(isTraverse, (keys, value) => {
        let currentResult = result;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) return;

          if (index === keys.length - 2) {
            if (enableMock) {
              currentResult[key] = createMockEffect(currentResult[key].mock);
            }

            currentResult[key] = value;
          }

          currentResult = currentResult[key];
        });
      });

      Object.entries(result).forEach(maybeTraverse =>
        traverce(maybeTraverse, [])
      );

      return result;
    }

    return { options, mock, build };
  }

  function headers(externalStore: Store<AxiosRequestHeaders>) {
    sample({ source: externalStore, target: $headers });
  }

  function createRoute<Dto, Contract>(handler: RequestConfigHandler<Dto>) {
    function ensureMethod(config: AxiosRequestConfig<Dto>) {
      if (!config.method) {
        config.method = 'GET';
      }

      config.method = config.method.toUpperCase();
    }

    return {
      __route: true,
      __handler: handler,
      build: <OverrideContract = Contract>(
        options: RouteOptions<Dto, OverrideContract>
      ) => {
        const createFx = options.batchConcurrentRequests
          ? createBatchedEffect
          : createEffect;

        return createFx(async (dto: Dto) => {
          const config = normalizeConfigHandler(
            handler,
            !!options.forceTrimPayload
          )(dto);

          ensureMethod(config);

          if (config.method === 'GET' && isObject(config.data)) {
            if (config.params) {
              console.warn(
                `Prevent using "params" and "data" in GET request at ${config.url}. Params can be overridden`
              );
            }

            config.params = { ...(config.params ?? {}), ...config.data };
          } else if (isNeedFormatToFormData(config)) {
            config.data = formatToFormData(config.data);
          }

          return baseRequestFx(config).then(
            options.mapRawResponse ?? mapRawResponse
          ) as Promise<OverrideContract>;
        });
      }
    };
  }

  function isRoute(source: unknown): source is Route {
    return !!(source as Route).__route;
  }

  function isRouteOptions<D, C>(source: unknown): source is RouteOptions<D, C> {
    const routeOptionsKeys: (keyof RouteOptions<D, C>)[] = [
      'mapRawResponse',
      'forceTrimPayload',
      'batchConcurrentRequests'
    ];

    return (
      !!source &&
      routeOptionsKeys.some(key => Object.hasOwn(source as object, key))
    );
  }

  function isMockOptions<D, C>(source: unknown): source is MockOptions<D, C> {
    const mockOptionsKeys: (keyof MockOptions<D, C>)[] = ['response', 'delay'];

    return (
      !!source &&
      mockOptionsKeys.some(key => Object.hasOwn(source as object, key))
    );
  }

  function isTraverse<D, C>(source: unknown): source is Traverse<D, C> {
    const traverseKeys: (keyof Traverse<D, C>)[] = ['options', 'mock'];

    return (
      !!source &&
      Object.hasOwn(source as object, 'route' as keyof Traverse<D, C>) &&
      traverseKeys.some(key => Object.hasOwn(source as object, key))
    );
  }

  return { createHttpRoutes, headers, createRoute };
}

function createTraverse<Value>(
  predicate: (value: unknown) => value is Value,
  fn: (keys: string[], value: Value) => void
) {
  return function traverse(
    [key, value]: [string, unknown],
    prefixes: string[] = []
  ) {
    if (predicate(value)) {
      fn([...prefixes, key], value);

      return;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error,@typescript-eslint/ban-ts-comment
    // @ts-ignore
    _traverseRoutes(value as [string, unknown], [...prefixes, key]);
  };
}
