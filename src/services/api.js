import axios from 'axios';

const api = axios.create({
    baseURL: 'https://settlo-tot-backend.vercel.app/api', // Adjusted for Android Emulator to localhost
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
