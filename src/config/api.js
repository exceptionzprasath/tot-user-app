// API Configuration for Thambioru Tea App
// Backend server URL

// Use ngrok URL for testing on physical devices
// Update this URL when you restart ngrok
export const API_BASE_URL = 'https://e5d9-2401-4900-ca83-9396-dda8-d19-849f-372e.ngrok-free.app';

export const API_ENDPOINTS = {
    // Vehicles
    VEHICLES: '/api/vehicles',
    VEHICLE_BY_ID: (id) => `/api/vehicles/${id}`,
    VEHICLE_STATUS: (id) => `/api/vehicles/${id}/status`,

    // Config
    MAPS_CONFIG: '/api/config/maps',

    // Health
    HEALTH: '/api/health',
};

export default {
    API_BASE_URL,
    API_ENDPOINTS,
};
