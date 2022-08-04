/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';

const instance = axios.create();
const http = new Http(instance);
const routes = http.createRoutesConfig({
  category: http.createRoute<string, { name: string }>({ url: '/' }),
  category1: {
    get: http.createRoute({})
  }
});

routes.mocks({
  category: {
    batch: true,
    response: { name: '12' }
  },
  category1: {
    get: {
      batch: true,
      delay: 10,
      response: () => ({})
    }
  }
});

routes.options({
  category: {
    rawResponse: true
  },
  category1: { get: { batch: true } }
});

const api = routes.build();

api.category;
api.category1.get;
