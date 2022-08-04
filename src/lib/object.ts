const isObject = (source: unknown): source is Record<string, unknown> =>
  !!source && typeof source === 'object';

export { isObject };
