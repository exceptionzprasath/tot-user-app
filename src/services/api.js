import axios from 'axios';

// Central source of truth for the backend URL
export const API_BASE_URL = 'https://api.foodman.shop';
// export const API_BASE_URL = 'https://ef3a-2401-4900-9270-edc9-a5ad-2084-3ebb-c512.ngrok-free.app'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle auto-retries on first-time Network Errors (cold starts/TLS handshake delays)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config } = error;
        // If config doesn't exist or we've already retried this request, reject
        if (!config || config.__isRetryRequest) {
            return Promise.reject(error);
        }

        // Detect if it is a network connection error (AxiosError: Network Error)
        const isNetworkError = !error.response && error.request;

        if (isNetworkError) {
            config.__isRetryRequest = true;
            console.log('🔄 Axios Network Error detected. Retrying request to:', config.url);
            
            // Wait 500ms before retrying to allow socket connection to warm up
            await new Promise((resolve) => setTimeout(resolve, 500));
            return api(config);
        }

        return Promise.reject(error);
    }
);

export default api;
