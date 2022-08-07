type ShapeConfig<Shape, T> = {
  [Key in keyof Shape]: Shape[Key] extends T ? T : ShapeConfig<Shape[Key], T>;
};

type RequireSingleField<Shape, Key extends keyof Shape> = Required<
  Pick<Shape, Key>
> &
  Omit<Shape, Key>;

export type { ShapeConfig, RequireSingleField };
