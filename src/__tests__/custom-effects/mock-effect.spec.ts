import { createMockEffect } from '../../custom-effects';
import { faker } from '@faker-js/faker';
import { allSettled, fork } from 'effector';

describe('createMockEffect', () => {
  it('should create mock effect with static response', async () => {
    const fn = jest.fn();
    const mockResponse = { value: faker.datatype.uuid() };

    const mockFx = createMockEffect<void, { value: string }>({
      response: mockResponse
    });

    mockFx.doneData.watch(fn);

    const scope = fork();

    await allSettled(mockFx, { scope });

    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(mockResponse);
  });

  it('should create mock effect with response handler', async () => {
    const fn = jest.fn();
    const mockResponse = { value: faker.datatype.uuid() };
    const mockResponse10 = { value: faker.datatype.uuid() };

    const mockFx = createMockEffect<number, { value: string }>({
      response: value => (value === 10 ? mockResponse10 : mockResponse)
    });

    mockFx.doneData.watch(fn);

    const scope = fork();

    await allSettled(mockFx, { scope, params: 10 });

    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(mockResponse10);

    await allSettled(mockFx, { scope, params: 5 });

    expect(fn).toBeCalledTimes(2);
    expect(fn).toBeCalledWith(mockResponse);
  });

  it('should use delay', async () => {
    const setTimeoutFn = jest.fn(cb => cb());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    global.setTimeout = setTimeoutFn;

    const fn = jest.fn();
    const mockResponse = { value: faker.datatype.uuid() };
    const delay = faker.datatype.number();

    const mockFx = createMockEffect<void, { value: string }>({
      response: mockResponse,
      delay
    });

    mockFx.doneData.watch(fn);

    const scope = fork();

    await allSettled(mockFx, { scope });

    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(mockResponse);
    expect(global.setTimeout).toBeCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(setTimeoutFn.mock.calls[0][1]).toBe(delay);
  });
});
