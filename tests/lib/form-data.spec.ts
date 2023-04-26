import { formatToFormData } from '../../src/lib/form-data';

describe('formatToFormData', () => {
  it('should transform to JSON objects', () => {
    const data = formatToFormData({ value: { deep: 42 } });

    expect(Object.fromEntries(data)).toMatchInlineSnapshot(`
      Object {
        "value": "{\\"deep\\":42}",
      }
    `);
  });

  it('should not transform Blob', () => {
    const blob = new Blob(['1']);

    const data = formatToFormData({ value: blob });

    expect(Object.fromEntries(data)).toMatchInlineSnapshot(`
      Object {
        "value": File {},
      }
    `);
  });

  it('should transform arrays', () => {
    const blobs = [new Blob(['1']), new Blob(['2']), new Blob(['3'])];

    const data = formatToFormData({ files: blobs });

    expect(data.getAll('files')).toHaveLength(blobs.length);

    expect(Object.fromEntries(data)).toMatchInlineSnapshot(`
      Object {
        "files": File {},
      }
    `);
  });

  it('should return empty to falsy payload', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Object.fromEntries(formatToFormData(null))).toEqual({});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Object.fromEntries(formatToFormData(undefined))).toEqual({});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Object.fromEntries(formatToFormData(1))).toEqual({});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(Object.fromEntries(formatToFormData(''))).toEqual({});
  });
});
