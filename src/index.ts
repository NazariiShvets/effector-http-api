import type { AxiosRequestConfig } from 'axios';

import { EffectorApi } from './api';
import type { RouteOptions } from './types';

const createEffectorApi = (
  baseConfig: AxiosRequestConfig = {},
  routeOptions: RouteOptions = {}
) => new EffectorApi(baseConfig, routeOptions);

export { createEffectorApi };
