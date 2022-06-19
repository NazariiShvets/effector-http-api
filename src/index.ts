import type { AxiosRequestConfig } from 'axios';

import { EffectorApi } from './api';

import type { ControllerRouteOptions } from './types';

const createHttpApi = (
  baseConfig: AxiosRequestConfig = {},
  routeOptions: ControllerRouteOptions = {}
) => new EffectorApi(baseConfig, routeOptions);

export { createHttpApi };
export { ContentType } from './types';
