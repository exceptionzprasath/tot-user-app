import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../utils/colors';

// Screens
import MenuScreen from '../screens/main/MenuScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TrackOrderScreen from '../screens/main/TrackOrderScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import CartScreen from '../screens/main/CartScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

import CustomTabBar from './CustomTabBar';
import TermsPrivacyScreen from '../screens/main/TermsPrivacyScreen';

const ProfileStack = createStackNavigator();

const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </ProfileStack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.secondary,
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
            }}
        >
            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ tabBarLabel: 'Favorites' }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    // Standard styles moved to CustomTabBar or kept here if needed
});

// Main Navigator (Root Stack)
const MainNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
        </Stack.Navigator>
    );
};

export default MainNavigator;
