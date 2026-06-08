/**
 * Thambioru Tea - Customer App
 * Tea & Coffee Delivery Mobile Application
 */

import React from 'react';
import { StatusBar, Platform, PermissionsAndroid, Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
  const [announcementText, setAnnouncementText] = React.useState('');
  const [showAnnouncement, setShowAnnouncement] = React.useState(false);

  // Check backend for force updates and announcement configs
  React.useEffect(() => {
    const fetchConfigs = async () => {
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
        console.log('[Version Check] Network error:', err.message);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/config/announcement`);
        const data = await response.json();
        
        if (data && data.success && data.data) {
          const { active, content } = data.data;
          if (active && content) {
            setAnnouncementText(content);
            setShowAnnouncement(true);
          }
        }
      } catch (err) {
        console.log('[Announcement Check] Network error:', err.message);
      }
    };

    fetchConfigs();
  }, []);

  // Handle notifications and permissions sequentially when splash finishes
  const handleSplashFinish = async () => {
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
    } finally {
      setIsSplashDone(true);
    }
  };

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
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>

      {/* App Announcement Modal */}
      <Modal
        visible={showAnnouncement && isSplashDone && !isLoading && !isUpdateRequired}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAnnouncement(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.announcementContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📢</Text>
            </View>
            <Text style={styles.announcementTitle}>Important Announcement</Text>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
              <Text style={styles.announcementContent}>{announcementText}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.announcementButton}
              activeOpacity={0.8}
              onPress={() => setShowAnnouncement(false)}
            >
              <Text style={styles.announcementButtonText}>Ok, Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  announcementContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  announcementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 180,
    width: '100%',
    marginBottom: 20,
  },
  announcementContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4F4F4F',
    textAlign: 'center',
  },
  announcementButton: {
    backgroundColor: '#D32F2F', // Brand primary red
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  announcementButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
