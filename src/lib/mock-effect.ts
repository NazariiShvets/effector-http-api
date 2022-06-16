import type { Effect } from 'effector';
import { createEffect } from 'effector';

import type { RouteOptions, RouteOptionsMockResponseHandler } from '../types';

const createMockEffect = <Params, Done, Fail = Error>(
  options: Required<RouteOptions<Params, Done>>['mock']
): Effect<Params, Done, Fail> =>
  createEffect<Params, Done, Fail>(async params => {
    if (options.delay) {
      await delay(options.delay);
    }

    return isMockResponseHandler(options.response)
      ? options.response(params)
      : options.response;
  });

async function delay(timeout: number) {
  await new Promise(r => setTimeout(r, timeout));
}

function isMockResponseHandler<Dto, Contract>(
  mockResponse: Required<RouteOptions<Dto, Contract>>['mock']['response']
): mockResponse is RouteOptionsMockResponseHandler<Dto, Contract> {
  return typeof mockResponse === 'function';
}

export { createMockEffect };
