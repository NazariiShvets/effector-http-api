import type { Effect } from 'effector';
import { createEffect } from 'effector';

type BatchedEffect<Params, Done, Fail> = Effect<Params, Done, Fail> & {
  __isBatchedEffect: true;
};

/**
 * First effect call await publish handler result
 *
 * Rest calls, while waiting, receive same result
 */
const createBatchedEffect = <Params, Done, Fail = Error>(
  handler: (params: Params) => Promise<Done>
): BatchedEffect<Params, Done, Fail> => {
  let inFlight = false;

  const pubSub = new PubSub<Done, Fail>();

  const batchedFx = createEffect<Params, Done, Fail>(async params => {
    if (!inFlight) {
      inFlight = true;

      pubSub.awaitPublish(
        new Promise<Done>((resolve, reject) => {
          handler(params)
            .then(result => {
              inFlight = false;
              resolve(result);
            })
            .catch((error: Fail) => {
              inFlight = false;
              reject(error);
            });
        })
      );
    }

    return new Promise<Done>(pubSub.subscribe);
  }) as BatchedEffect<Params, Done, Fail>;

  batchedFx.__isBatchedEffect = true;

  return batchedFx;
};

const isBatchedEffect = <Params, Done, Error>(
  effect: Effect<Params, Done, Error>
): effect is BatchedEffect<Params, Done, Error> =>
  !!(effect as BatchedEffect<Params, Done, Error>).__isBatchedEffect;

class PubSub<Resolve, Reject> {
  private subscribers: {
    resolve: (param: Resolve) => void;
    reject: (params: Reject) => void;
  }[] = [];

  private readonly cleanup = () => {
    this.subscribers = [];
  };

  private readonly publishResolve = (result: Resolve) => {
    this.subscribers.forEach(sub => sub.resolve(result));

    this.cleanup();
  };

  private readonly publishReject = (result: Reject) => {
    this.subscribers.forEach(sub => sub.reject(result));

    this.cleanup();
  };

  public readonly subscribe = (
    resolve: (value: Resolve) => void,
    reject: (value: Reject) => void
  ) => {
    this.subscribers.push({ resolve, reject });
  };

  public readonly awaitPublish = async (promise: Promise<Resolve>) => {
    try {
      const result = await promise;

      this.publishResolve(result);
    } catch (reject) {
      this.publishReject(reject as Reject);
    }
  };
}

export { createBatchedEffect, isBatchedEffect };
