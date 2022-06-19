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
import { createHttpApi, ContentType } from 'effector-http-api'
import type { User, CreateUserDto, UpdateUserDto } from './models'

const http = createHttpApi({ baseUrl: 'my-backend.com/api' });

// all routes url will be prefixed with '/users'
// '/' => '/users/'
const controller = http.createController('/users');

const users = {
    // createRoute<Dto, Contract>() returns Effect<Dto, Contract>
    getAll: controller.createRoute<void, User[]>({
        url:'/',
        // "GET" method is set by default, no need to add this line
        method:'GET'
    }),
    
    // dto provided to route pass to AxiosRequestConfig['data']
    create: controller.createRoute<CreateUserDto,User>({
        url: '/',
        method: 'POST'
    }),

    // In 'GET' request `dto` will be passed to url as query
    getFiltered: controller.createRoute<FiltersDto, User[]>({
        url:'/',
    }),
    
    // If you need to customize behavior of dto — use callback instead of config
    update: controller.creteRoute<{id: User['id'], data: UpdateUserDto}, User>(({id, data}) => ({
        url: `/${id}`,
        method: 'PUT',
        data
    })),

    get: controller.createRoute<User['id'], User>((id) => ({
        url: `/${id}`,
    })),


    // If you dont need controller you can create route from `api` instance
    createByUpload: http.createRoute<{ file: File }>({
        url: '/upload/users',
        method: 'POST',
        // dto provided with this type converts to FormData under the hood
        type: ContentType.FormData
    })
}

const api = { users }

export { api }

```

---
## Headers | Auth

```typescript
type Headers = {
    auth: Store<AxiosRequestHeaders>;
    custom: Store<AxiosRequestHeaders>
}
```

### Usage
```typescript

const http = createHttpApi({ 
    baseUrl: 'my-backend.com/api', 
    headers: {
        'X-CUSTOM-HEADER': "my-custom-header",
    } 
});

const $auth = $accessToken.map((token) => ({
    Authorization: `Bearer ${token}`
}))

const $custom = $customHeader.map((customHeaderValue) => ({
    'X-CUSTOM-HEADER-2': customHeaderValue
}))

http.headers({
    auth: $auth,
    custom: $custom
})
```
---
## Options
### Global Options
Options provided from higher level can be overridden by lower level (api => controller => route)


#### disableAuth: boolean
All headers will send with request by default

Route with `disableAuth: true` don't send `headers.auth` with request

```typescript
const http = createHttpApi({ baseUrl: 'my-backend.com/api' }, { disableAuth: true });

const controller = http.createController('/users', { disableAuth: false });

const route = controller.createRoute<Dto,Contract>(config,{ disableAuth: true });
```

---
#### batchConcurrentRequests: boolean
If route called multiple times while request is pending,
calls will be batched with call which start a request

```typescript
const http = createHttpApi({ baseUrl: 'my-backend.com/api' }, { batchConcurrentRequests: true });

const controller = http.createController('/users', { batchConcurrentRequests: false });

const route = controller.createRoute<Dto,Contract>(config,{ batchConcurrentRequests: true });
```

### Route-only Options

#### mapRawResponse:

Custom resolver for mapping response

By default `createRoute` has `(response) => response.data` mapper

```typescript
type RouteOptions = {
    mapRawResponse?: <Response extends AxiosResponse<any, Dto>>(raw: Response) => Contract;
}
``` 

Use-case: POST request, `Dto` has `{id: string}`, backend returns void. You can manually map response yourself:

`mapRawResponse: (response) => response.request.data.id`

@note: `response.request.data` in `AxiosResponse` is non required field in typing. This case you need fix yourself

```typescript
const route = controller.createRoute<Dto, Dto['id']>(config, {
    mapRawResponse: (response) => response.request.data.id
});
```



#### mock:

Configuration for return mock response instead calling request

```typescript
type RouteOptions<Dto, Contract> = {
    mock?: {
        /**
         * Returns instead real call request
         */
        response: Contract | RouteOptionsMockResponseHandler<Dto, Contract>;

        /**
         * Delay before return `mock.response`
         */
        delay?: number;
    };
}
``` 

```typescript
const mockedUsers = [
    { id: 1, name: 'Mocked User 1' },
    { id: 2, name: 'Mocked User 2' }
]


const getUsersFx = controller.createRoute<void, User[]>(config, {
    mock: {
        response: mockedUsers,
        delay: 1500
    }
});


const getUserFx = controller.createRoute<User['id'], User>(config, {
    mock: {
        response: (id) => mockedUsers.find(user => user.id === id),
        delay: 1500
    }
});
```

---
# Generate api layer from swagger

Install codegen module

```shell
npm i swagger-typescript-api -D
```
or is you use yarn

```shell
yarn add swagger-typescript-api -D
```

Create a script file

```javascript
// {ROOT}/scripts/codegen.js

const { generateApi } = require('swagger-typescript-api');
const path = require('path');

const fileName = 'my-backend.ts';
const outputDir = path.resolve(process.cwd(),'./src/shared/api');
const urlToSwaggerSchema = 'my-backend.com/swagger-api';

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

Run this command to generate api layer

```shell
node ./scripts/codegen.js
```

Check generated file at `src/shared/api/my-backend.ts`
