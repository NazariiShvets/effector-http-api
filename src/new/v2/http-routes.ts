import type { Route } from './route';

class HttpRoutes<T> {
  public constructor(public readonly routes: Routes<T>) {}

  public build = (_config: { enableMock?: true }) => {};
}

type Routes<T> = {
  [Key in keyof T]: T[Key] extends Route<any, any> ? T[Key] : Routes<T[Key]>;
};

export { HttpRoutes };
export type { Routes };
