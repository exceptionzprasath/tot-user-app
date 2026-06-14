import axios from 'axios';

// Central source of truth for the backend URL
// export const API_BASE_URL = 'https://api.foodman.shop';
export const API_BASE_URL = 'https://ef3a-2401-4900-9270-edc9-a5ad-2084-3ebb-c512.ngrok-free.app'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
