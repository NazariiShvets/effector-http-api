import type {
  MockOptions,
  RouteFx,
  RouteOptions,
  ValidationSchema
} from './types';
import { Route } from './route';
import type { ShapeConfig } from './lib/typescript';

type RouteMocksConfig<Shape> = Partial<{
  [Key in keyof Shape]: Shape[Key] extends Route<infer D, infer C>
    ? MockOptions<D, C>
    : RouteMocksConfig<Shape[Key]>;
}>;

type RouteOptionsConfig<Shape> = Partial<{
  [Key in keyof Shape]: Shape[Key] extends Route<any, any>
    ? RouteOptions
    : RouteOptionsConfig<Shape[Key]>;
}>;

type ValidationConfig<Shape> = Partial<{
  // eslint-disable-next-line no-unused-vars
  [Key in keyof Shape]: Shape[Key] extends Route<infer _D, infer C>
    ? ValidationSchema<C>
    : ValidationConfig<Shape[Key]>;
}>;

class Routes<
  Shape extends ShapeConfig<object, Route<any, any>>,
  MockShape extends RouteMocksConfig<Shape>,
  OptionsShape extends RouteOptionsConfig<Shape>,
  ValidationShape extends ValidationConfig<Shape>
> {
  public constructor(private readonly routes: Shape) {}

  private _mocks: MockShape | undefined;

  private _options: OptionsShape | undefined;

  private _validation: ValidationShape | undefined;

  private readonly traverse = <
    S extends Shape,
    M extends MockShape,
    O extends OptionsShape,
    V extends ValidationShape
  >(
    base: S,
    mocks: M,
    options: O,
    validations: V
  ) =>
    Object.entries(base).reduce((map, [key, value]) => {
      if (value instanceof Route) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const mock = mocks?.[key];

        if (mock) {
          value.mock(mock);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const routeOptions = options?.[key];

        if (routeOptions) {
          value.options(routeOptions);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const validation = validations?.[key];

        if (validation) {
          value.validation(validation);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        map[key] = value.build();

        return map;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      map[key] = this.traverse(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        base[key],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        mocks?.[key] ?? {},
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        options?.[key] ?? {},
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        validations?.[key] ?? {}
      );

      return map;
    }, {});

  public mocks = (mocks: MockShape) => {
    this._mocks = mocks;

    return this;
  };

  public options = (options: OptionsShape) => {
    this._options = options;

    return this;
  };

  public validation = (validation: ValidationShape) => {
    this._validation = validation;

    return this;
  };

  public build = () => {
    type GetRoutesShape<RShape> = {
      [Key in keyof RShape]: RShape[Key] extends Route<
        infer Dto,
        infer Contract
      >
        ? RouteFx<Dto, Contract>
        : GetRoutesShape<RShape[Key]>;
    };

    return this.traverse(
      this.routes,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this._mocks ?? {},
      this._options ?? {},
      this._validation ?? {}
    ) as GetRoutesShape<Shape>;
  };
}

export { Routes };
