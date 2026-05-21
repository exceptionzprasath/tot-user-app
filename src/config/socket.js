import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket;

export const initSocket = (userData) => {
    if (!socket) {
        socket = io(API_BASE_URL);
        
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            if (userData && userData.phone) {
                socket.emit('join', { phone: userData.phone });
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn('Socket not initialized. Call initSocket first.');
    }
    return socket;
};
