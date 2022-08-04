import type { AxiosResponse } from 'axios';
import { createBatchedEffect } from '../../custom-effects';
import { createEffect } from 'effector';

class Options<Dto, Contract> {
  public static readonly isRouteOptions = <D, C>(
    source: unknown
  ): source is Options<D, C> => source instanceof Options;

  public constructor(public readonly config: RouteOptions<Dto, Contract>) {}

  public readonly createFx = this.config.batchConcurrentRequests
    ? createBatchedEffect
    : createEffect;
}

type RouteOptions<Dto, Contract> = {
  /**
   * Custom resolver for mapping response
   *
   * Example: POST request Dto has {id: string}, backend returns void,
   *
   *`mapRawResponse: (response) => response.request.data.id` returns id what you send
   *
   * Note: response.request.data in AxiosResponse is non required field. This case you need match yourself
   */
  mapRawResponse?: <Response extends AxiosResponse<any, Dto>>(
    raw: Response
  ) => Contract;

  /**
   * Trim payload provided to effect
   *
   * By design payload used as "data" if Dto=void
   * This option can remove this behavior
   */
  forceTrimPayload?: boolean;

  /**
   * If route called multiple times while request is pending,
   * calls will be batched with call which start a request
   */
  batchConcurrentRequests?: boolean;
};

export { Options };
export type { RouteOptions };
