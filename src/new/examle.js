import axios from 'axios'


const instance = axios.create({});

const http = createHttp(instance,{
	mapResponse: (response) => response.data //defaults
});

const routes = http.createHttpRoutes({
	category: {
		getAll: http.createRoute((dto) => ({/* ... */})),
		getBySlug: http.createRoute({})
	}
});

routes.options({
	category: {
		getAll: {
			batchConcurrentRequests:true,
			mapRawResponse: (axiosReponse) => ({status:axiosReponse.status})
		},
	}
})

routes.headers($authHeaders)

routes.mock({
	category: {
		getBySlug: {
			response: (dto) => ({/*...*/}),
			delay: 1500
		}
	}
})

const api = routes.build({
	enableMock: true
})

export {api}
