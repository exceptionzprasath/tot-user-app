import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Check if a phone number is already registered in DynamoDB
 */
export const checkPhone = async (phone) => {
    try {
        const response = await api.post('/auth/check-phone', { phone });
        return response.data;
    } catch (error) {
        console.error('Check Phone API Error:', error);
        throw error;
    }
};

/**
 * Send OTP via AWS SNS (Backend)
 */
export const sendOTP = async (phone) => {
    try {
        const response = await api.post('/auth/send-otp', { phone });
        return response.data;
    } catch (error) {
        console.error('Send OTP API Error:', error);
        throw error;
    }
};

/**
 * Verify OTP entered by user using the Backend verification route
 */
export const verifyOTP = async (otpCode, phone) => {
    try {
        const response = await api.post('/auth/verify-otp', { 
            phone,
            otp: otpCode 
        });

        if (response.data.success && response.data.token) {
            await AsyncStorage.setItem('userToken', response.data.token);
        }

        return response.data;
    } catch (error) {
        console.error('Verify OTP API Error:', error);
        // Extract error message from response if available
        const message = error.response?.data?.message || 'The OTP you entered is incorrect. Please try again.';
        throw new Error(message);
    }
};

/**
 * Register a new user after phone verification
 */
export const registerUser = async (formData) => {
    try {
        const response = await api.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Register API Error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
    } catch (error) {
        console.error('Logout Error:', error);
    }
};

export const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
};

export default {
    checkPhone,
    sendOTP,
    verifyOTP,
    registerUser,
    logout,
    getToken,
};
