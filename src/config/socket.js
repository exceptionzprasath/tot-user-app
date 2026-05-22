import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket;

export const initSocket = (userData) => {
    if (!socket) {
        socket = io(API_BASE_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });
        
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            if (userData && userData.phone) {
                socket.emit('join', { phone: userData.phone });
                console.log(`[Socket] Joined room customer_${userData.phone}`);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.log('[Socket] Connection error:', err.message);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn('[Socket] Not initialized. Call initSocket first.');
    }
    return socket;
};

/**
 * Listen for order confirmation from the server.
 * Called when a rider accepts the customer's order.
 * @param {function} callback - receives { orderId, status, rider, order }
 */
export const onOrderConfirmed = (callback) => {
    if (socket) {
        socket.on('order_confirmed', callback);
    }
};

/**
 * Remove the order_confirmed listener.
 */
export const offOrderConfirmed = () => {
    if (socket) {
        socket.off('order_confirmed');
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('[Socket] Disconnected and cleaned up');
    }
};
