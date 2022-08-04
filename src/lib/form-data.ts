import type { ApiRequestConfig } from '../types';
import { isObject } from './object';
import type { RequireSingleField } from './typescript';

const formatNonBlobToFormDataProperty = (property: unknown) =>
  typeof property === 'object' && property !== null
    ? JSON.stringify(property)
    : `${property}`;

const isNeedFormatToFormData = <T>(
  config: ApiRequestConfig<T>
): config is RequireSingleField<ApiRequestConfig<T>, 'data'> =>
  !!(config.method !== 'GET' && config.formData && isObject(config.data));

const formatToFormData = <T extends Record<string, unknown>>(
  data: T
): FormData =>
  Object.keys(data || {}).reduce((formData, key) => {
    const property = data[key];

    const value =
      property instanceof Blob
        ? property
        : formatNonBlobToFormDataProperty(property);

    formData.append(key, value);

    return formData;
  }, new FormData());

export { isNeedFormatToFormData, formatToFormData };
