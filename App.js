/**
 * Thambioru Tea - Customer App
 * Tea & Coffee Delivery Mobile Application
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/utils/colors';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import SplashScreen from './src/screens/SplashScreen';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSplashDone, setIsSplashDone] = React.useState(false);

  // Combine splash completion with auth loading
  if (!isSplashDone || isLoading) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
      />
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <LocationProvider>
              <AppContent />
            </LocationProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
