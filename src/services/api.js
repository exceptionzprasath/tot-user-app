import axios from 'axios';

// Central source of truth for the backend URL
export const API_BASE_URL = 'https://api.foodman.shop';
// export const API_BASE_URL = 'https://6700-2409-4072-110-bc7d-6113-527f-4157-7287.ngrok-free.app'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
