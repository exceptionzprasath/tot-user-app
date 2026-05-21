import axios from 'axios';

const api = axios.create({
    baseURL: 'https://settlo-tot-backend.vercel.app/api',
    // baseURL: 'https://c05a-2401-4900-caa4-7362-c482-b9a5-780d-80b8.ngrok-free.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
