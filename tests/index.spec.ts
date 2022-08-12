import type { AxiosInstance, AxiosRequestHeaders } from 'axios';
import { allSettled, createEvent, fork } from 'effector';
import { faker } from '@faker-js/faker';

import type { ValidationSchema } from '../src';
import { createHttp } from '../src';
import type { Http } from '../src/http';
import { isBatchedEffect } from '../src/custom-effects/batched-effect';
import { isMockEffect } from '../src/custom-effects/mock-effect';
import { object, string, ValidationError } from 'yup';

describe('effector-http-api', () => {
  let instance: jest.Mock;
  let http: Http;

  beforeEach(() => {
    instance = jest.fn();

    http = createHttp(instance as unknown as AxiosInstance);
  });

  describe('request', () => {
    beforeEach(() => {
      instance.mockResolvedValue(Promise.resolve({}));
    });

    describe('method', () => {
      it('should set default method as "GET"', async () => {
        const url = faker.internet.url();

        const api = http
          .createRoutesConfig({ test: http.createRoute({ url }) })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          headers: {},
          method: 'GET'
        });
      });
    });

    describe('headers', () => {
      it('should change headers', async () => {
        const headerValue = faker.datatype.string();
        const newHeadersValue = faker.datatype.string();
        const url = faker.internet.url();

        const headersChanged = createEvent<AxiosRequestHeaders>();

        const http = createHttp(instance as unknown as AxiosInstance);
        const api = http
          .headers(headersChanged)
          .createRoutesConfig({ test: http.createRoute({ url }) })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          headers: {},
          method: 'GET'
        });

        await allSettled(headersChanged, {
          scope,
          params: { Authorization: headerValue }
        });
        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(2);
        expect(instance).toBeCalledWith({
          url,
          headers: { Authorization: headerValue },
          method: 'GET'
        });

        await allSettled(headersChanged, {
          scope,
          params: { Authorization: newHeadersValue }
        });
        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(3);
        expect(instance).toBeCalledWith({
          url,
          headers: { Authorization: newHeadersValue },
          method: 'GET'
        });
      });

      it('should merge headers', async () => {
        const instance = jest.fn();
        instance.mockResolvedValue(Promise.resolve({}));

        const headerValue = faker.datatype.string();
        const routeHeaderValue = faker.datatype.string();
        const url = faker.internet.url();

        const headersChanged = createEvent<AxiosRequestHeaders>();

        const http = createHttp(instance as unknown as AxiosInstance);
        const api = http
          .headers(headersChanged)
          .createRoutesConfig({
            test: http.createRoute({
              url,
              headers: { 'X-CUSTOM-HEADER': routeHeaderValue }
            })
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          headers: {
            'X-CUSTOM-HEADER': routeHeaderValue
          },
          method: 'GET'
        });

        await allSettled(headersChanged, {
          scope,
          params: { Authorization: headerValue }
        });
        await allSettled(api.test, { scope });

        expect(instance).toBeCalledTimes(2);
        expect(instance).toBeCalledWith({
          url,
          headers: {
            Authorization: headerValue,
            'X-CUSTOM-HEADER': routeHeaderValue
          },
          method: 'GET'
        });
      });
    });

    describe('data', () => {
      it('should pass data from dto to AxiosRequest.data', async () => {
        const url = faker.internet.url();
        const dto = { test: faker.datatype.string() };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{ test: string }>({ url, method: 'POST' })
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          data: dto,
          headers: {},
          method: 'POST'
        });
      });

      it('should pass data from dto to AxiosRequest.params if method is GET', async () => {
        const url = faker.internet.url();
        const dto = { test: faker.datatype.string() };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{ test: string }>({ url })
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          params: dto,
          headers: {},
          method: 'GET'
        });
      });

      it('should pass dto to formatter', async () => {
        const url = faker.internet.url();
        const dto = { id: faker.datatype.uuid(), age: faker.datatype.number() };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{ id: string; age: number }>(dto => ({
              url: `${url}/${dto.id}`,
              data: { age: dto.age },
              method: 'PUT'
            }))
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url: `${url}/${dto.id}`,
          data: { age: dto.age },
          headers: {},
          method: 'PUT'
        });
      });

      it('should merge params and data in GET request', async () => {
        const url = faker.internet.url();
        const dto = {
          id: faker.datatype.uuid(),
          age: faker.datatype.number(),
          paramProp: faker.datatype.uuid(),
          dataProp: faker.datatype.uuid()
        };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{
              id: string;
              age: number;
              paramProp: string;
              dataProp: string;
            }>(dto => ({
              url,
              data: { age: dto.age, prop: dto.dataProp },
              params: { id: dto.id, prop: dto.paramProp },
              method: 'GET'
            }))
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url,
          params: { age: dto.age, id: dto.id, prop: dto.dataProp },
          headers: {},
          method: 'GET'
        });
      });

      it('should format to FormData if config.formData=true', async () => {
        const url = faker.internet.url();
        const dto = { id: faker.datatype.uuid(), age: faker.datatype.number() };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{ id: string; age: number }>(dto => ({
              url: `${url}/${dto.id}`,
              data: { age: dto.age },
              method: 'PUT',
              formData: true
            }))
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        const formData = new FormData();
        formData.append('age', dto.age.toString());

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url: `${url}/${dto.id}`,
          data: formData,
          headers: {},
          method: 'PUT'
        });
      });

      it('should prefer params intead FormData', async () => {
        const url = faker.internet.url();
        const dto = { id: faker.datatype.uuid(), age: faker.datatype.number() };

        const api = http
          .createRoutesConfig({
            test: http.createRoute<{ id: string; age: number }>(dto => ({
              url: `${url}/${dto.id}`,
              data: { age: dto.age },
              method: 'GET',
              formData: true
            }))
          })
          .build();

        const scope = fork();

        await allSettled(api.test, { scope, params: dto });

        expect(instance).toBeCalledTimes(1);
        expect(instance).toBeCalledWith({
          url: `${url}/${dto.id}`,
          params: { age: dto.age },
          headers: {},
          method: 'GET'
        });
      });
    });
  });

  describe('response', () => {
    describe('rawResponseFx', () => {
      it('should return raw AxiosResponse', async () => {
        const instance = jest.fn();

        const http = createHttp(instance as unknown as AxiosInstance);

        const responseData = { value: faker.datatype.uuid() };
        const url = faker.internet.url();
        const status = faker.internet.httpStatusCode();

        instance.mockResolvedValue(
          Promise.resolve({ data: responseData, status })
        );

        const api = http
          .createRoutesConfig({
            test: http.createRoute<void, { value: string }>({ url })
          })
          .build();

        const rawFn = jest.fn();
        const mappedFn = jest.fn();

        api.test.rawResponseFx.doneData.watch(rawFn);
        api.test.doneData.watch(mappedFn);

        const scope = fork();

        await allSettled(api.test, { scope });

        expect(rawFn).toBeCalledWith({ status, data: responseData });
        expect(mappedFn).toBeCalledWith(responseData);
      });
    });
  });

  describe('options', () => {
    let responseData: { value: string };
    let url: string;

    beforeEach(() => {
      responseData = { value: faker.datatype.uuid() };
      url = faker.internet.url();

      instance.mockResolvedValue(Promise.resolve({ data: responseData }));
    });

    it('should use createBatchEffect for route with options.batch=true', async () => {
      const api = http
        .createRoutesConfig({
          test: http.createRoute<void, { value: string }>({ url }),
          deep: {
            deepRoute: http.createRoute<void, { value: string }>({ url })
          }
        })

        .options({
          test: {
            batch: true
          }
        })
        .build();

      expect(isBatchedEffect(api.test)).toBe(true);
      expect(isBatchedEffect(api.test.rawResponseFx)).toBe(true);

      expect(isBatchedEffect(api.deep.deepRoute)).toBe(false);
      expect(isBatchedEffect(api.deep.deepRoute.rawResponseFx)).toBe(false);
    });
  });

  describe('mock', () => {
    let responseData: { value: string };
    let url: string;

    beforeEach(() => {
      responseData = { value: faker.datatype.uuid() };
      url = faker.internet.url();

      instance.mockResolvedValue(Promise.resolve({ data: responseData }));
    });

    it('should use createMockEffect for mocked route', async () => {
      const api = http
        .createRoutesConfig({
          test: http.createRoute<void, { value: string }>({ url }),
          deep: {
            deepRoute: http.createRoute<void, { value: string }>({ url })
          }
        })
        .mocks({ test: { response: responseData } })
        .build();

      expect(isMockEffect(api.test)).toBe(true);
      expect(isMockEffect(api.test.rawResponseFx)).toBe(true);

      expect(isMockEffect(api.deep.deepRoute)).toBe(false);
      expect(isMockEffect(api.deep.deepRoute.rawResponseFx)).toBe(false);
    });

    it('should use createMockEffect and createBatchEffect for mocked route with batch=true', async () => {
      const api = http
        .createRoutesConfig({
          test: http.createRoute<void, { value: string }>({ url }),
          deep: {
            deepRoute: http.createRoute<void, { value: string }>({ url })
          }
        })
        .mocks({ test: { batch: true, response: responseData } })
        .build();

      expect(isMockEffect(api.test)).toBe(true);
      expect(isMockEffect(api.test.rawResponseFx)).toBe(true);
      expect(isBatchedEffect(api.test)).toBe(true);
      expect(isBatchedEffect(api.test.rawResponseFx)).toBe(true);
    });
  });

  describe('validation', () => {
    type Contract = { api: string };

    let instance: jest.Mock;
    let http: Http;
    let response: Contract;
    let watchFn: jest.Mock;

    beforeEach(() => {
      instance = jest.fn();
      watchFn = jest.fn();

      response = { api: faker.datatype.string() };
      http = createHttp(instance as unknown as AxiosInstance);
    });

    it('should pass if validation passed', async () => {
      instance.mockResolvedValue(Promise.resolve({ data: response }));

      const schema = object<Contract>({
        api: string().required()
      }).required();

      const api = http
        .createRoute<void, Contract>({ url: '/' })
        .validation(schema)
        .build();

      api.doneData.watch(watchFn);

      const scope = fork();

      await allSettled(api, { scope });

      expect(watchFn).toBeCalledTimes(1);
      expect(watchFn).toBeCalledWith(response);
    });

    it('should fail if validation failed', async () => {
      instance.mockResolvedValue(Promise.resolve({ data: {} }));

      type Contract = { api: string };
      const schema = object<Contract>({
        api: string().required()
      }).required();

      const api = http
        .createRoute<void, Contract>({ url: '/' })
        .validation(schema)
        .build();

      api.failData.watch(watchFn);

      const scope = fork();

      await allSettled(api, { scope });

      expect(watchFn).toBeCalledTimes(1);
      expect(watchFn.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });

    it('should work with shape', async () => {
      instance.mockResolvedValue(Promise.resolve({ data: {} }));

      type Contract = { api: string };
      const schema = object<Contract>({
        api: string().required()
      }).required();

      const routesConfig = http.createRoutesConfig({
        route: http.createRoute<void, Contract>({ url: '/' })
      });

      const api = routesConfig.validation({ route: schema }).build();

      api.route.failData.watch(watchFn);

      const scope = fork();

      await allSettled(api.route, { scope });

      expect(watchFn).toBeCalledTimes(1);
      expect(watchFn.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });

    it('should pass with custom validator', async () => {
      instance.mockResolvedValue(Promise.resolve({ data: response }));

      class Validator implements ValidationSchema<Contract> {
        // eslint-disable-next-line no-unused-vars
        public readonly validate = async (_: Contract) => Promise.resolve();
      }

      const routesConfig = http.createRoutesConfig({
        route: http.createRoute<void, Contract>({ url: '/' })
      });

      const api = routesConfig.validation({ route: new Validator() }).build();

      api.route.doneData.watch(watchFn);

      const scope = fork();

      await allSettled(api.route, { scope });

      expect(watchFn).toBeCalledTimes(1);
      expect(watchFn).toBeCalledWith(response);
    });

    it('should fail with custom validator', async () => {
      instance.mockResolvedValue(Promise.resolve({ data: {} }));

      class ValidationError {
        public constructor(public readonly name: string) {}
      }

      class Validator<Shape> implements ValidationSchema<Shape> {
        // eslint-disable-next-line no-unused-vars
        public readonly validate = async (_: Shape) =>
          Promise.reject(new ValidationError('Error'));
      }

      const routesConfig = http.createRoutesConfig({
        route: http.createRoute<void, Contract>({ url: '/' }),
        deep: {
          route: http.createRoute<void, Contract>({ url: '/' })
        }
      });

      const api = routesConfig
        .validation({
          route: new Validator(),
          deep: { route: new Validator() }
        })
        .build();

      api.route.failData.watch(watchFn);

      const scope = fork();

      await allSettled(api.route, { scope });

      expect(watchFn).toBeCalledTimes(1);
      expect(watchFn.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });

  describe('build', () => {
    let responseData: { value: string };
    let url: string;

    beforeEach(() => {
      responseData = { value: faker.datatype.uuid() };
      url = faker.internet.url();

      instance.mockResolvedValue(Promise.resolve({ data: responseData }));
    });

    it('should not throw error while build in nested structure', async () => {
      const routesConfig = () => ({
        test: http.createRoute<void, { value: string }>({ url }),
        deep: {
          deepRoute: http.createRoute<void, { value: string }>({ url })
        }
      });

      const api1 = http
        .createRoutesConfig(routesConfig())
        .options({ deep: { deepRoute: { batch: true } } })
        .mocks({ test: { batch: true, response: responseData } });

      const api2 = http
        .createRoutesConfig(routesConfig())
        .options({ test: {} })
        .mocks({
          deep: { deepRoute: { batch: true, response: responseData } }
        });

      const api3 = http
        .createRoutesConfig(routesConfig())
        .options({ deep: { deepRoute: { batch: true } } })
        .mocks({});

      const api4 = http.createRoutesConfig(routesConfig());

      expect(api1.build).not.toThrow();
      expect(api2.build).not.toThrow();
      expect(api3.build).not.toThrow();
      expect(api4.build).not.toThrow();
    });
  });
});
