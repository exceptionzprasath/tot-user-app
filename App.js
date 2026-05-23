/**
 * Thambioru Tea - Customer App
 * Tea & Coffee Delivery Mobile Application
 */

import React from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
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

  // Request notifications permission and subscribe to topics
  React.useEffect(() => {
    const setupNotifications = async () => {
      try {
        let hasPermission = false;

        if (Platform.OS === 'android') {
          const androidVersion = parseInt(Platform.Version, 10);
          if (androidVersion >= 33) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'Thambioru Tea needs permission to send you announcements and order tracking updates.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
              }
            );
            hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            hasPermission = true;
          }
        } else {
          // iOS
          const authStatus = await messaging().requestPermission();
          hasPermission =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        }

        if (hasPermission) {
          console.log('[FCM] Push notifications permission granted.');
          // Retrieve FCM token for general telemetry/tracking
          const token = await messaging().getToken();
          console.log('[FCM] Customer push token retrieved successfully.');
          
          // Subscribe to unified 'all_users' topic for general broadcast announcements
          await messaging().subscribeToTopic('all_users');
          console.log('[FCM] Subscribed customer to topic: all_users');
        } else {
          console.log('[FCM] Push notifications permission denied.');
        }
      } catch (err) {
        console.error('[FCM] Setup error in customer app:', err.message);
      }
    };

    if (isAuthenticated && isSplashDone) {
      setupNotifications();
    }
  }, [isAuthenticated, isSplashDone]);

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
