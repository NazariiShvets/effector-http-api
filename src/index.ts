import { Http } from './http';

const createHttp = (...args: ConstructorParameters<typeof Http>) =>
  new Http(...args);

export { createHttp };
export type { ValidationSchema } from './types';
