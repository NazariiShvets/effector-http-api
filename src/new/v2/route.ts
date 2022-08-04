import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RouteOptions } from './options';
import { Options } from './options';
import { isObject } from '../../lib';
import type { Effect } from 'effector';
import type { MockConfig } from './mock';
import { Mock } from './mock';

class Route<Dto, Contract> {
  public static readonly isRoute = <D, C>(
    source: unknown
  ): source is Route<D, C> => source instanceof Route;

  public constructor(
    private readonly baseRequestFx: Effect<AxiosRequestConfig, AxiosResponse>,
    private readonly handler: RequestConfigHandler<Dto>
  ) {}

  private _mock: Mock<Dto, Contract> | undefined;

  private _options: Options<Dto, Contract> = new Options<Dto, Contract>({});

  private readonly ensureMethod = (config: AxiosRequestConfig<Dto>) => {
    if (!config.method) {
      config.method = 'GET';
    }

    config.method = config.method.toUpperCase();
  };

  private readonly normalizeHandler = <Dto>(
    config: RequestConfigHandler<Dto>,
    forceTrimPayload = false
  ): NormalizedRequestHandler<Dto> => {
    if (typeof config === 'function') {
      return dto => config(dto);
    }

    return dto => (forceTrimPayload ? config : { ...config, data: dto });
  };

  private readonly isNeedFormatToFormData = (config: ApiRequestConfig) =>
    config.method !== 'GET' &&
    config.type === ContentType.FormData &&
    isObject(config.data);

  private readonly formatToFormData = (
    data: Record<string, unknown>
  ): FormData => {
    function formatNonBlobToFormDataProperty(property: unknown) {
      return typeof property === 'object' && property !== null
        ? JSON.stringify(property)
        : `${property}`;
    }

    return Object.keys(data || {}).reduce((formData, key) => {
      const property = data[key];

      const value =
        property instanceof Blob
          ? property
          : formatNonBlobToFormDataProperty(property);

      formData.append(key, value);

      return formData;
    }, new FormData());
  };

  private readonly build = (enableMock: boolean) => {
    if (enableMock && this._mock) {
      return this._mock.createFx();
    }

    const { forceTrimPayload, mapRawResponse = defaultMapHandler } =
      this._options.config;

    return this._options.createFx(async (dto: Dto) => {
      const config = this.normalizeHandler(this.handler, forceTrimPayload)(dto);

      this.ensureMethod(config);

      if (config.method === 'GET' && isObject(config.data)) {
        if (config.params) {
          console.warn(
            `Prevent using "params" and "data" in GET request at ${config.url}. Params can be overridden`
          );
        }

        config.params = { ...(config.params ?? {}), ...config.data };
      } else if (this.isNeedFormatToFormData(config)) {
        config.data = this.formatToFormData(config.data);
      }

      return this.baseRequestFx(config).then(mapRawResponse);
    });
  };

  public readonly mock = (config: MockConfig<Dto, Contract>) => {
    this._mock = new Mock(config);
  };

  public readonly options = (config: RouteOptions<Dto, Contract>) => {
    this._options = new Options(config);
  };
}

const defaultMapHandler = <D, C>(response: AxiosResponse<C, D>) =>
  response.data;

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

export { Route, ContentType };
export type { RequestConfigHandler, ApiRequestConfig };
