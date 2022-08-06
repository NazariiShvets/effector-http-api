import type { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';
import type { Effect } from 'effector';
import { createEffect } from 'effector';
import { createBatchedEffect, createMockEffect } from './custom-effects';
import { formatToFormData, isNeedFormatToFormData } from './lib/form-data';
import type {
  ApiRequestConfig,
  MockOptions,
  RequestConfigHandler,
  RouteFx,
  RouteOptions,
  ValidationSchema
} from './types';

class Route<Dto, Contract> {
  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,
    private readonly routeFn: RequestConfigHandler<Dto>
  ) {}

  private readonly _options: RouteOptions = {};

  private _mock: MockOptions<Dto, Contract> | undefined;

  private _validationSchema: ValidationSchema<Contract> | undefined;

  private readonly getFx = () =>
    this._options.batch
      ? createBatchedEffect<Dto, AxiosResponse<Contract, Dto>>
      : createEffect<Dto, AxiosResponse<Contract, Dto>, Error>;

  private readonly createRouteFx = (
    fn: (dto: Dto) => AxiosRequestConfig<Dto>
  ): Effect<Dto, AxiosResponse<Contract, Dto>> => {
    const createRequestFx = this.getFx();

    return createRequestFx(async (config: Dto) =>
      this.baseRequestFx(fn(config)).then(async response => {
        if (this._validationSchema) {
          await this._validationSchema.validate(response.data);
        }

        return response;
      })
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

    return this;
  };

  public mock = (config: MockOptions<Dto, Contract>) => {
    this._mock = config;

    return this;
  };

  public validation = (schema: ValidationSchema<Contract>) => {
    this._validationSchema = schema;

    return this;
  };

  public build = () => {
    if (this._mock) {
      const rawFx = createMockEffect<Dto, Contract>(this._mock);

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
    rawFx: Effect<Dto, AxiosResponse<Contract, Dto>>
  ): RouteFx<Dto, Contract> => {
    const createFx = this._options.batch
      ? createBatchedEffect<Dto, Contract>
      : createEffect;

    const mappedFx = createFx<Dto, Contract>(async dto =>
      rawFx(dto).then(response => response.data)
    );

    const resultFx = mappedFx as RouteFx<Dto, Contract>;
    resultFx.rawResponseFx = rawFx;

    return resultFx;
  };
}

export { Route };
