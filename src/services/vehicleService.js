// Vehicle Service - Connects to backend API for vehicle data
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

/**
 * Fetch with timeout and ngrok header
 */
const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                ...options.headers,
                'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
                'Accept': 'application/json',
            },
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * Get nearby vehicles from the backend
 * @param {Object} location - Current user location { latitude, longitude }
 * @param {string} type - Filter by vehicle type ('tea', 'coffee', or null for all)
 * @returns {Promise<Object>} Response with vehicle data
 */
export const getNearbyVehicles = async (location, type = null) => {
    try {
        let url = `${API_BASE_URL}${API_ENDPOINTS.VEHICLES}`;
        const params = new URLSearchParams();

        if (location?.latitude && location?.longitude) {
            params.append('lat', location.latitude);
            params.append('lng', location.longitude);
        }

        if (type) {
            params.append('type', type);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        console.log('Fetching vehicles from:', url);
        const response = await fetchWithTimeout(url);
        const data = await response.json();

        console.log('Vehicles loaded:', data?.data?.length || 0);
        return data;
    } catch (error) {
        console.log('Backend unavailable, using mock data. Error:', error.message);
        // Return mock data as fallback if backend is not available
        return {
            success: true,
            data: getMockVehicles(location),
            isMock: true,
        };
    }
};

/**
 * Get a single vehicle by ID
 * @param {string} id - Vehicle ID
 * @returns {Promise<Object>} Response with vehicle data
 */
export const getVehicleById = async (id) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.VEHICLE_BY_ID(id)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching vehicle:', error.message);
        return {
            success: false,
            message: 'Failed to fetch vehicle',
        };
    }
};

/**
 * Update vehicle status
 * @param {string} id - Vehicle ID
 * @param {string} status - New status ('available', 'busy', 'offline')
 * @returns {Promise<Object>} Response with updated vehicle data
 */
export const updateVehicleStatus = async (id, status) => {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}${API_ENDPOINTS.VEHICLE_STATUS(id)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error updating vehicle status:', error.message);
        return {
            success: false,
            message: 'Failed to update status',
        };
    }
};

/**
 * Fallback mock vehicles when backend is unavailable
 */
const getMockVehicles = (location) => {
    const baseLat = location?.latitude || 12.9716;
    const baseLng = location?.longitude || 77.5946;

    return [
        {
            id: 'v1',
            name: 'Thambi Tea Stall',
            type: 'tea',
            latitude: baseLat + 0.002,
            longitude: baseLng + 0.001,
            employeeName: 'Raju Kumar',
            phone: '+91 9876543210',
            rating: 4.8,
            distance: 0.5,
            status: 'available',
            specialties: ['Masala Chai', 'Ginger Tea', 'Cutting Chai'],
        },
        {
            id: 'v2',
            name: 'Coffee Express',
            type: 'coffee',
            latitude: baseLat + 0.004,
            longitude: baseLng + 0.003,
            employeeName: 'Suresh M',
            phone: '+91 9876543211',
            rating: 4.5,
            distance: 0.8,
            status: 'available',
            specialties: ['Filter Coffee', 'Cappuccino', 'Cold Coffee'],
        },
        {
            id: 'v3',
            name: 'Chai Wala',
            type: 'tea',
            latitude: baseLat - 0.003,
            longitude: baseLng - 0.002,
            employeeName: 'Mohammed Ali',
            phone: '+91 9876543212',
            rating: 4.9,
            distance: 1.2,
            status: 'busy',
            specialties: ['Elaichi Chai', 'Sulaimani', 'Butter Tea'],
        },
        {
            id: 'v4',
            name: 'South Coffee House',
            type: 'coffee',
            latitude: baseLat - 0.002,
            longitude: baseLng + 0.005,
            employeeName: 'Venkat Rao',
            phone: '+91 9876543213',
            rating: 4.7,
            distance: 1.5,
            status: 'available',
            specialties: ['Mylapore Filter Coffee', 'Degree Coffee'],
        },
        {
            id: 'v5',
            name: 'Express Tea Point',
            type: 'tea',
            latitude: baseLat + 0.003,
            longitude: baseLng - 0.003,
            employeeName: 'Prakash',
            phone: '+91 9876543214',
            rating: 4.6,
            distance: 0.7,
            status: 'available',
            specialties: ['Kadak Tea', 'Lemon Tea', 'Green Tea'],
        },
    ];
};

export default {
    getNearbyVehicles,
    getVehicleById,
    updateVehicleStatus,
};
