import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkPhone = async (phone) => {
    try {
        const response = await api.post('/auth/check-phone', { phone });
        return response.data;
    } catch (error) {
        console.error('Check Phone API Error:', error);
        throw error;
    }
};

export const sendOTP = async (phone) => {
    try {
        const response = await api.post('/auth/send-otp', { phone });
        return response.data;
    } catch (error) {
        console.error('Send OTP API Error:', error);
        throw error;
    }
};

export const verifyOTP = async (phone, otp) => {
    try {
        const response = await api.post('/auth/verify-otp', { phone, otp });
        if (response.data.success) {
            await AsyncStorage.setItem('userToken', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Verify OTP API Error:', error);
        throw error;
    }
};

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
    await AsyncStorage.removeItem('userToken');
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
