import { API_BASE_URL } from '../services/api';

export { API_BASE_URL };

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
