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
import ForceUpdateScreen from './src/screens/ForceUpdateScreen';
import { API_BASE_URL } from './src/config/api';
import packageJson from './package.json';

const isVersionOlder = (current, required) => {
  if (!current || !required) return false;
  const currentParts = current.split('.').map(Number);
  const requiredParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
    const curr = currentParts[i] || 0;
    const req = requiredParts[i] || 0;
    if (curr < req) return true;
    if (curr > req) return false;
  }
  return false;
};

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSplashDone, setIsSplashDone] = React.useState(false);
  const [isUpdateRequired, setIsUpdateRequired] = React.useState(false);
  const [requiredVersion, setRequiredVersion] = React.useState('0.0.1');
  const [playStoreUrl, setPlayStoreUrl] = React.useState('https://play.google.com/store/apps/details?id=com.thambiorutea');

  // Check backend for force updates
  React.useEffect(() => {
    const checkAppVersion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/config/app-version`);
        const data = await response.json();
        
        if (data && data.minRequiredVersion) {
          const currentVersion = packageJson.version || '0.0.1';
          setRequiredVersion(data.minRequiredVersion);
          
          if (isVersionOlder(currentVersion, data.minRequiredVersion)) {
            setIsUpdateRequired(true);
            if (data.playStoreUrl) {
              setPlayStoreUrl(data.playStoreUrl);
            }
          }
        }
      } catch (err) {
        console.log('[Version Check] Network error or endpoint not yet deployed:', err.message);
      }
    };

    checkAppVersion();
  }, []);

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

    if (isAuthenticated && isSplashDone && !isUpdateRequired) {
      setupNotifications();
    }
  }, [isAuthenticated, isSplashDone, isUpdateRequired]);

  // If a force update is required, show the un-dismissible ForceUpdateScreen
  if (isUpdateRequired) {
    return (
      <ForceUpdateScreen 
        playStoreUrl={playStoreUrl}
        currentVersion={packageJson.version || '0.0.1'}
        requiredVersion={requiredVersion}
      />
    );
  }

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
