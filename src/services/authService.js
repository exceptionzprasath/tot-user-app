import auth from '@react-native-firebase/auth';
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

// Store the confirmation object internally to avoid React Navigation serialization issues
let currentConfirmation = null;

/**
 * Send OTP via Firebase Phone Authentication
 * Stores the confirmation object internally.
 */
export const sendOTP = async (phone) => {
    try {
        // Firebase sends the OTP SMS automatically
        currentConfirmation = await auth().signInWithPhoneNumber(phone);
        return { success: true };
    } catch (error) {
        console.error('Firebase Send OTP Error:', error);
        throw error;
    }
};

/**
 * Verify OTP entered by user using the internally stored Firebase confirmation object
 * On success, gets the Firebase ID token and calls backend to fetch/confirm user
 */
export const verifyOTP = async (otpCode, phone) => {
    try {
        let idToken;
        let verifiedPhone = phone;

        if (!currentConfirmation) {
            // TEMPORARY BYPASS: We skipped Firebase, so use mock token
            idToken = 'mock-token-for-bypass';
        } else {
            // Normal Flow
            const userCredential = await currentConfirmation.confirm(otpCode);
            idToken = await userCredential.user.getIdToken();
            verifiedPhone = userCredential.user.phoneNumber;
        }

        // Verify token with backend and fetch user data (This will get the Name, Role, etc.)
        const response = await api.post('/auth/verify-firebase-token', { 
            idToken, 
            phone: verifiedPhone 
        });

        if (response.data.success) {
            await AsyncStorage.setItem('userToken', idToken);
        }

        return response.data;
    } catch (error) {
        console.error('Firebase Verify OTP Error:', error);
        // Rethrow with user-friendly messages
        if (error.code === 'auth/invalid-verification-code') {
            throw new Error('Invalid OTP. Please check the code and try again.');
        } else if (error.code === 'auth/code-expired') {
            throw new Error('OTP has expired. Please request a new one.');
        }
        throw error;
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
    await auth().signOut();
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
