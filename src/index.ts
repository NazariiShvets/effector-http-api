import { Http } from './http';

const createHttp = (
  instance: ConstructorParameters<typeof Http>[0],
  defaultHeaders?: ConstructorParameters<typeof Http>[1]
) => new Http(instance, defaultHeaders);

export { createHttp };
export type { ValidationSchema } from './types';
export {
  createBatchedEffect,
  createMockEffect,
  isMockEffect,
  isBatchedEffect
} from './custom-effects';
