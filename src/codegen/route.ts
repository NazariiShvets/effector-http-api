import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Effect } from 'effector';
import { createEffect } from 'effector';
import { createBatchedEffect, createMockEffect } from '../custom-effects';
import { formatToFormData, isNeedFormatToFormData } from './lib/form-data';
import type {
  ApiRequestConfig,
  MockOptions,
  RequestConfigHandler,
  RouteOptions
} from './types';

class Route<Dto, Contract, Error = AxiosError<Dto, Contract>> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,
    private readonly routeFn: RequestConfigHandler<Dto>
  ) {}

  private readonly _options: RouteOptions = {};

  private _mock: MockOptions<Dto, Contract> | undefined;

  private readonly getFx = () =>
    this._options.batch
      ? createBatchedEffect<Dto, Contract, Error>
      : createEffect<Dto, Contract, Error>;

  private readonly createRouteFx = (
    fn: (dto: Dto) => AxiosRequestConfig<Dto>
  ): Effect<Dto, Contract, Error> => {
    const createRequestFx = this.getFx();

    return createRequestFx(async (config: Dto) =>
      this.baseRequestFx(fn(config)).then(response =>
        this._options.rawResponse ? response : response.data
      )
    );
  };

  private readonly getConfig = (dto: Dto) =>
    typeof this.routeFn === 'function' ? this.routeFn(dto) : this.routeFn;

  private readonly ensureMethod = (config: AxiosRequestConfig<Dto>) => {
    if (!config.method) {
      config.method = 'GET';
    }

    config.method = config.method.toUpperCase();

    return config;
  };

  private readonly formatConfig = (config: AxiosRequestConfig<Dto>) => {
    if (config.method === 'GET') {
      if (!!config.data && typeof config.data === 'object') {
        if (config.data && config.params) {
          //TODO: add console.warn to prevent usage
        }

        config.params = { ...(config.params ?? {}), ...config.data };
      }
    }

    if (isNeedFormatToFormData(config)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      config.data = formatToFormData(config.data);
    }
  };

  public options = (config: RouteOptions) => {
    Object.assign(this._options, config);
  };

  public mock = (config: MockOptions<Dto, Contract>) => {
    this._mock = config;
  };

  public build = () => {
    if (this._mock) {
      return createMockEffect(this._mock);
    }

    return this.createRouteFx((dto: Dto): ApiRequestConfig<Dto> => {
      const config = this.getConfig(dto);

      this.ensureMethod(config);

      this.formatConfig(config);

      return config;
    });
  };
}

export { Route };
