import axios from 'axios';

// Central source of truth for the backend URL
export const API_BASE_URL = 'https://settlo-tot-backend-production.up.railway.app';
// export const API_BASE_URL = 'https://cold-rooms-decide.loca.lt'

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
