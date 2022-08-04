import type {
  ApiRequestConfig,
  NormalizedRequestHandler,
  RequestConfigHandler
} from './types';
import { ContentType } from './types';

function formatToFormData(data: Record<string, unknown>): FormData {
  return Object.keys(data || {}).reduce((formData, key) => {
    const property = data[key];

    const value =
      property instanceof Blob
        ? property
        : formatNonBlobToFormDataProperty(property);

    formData.append(key, value);

    return formData;
  }, new FormData());
}

function formatNonBlobToFormDataProperty(property: unknown) {
  return typeof property === 'object' && property !== null
    ? JSON.stringify(property)
    : `${property}`;
}

function isObject(source: unknown): source is Record<string, unknown> {
  return !!source && typeof source === 'object';
}

function isNeedFormatToFormData(config: ApiRequestConfig) {
  return (
    config.method !== 'GET' &&
    config.isForm === ContentType.FormData &&
    isObject(config.data)
  );
}

function normalizeConfigHandler<Dto>(
  config: RequestConfigHandler<Dto>,
  forceTrimPayload = false
): NormalizedRequestHandler<Dto> {
  if (typeof config === 'function') {
    return dto => config(dto);
  }

  return dto => (forceTrimPayload ? config : { ...config, data: dto });
}

function formatConfig(config: ApiRequestConfig) {
  if (!config.method) {
    config.method = 'GET';
  }

  config.method = config.method.toUpperCase();

  if (config.method === 'GET') {
    if (!!config.data && typeof config.data === 'object') {
      if (config.data && config.params) {
        //TODO: add console.warn to prevent usage
      }

      config.params = { ...(config.params ?? {}), ...config.data };
    }
  }

  if (isNeedFormatToFormData(config)) {
    config.data = formatToFormData(config.data);
  }

  return config;
}

export {
  normalizeConfigHandler,
  formatConfig,
  isNeedFormatToFormData,
  formatToFormData,
  isObject
};
