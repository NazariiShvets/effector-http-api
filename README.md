# effector-http-api

# Installation

Dependencies

```shell
npm i effector-http-api
```

or is you use yarn

```shell
yarn add effector-http-api
```

Also install peer-dependencies

```shell
yarn add axios effector
```

---

# Usage

```typescript
// src/shared/api/my-backend.ts`
import { createHttp } from 'effector-http-api'
import type { User, CreateUserDto, UpdateUserDto } from './models'

const instance = axios.create()
const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
 // createRoute<Dto, Contract>() returns Effect<Dto, Contract>
 getAll: http.createRoute<void, User[]>({
  url: '/',
  // "GET" method is set by default, no need to add this line
  method: 'GET'
 }),

 // dto provided to route pass to AxiosRequestConfig['data']
 create: http.createRoute<CreateUserDto, User>({
  url: '/',
  method: 'POST'
 }),

 // In 'GET' request `dto` will be passed to url as query
 getFiltered: http.createRoute<FiltersDto, User[]>({
  url: '/',
 }),

 // If you need to customize behavior of dto — use callback instead of config
 update: http.creteRoute<{ id: User['id'], data: UpdateUserDto }, User>(({id, data}) => ({
  url: `/${id}`,
  method: 'PUT',
  data
 })),

 get: http.createRoute<User['id'], User>((id) => ({
  url: `/${id}`,
 })),


 createByUpload: http.createRoute<{ file: File }>({
  url: '/upload/users',
  method: 'POST',
  // dto provided with this flag converts to FormData under the hood
  formData: true
 })
});

const api = routesConfig.build();

export { api }

```

---

## Headers

To attach headers to requests, call `http.headers(unit)`, and pass as payload `Unit<AxiosRequestHeaders>`

### Usage

```typescript
import { createEvent, createStore } from "effector";
import { AxiosRequestHeaders } from "axios";


const headersChanged = createEvent<AxiosRequestHeaders>()
createHttp(instance).headers(headersChanged);

// or
const $headers = createStore<AxiosRequestHeaders>({})
createHttp(instance).headers($headers);
```

---

## Options

To add custom option to route use `http.createRoutesConfig.options(options)`

### batch: boolean

If route called multiple times while request is pending,
calls will be batched with call which start a request

```typescript
const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
 route: http.createRoute<void,User[]>({ url: '/' })
});

routesConfig.options({
 route: {
  batch: true
 }
});

const api = routesConfig.build();
```

## Validation:

Validate response from backend before resolve request

### `yup` validator  example

```typescript
import { number, object, string } from "yup";

const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
 getUsers: http.createRoute<void, User[]>({url: '/'}),
});

routesConfig.validation({
 getUsers: object({
  id: string().required(),
  age: number().required()
 }).required()
})


const api = routesConfig.build();
```

### Custom validator example

```typescript
import { ValidationSchema } from "effector-http-api";

const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
 getUsers: http.createRoute<void, User[]>({url: '/'}),
});

class MyCustomValidator implements ValidationSchema<User> {
 public validate = (user: User) => {
  //... validate user
  // return Promise.resolve() if passed
  // return Promise.reject() if not
 }
}

routesConfig.validation({
 getUsers: new MyCustomValidator()
})


const api = routesConfig.build();
```

---
## Mock:

Configuration for return mock response instead calling request

```typescript
const mockedUsers: User[] = [
 {id: 1, name: 'Mocked User 1'},
 {id: 2, name: 'Mocked User 2'}
]

const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
 getUsers: http.createRoute<void, User[]>({ url: '/' }),
 getUser: http.createRoute<User['id'], User>({ url: '/' }),
});

routesConfig.mock({
 getUsers: {
   /**
   * Same as `options.batch`.
   * Usefull, then mock responseFn has timeouts or `mock.delay`
   */
  batch: true,
  
  delay: 1500,
  response: mockedUsers
 },
 getUser: {
  delay: 1000,
  response: (id) => mockedUsers.find(user => user.id === id)
 }
});

const api = routesConfig.build();
```

---
## RawResponseFx

By default all routes map responses

```typescript
(response: AxiosResponse) => response.data
```

Raw version of route, without mapper, accessible by prop on route

```typescript
const http = createHttp(instance);

const routesConfig = http.createRoutesConfig({
  getData: http.createRoute<void, User[]>({ url:'/' }) 
});

const api = routesConfig.build();

api.getData // with mappings
api.getData.rawResponseFx // without mappings
```

---

# Generate api layer from swagger

1. Install codegen module

```shell
npm i swagger-typescript-api -D
```

or is you use yarn

```shell
yarn add swagger-typescript-api -D
```

2. Create a script file

```javascript
// {ROOT}/scripts/codegen.js

const {generateApi} = require('swagger-typescript-api');
const path = require('path');

const fileName = 'api.gen.ts';
const outputDir = path.resolve(process.cwd(), './src/shared/api');
const urlToSwaggerSchema = 'https://backend.com/swagger.json';

const pathToTemplate = path.resolve(process.cwd(), 'node_modules', 'effector-http-api/codegen-template');

generateApi({
 name: fileName,

 output: outputDir,

 url: urlToSwaggerSchema,

 httpClientType: 'axios',

 generateClient: true,

 templates: pathToTemplate,
});

```

3. Create a config file

```typescript
// {ROOT}/src/shared/api/config.ts

import axios from "axios";
import { createHttp } from 'effector-http-api'

const instance = axios.create();

const http = createHttp(instance);

export { http }
```

4. Run this command to generate api layer

```shell
node ./scripts/codegen.js
```

5. Check generated file at `src/shared/api/api.gen.ts`



6. Add `headers`, `options` or `mock`. Build routes and export `api` ready for usage

