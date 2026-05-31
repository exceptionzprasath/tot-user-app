import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({});

    // Load cart from storage on mount
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('thambioru_cart');
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const saveCart = async (newCart) => {
        try {
            await AsyncStorage.setItem('thambioru_cart', JSON.stringify(newCart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addToCart = (item) => {
        const newCart = {
            ...cart,
            [item.id]: {
                ...item,
                quantity: (cart[item.id]?.quantity || 0) + 1
            }
        };
        setCart(newCart);
        saveCart(newCart);
    };

    const removeFromCart = (itemId) => {
        if (!cart[itemId]) return;

        const newCart = { ...cart };
        if (newCart[itemId].quantity > 1) {
            newCart[itemId].quantity -= 1;
        } else {
            delete newCart[itemId];
        }
        setCart(newCart);
        saveCart(newCart);
    };

    const clearCart = () => {
        setCart({});
        saveCart({});
    };

    const getCartCount = () => {
        return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    };

    const { isFreeTeaEligible } = useAuth();

    const getCartTotal = () => {
        let total = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (isFreeTeaEligible && cart['item_001']) {
            total = Math.max(0, total - 15);
        }
        return total;
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            getCartCount,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
