import { createBatchedEffect } from '../../src/custom-effects';
import { allSettled, createEvent, fork, sample } from 'effector';
import { faker } from '@faker-js/faker';

describe('createBatchedEffect', () => {
  it('should wait until first called resolved and done with his doneData', async () => {
    const fn = jest.fn();
    const callsFn = jest.fn();
    const resultFn = jest.fn();
    const value = faker.datatype.uuid();

    fn.mockImplementationOnce(
      async () => new Promise(r => setTimeout(() => r(value), 1000))
    );

    const batchedFx = createBatchedEffect(fn);

    batchedFx.watch(callsFn);
    batchedFx.doneData.watch(resultFn);

    const trigger = createEvent();

    sample({
      clock: trigger,
      target: [batchedFx, batchedFx, batchedFx]
    });

    const scope = fork();

    await allSettled(trigger, { scope });

    expect(callsFn).toBeCalledTimes(3);

    expect(fn).toBeCalledTimes(1);

    expect(resultFn).toBeCalledWith(value);
    expect(resultFn).toBeCalledTimes(3);
  });

  it('should wait until first called rejected and fail with his failData', async () => {
    const fn = jest.fn();
    const callsFn = jest.fn();
    const resultFn = jest.fn();
    const value = faker.datatype.uuid();

    fn.mockImplementationOnce(
      async () =>
        new Promise((_, reject) => setTimeout(() => reject(value), 1000))
    );

    const batchedFx = createBatchedEffect(fn);

    batchedFx.watch(callsFn);
    batchedFx.failData.watch(resultFn);

    const trigger = createEvent();

    sample({
      clock: trigger,
      target: [batchedFx, batchedFx, batchedFx]
    });

    const scope = fork();

    await allSettled(trigger, { scope });

    expect(callsFn).toBeCalledTimes(3);

    expect(fn).toBeCalledTimes(1);

    expect(resultFn).toBeCalledWith(value);
    expect(resultFn).toBeCalledTimes(3);
  });

  it('should work same with nested', async () => {
    const fn = jest.fn();
    const callsFn = jest.fn();
    const resultFn = jest.fn();
    const value = faker.datatype.uuid();

    const callsFn2 = jest.fn();
    const resultFn2 = jest.fn();

    fn.mockImplementationOnce(
      async () => new Promise(r => setTimeout(() => r(value), 1000))
    );

    const batchedFx = createBatchedEffect(fn);
    const batchedFx2 = createBatchedEffect(async params =>
      batchedFx(params).then(value => `${value}${value}`)
    );

    batchedFx.watch(callsFn);
    batchedFx.doneData.watch(resultFn);
    batchedFx2.watch(callsFn2);
    batchedFx2.doneData.watch(resultFn2);

    const trigger = createEvent();

    sample({
      clock: trigger,
      target: [batchedFx2, batchedFx2, batchedFx2]
    });

    const scope = fork();

    await allSettled(trigger, { scope });

    expect(callsFn).toBeCalledTimes(1);
    expect(fn).toBeCalledTimes(1);
    expect(resultFn).toBeCalledWith(value);
    expect(resultFn).toBeCalledTimes(1);

    expect(callsFn2).toBeCalledTimes(3);
    expect(resultFn2).toBeCalledWith(`${value}${value}`);
    expect(resultFn2).toBeCalledTimes(3);
  });
});
