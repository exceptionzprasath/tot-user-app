import axios from 'axios';

// Central source of truth for the backend URL
export const API_BASE_URL = 'https://settlo-tot-backend-production.up.railway.app';
// export const API_BASE_URL = 'https://780f-2401-4900-93d7-7f59-6805-a606-8564-cecd.ngrok-free.app'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
