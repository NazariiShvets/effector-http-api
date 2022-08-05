import type { Effect } from 'effector';
import { createEffect } from 'effector';

import type { MockOptions, RouteOptionsMockResponseHandler } from '../types';
import { createBatchedEffect } from './batched-effect';

type MockEffect<Params, Done, Fail> = Effect<Params, Done, Fail> & {
  __isMockEffect: boolean;
};

const createMockEffect = <Params, Done, Fail = Error>(
  options: MockOptions<Params, Done>
): MockEffect<Params, Done, Fail> => {
  const createFx = (
    options.batch
      ? createBatchedEffect<Params, Done, Fail>
      : createEffect<Params, Done, Fail>
  ) as typeof createEffect<Params, Done, Fail>;

  const mockFx = createFx(async params => {
    if (options.delay) {
      await delay(options.delay);
    }

    return isMockResponseHandler(options.response)
      ? options.response(params)
      : options.response;
  }) as MockEffect<Params, Done, Fail>;

  mockFx.__isMockEffect = true;

  return mockFx;
};

async function delay(timeout: number) {
  await new Promise(r => setTimeout(r, timeout));
}

const isMockEffect = <Params, Done, Error>(
  effect: Effect<Params, Done, Error>
): effect is MockEffect<Params, Done, Error> =>
  !!(effect as MockEffect<Params, Done, Error>).__isMockEffect;

function isMockResponseHandler<Dto, Contract>(
  mockResponse: Required<MockOptions<Dto, Contract>>['response']
): mockResponse is RouteOptionsMockResponseHandler<Dto, Contract> {
  return typeof mockResponse === 'function';
}

export { createMockEffect, isMockEffect };
