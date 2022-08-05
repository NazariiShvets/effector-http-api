import type { AxiosRequestConfig } from 'axios';
import { AxiosError, AxiosResponse } from 'axios';
import type { Effect } from 'effector';
import { createEffect } from 'effector';
import { createBatchedEffect, createMockEffect } from './custom-effects';
import { formatToFormData, isNeedFormatToFormData } from './lib/form-data';
import type {
  ApiRequestConfig,
  MockOptions,
  RequestConfigHandler,
  RouteFx,
  RouteOptions
} from './types';

class Route<Dto, Contract> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,
    private readonly routeFn: RequestConfigHandler<Dto>
  ) {}

  private readonly _options: RouteOptions = {};

  private _mock: MockOptions<Dto, Contract> | undefined;

  private readonly getFx = () =>
    this._options.batch
      ? createBatchedEffect<
          Dto,
          AxiosResponse<Contract, Dto>,
          AxiosError<Contract, Dto>
        >
      : createEffect<
          Dto,
          AxiosResponse<Contract, Dto>,
          AxiosError<Contract, Dto>
        >;

  private readonly createRouteFx = (
    fn: (dto: Dto) => AxiosRequestConfig<Dto>
  ): Effect<Dto, AxiosResponse<Contract, Dto>, AxiosError<Contract, Dto>> => {
    const createRequestFx = this.getFx();

    return createRequestFx(async (config: Dto) =>
      this.baseRequestFx(fn(config))
    );
  };

  private readonly getConfig = (dto: Dto) =>
    typeof this.routeFn === 'function'
      ? this.routeFn(dto)
      : { ...this.routeFn, data: dto };

  private readonly ensureMethod = (config: AxiosRequestConfig<Dto>) => {
    if (!config.method) {
      config.method = 'GET';
    }

    config.method = config.method.toUpperCase();

    return config;
  };

  private readonly formatConfig = (config: ApiRequestConfig<Dto>) => {
    if (config.method === 'GET') {
      if (!!config.data && typeof config.data === 'object') {
        if (config.data && config.params) {
          //TODO: add console.warn to prevent usage
        }

        config.params = { ...(config.params ?? {}), ...config.data };

        delete config.data;
      }
    }

    if (isNeedFormatToFormData(config)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      config.data = formatToFormData(config.data);
    }

    if (config.formData) {
      delete config.formData;
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
      const rawFx = createMockEffect<Dto, Contract, AxiosError<Contract, Dto>>(
        this._mock
      );

      const resultFx = rawFx as unknown as RouteFx<Dto, Contract>;
      resultFx.rawResponseFx = rawFx as unknown as RouteFx<
        Dto,
        Contract
      >['rawResponseFx'];

      return resultFx;
    }

    return this.buildRouteFx(
      this.createRouteFx((dto: Dto): ApiRequestConfig<Dto> => {
        const config = this.getConfig(dto);

        this.ensureMethod(config);

        this.formatConfig(config);

        return config;
      })
    );
  };

  public buildRouteFx = (
    rawFx: Effect<Dto, AxiosResponse<Contract, Dto>, AxiosError<Contract, Dto>>
  ): RouteFx<Dto, Contract> => {
    const createFx = this._options.batch
      ? createBatchedEffect<Dto, Contract, AxiosError<Contract, Dto>>
      : createEffect;

    const mappedFx = createFx<Dto, Contract, AxiosError<Contract, Dto>>(
      async dto => rawFx(dto).then(response => response.data)
    );

    const resultFx = mappedFx as RouteFx<Dto, Contract>;
    resultFx.rawResponseFx = rawFx;

    return resultFx;
  };
}

export { Route };
