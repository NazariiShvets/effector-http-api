import { Http } from './http';
import axios from 'axios';
import { createStore } from 'effector';

//config.ts
const instance = axios.create();
const http = new Http(instance);

//routes.gen.ts
const routes = http.createHttpRoutes({
  category: {
    getAll: http.createRoute<void, { name: string }[]>({
      url: '/category/getAll'
    }),
    getBySlug: http.createRoute<string, { name: string }>({
      url: '/category/getBySlug'
    })
  }
});

//options.ts
routes.category.getAll.options({
  batchConcurrentRequests: true,
  forceTrimPayload: true
});

//mock.ts
routes.category.getBySlug.mock({
  response: slug => ({ name: slug }),
  delay: 1000
});

//auth.ts
const $headers = createStore({});
http.headers($headers);

//index.ts
