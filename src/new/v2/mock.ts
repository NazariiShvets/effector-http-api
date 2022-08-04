import { createMockEffect } from '../../custom-effects';

class Mock<Dto, Contract> {
  public static readonly isMock = <D, C>(
    source: unknown
  ): source is Mock<D, C> => source instanceof Mock;

  public constructor(private readonly config: MockConfig<Dto, Contract>) {}

  public readonly createFx = () => createMockEffect(this.config);
}

type MockConfig<Dto, Contract> = {
  /**
   * Returns instead real call request
   */
  response: Contract | MockResponseHandler<Dto, Contract>;

  /**
   * Delay before return `response`
   */
  delay?: number;
};
type MockResponseHandler<Dto, Contract> = (dto: Dto) => Contract;

export { Mock };
export type { MockConfig, MockResponseHandler };
