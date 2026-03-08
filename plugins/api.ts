import axios from 'axios'

export default defineNuxtPlugin(() => {
    const {
        public: { apiBaseUrl, apiWebToken },
    } = useRuntimeConfig()

    const instance = axios.create({
        baseURL: apiBaseUrl,
    })

    instance.interceptors.request.use(
        function (config) {
            if (apiWebToken) {
                config.headers.Authorization = `Bearer ${apiWebToken}`
            }
            return config
        },
        function (error) {
            return Promise.reject(error)
        },
    )

    return {
        provide: {
            axios: instance,
        },
    }
})
