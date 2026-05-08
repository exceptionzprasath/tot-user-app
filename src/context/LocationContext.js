import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [savedLocations, setSavedLocations] = useState([]);

    useEffect(() => {
        loadSavedLocations();
    }, []);

    const loadSavedLocations = async () => {
        try {
            const saved = await AsyncStorage.getItem('thambioru_saved_locations');
            if (saved) {
                setSavedLocations(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved locations:', error);
        }
    };

    const saveLocations = async (locations) => {
        try {
            await AsyncStorage.setItem('thambioru_saved_locations', JSON.stringify(locations));
        } catch (error) {
            console.error('Error saving locations:', error);
        }
    };

    const addLocation = (location) => {
        const newLocations = [...savedLocations, { ...location, id: Date.now().toString() }];
        setSavedLocations(newLocations);
        saveLocations(newLocations);
    };

    const removeLocation = (id) => {
        const newLocations = savedLocations.filter(loc => loc.id !== id);
        setSavedLocations(newLocations);
        saveLocations(newLocations);
    };

    return (
        <LocationContext.Provider value={{
            savedLocations,
            addLocation,
            removeLocation
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
