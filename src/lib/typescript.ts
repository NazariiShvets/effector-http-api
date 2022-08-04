type DeepPartial<T, Check = object> = {
  [Key in keyof T]?: T[Key] extends Check ? DeepPartial<T[Key], Check> : T[Key];
};

type ShapeConfig<Shape, T> = {
  [Key in keyof Shape]: Shape[Key] extends T ? T : ShapeConfig<Shape[Key], T>;
};

type GetShape<TrimType, ReplaceType, Shape> = {
  [Key in keyof Shape]: Shape[Key] extends TrimType
    ? ReplaceType
    : GetShape<TrimType, ReplaceType, Shape[Key]>;
};

type RequireSingleField<Shape, Key extends keyof Shape> = Required<
  Pick<Shape, Key>
> &
  Omit<Shape, Key>;

export type { DeepPartial, GetShape, ShapeConfig, RequireSingleField };
