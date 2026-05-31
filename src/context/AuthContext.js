import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFreeTeaEligible, setIsFreeTeaEligible] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user_session');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, []);

    const refreshFreeTeaEligibility = async () => {
        if (user && user.phone) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/customer/${encodeURIComponent(user.phone)}/free-tea-eligibility`);
                const data = await response.json();
                if (data && data.success) {
                    setIsFreeTeaEligible(data.eligible);
                }
            } catch (error) {
                console.log('Error checking free tea eligibility:', error.message);
            }
        } else {
            setIsFreeTeaEligible(false);
        }
    };

    useEffect(() => {
        refreshFreeTeaEligibility();
    }, [user, isAuthenticated]);

    const login = async (userData) => {
        try {
            await AsyncStorage.setItem('user_session', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user_session');
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    };

    const updateUser = async (updatedData) => {
        try {
            const newUser = { ...user, ...updatedData };
            await AsyncStorage.setItem('user_session', JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            console.error('Failed to update user session:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user, 
            isLoading, 
            login, 
            logout, 
            updateUser,
            isFreeTeaEligible,
            refreshFreeTeaEligibility
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
