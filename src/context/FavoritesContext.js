import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

const FAVORITES_STORAGE_KEY = '@thambiorutea_favorites';

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Load favorites from storage on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            if (storedFavorites !== null) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites from AsyncStorage:', error);
        }
    };

    const saveFavorites = async (updatedFavorites) => {
        try {
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
        } catch (error) {
            console.error('Error saving favorites to AsyncStorage:', error);
        }
    };

    const toggleFavorite = (itemId) => {
        setFavorites((prevFavorites) => {
            let updatedFavorites;
            if (prevFavorites.includes(itemId)) {
                updatedFavorites = prevFavorites.filter(id => id !== itemId);
            } else {
                updatedFavorites = [...prevFavorites, itemId];
            }
            saveFavorites(updatedFavorites);
            return updatedFavorites;
        });
    };

    const isFavorite = (itemId) => {
        return favorites.includes(itemId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
