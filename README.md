# Thambioru Tea - Customer App

A beautiful React Native mobile application for tea and coffee delivery, featuring real-time vehicle tracking, browsing menu, and order management.

## Features

- 📱 **Mobile OTP Authentication** - Secure login with phone number and OTP verification
- 🗺️ **Live Vehicle Tracking** - View nearby tea/coffee vehicles on map
- ☕ **Browse Menu** - Explore tea, coffee, and snacks with beautiful product cards
- 🛒 **Cart & Checkout** - Add items to cart and place orders
- 📦 **Order Tracking** - Real-time tracking of active orders with vehicle location
- 👤 **User Profile** - Manage profile, addresses, and settings

## Tech Stack

- **React Native 0.83.1** - Mobile framework
- **React Navigation** - Navigation management
- **React Native Maps** - Google Maps integration
- **React Native Animatable** - Smooth animations
- **Mock Services** - All backend functionality using mock data

## Prerequisites

- Node.js >= 20
- Android Studio (for Android development)
- React Native CLI
- Java JDK 11+

## Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Google Maps API**

- Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
- Open `android/app/src/main/AndroidManifest.xml`
- Replace `YOUR_API_KEY_HERE` with your actual API key:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

## Running the App

### Android

```bash
# Start Metro bundler
npm start

# Run on Android (in a new terminal)
npm run android
```

### iOS

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS
npm run ios
```

## Project Structure

```
thambiorutea2/
├── src/
│   ├── screens/
│   │   ├── auth/           # Login & OTP screens
│   │   │   ├── LoginScreen.js
│   │   │   └── OTPScreen.js
│   │   └── main/           # Main app screens
│   │       ├── HomeScreen.js        # Map view with vehicles
│   │       ├── MenuScreen.js        # Browse menu
│   │       ├── OrdersScreen.js      # Order history
│   │       ├── ProfileScreen.js     # User profile
│   │       └── TrackOrderScreen.js  # Live order tracking
│   ├── components/         # Reusable components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   └── ProductCard.js
│   ├── navigation/         # Navigation setup
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── services/           # Mock services
│   │   ├── mockAuthService.js
│   │   ├── mockMenuService.js
│   │   └── mockVehicleService.js
│   ├── data/              # Mock data
│   │   └── mockData.js
│   └── utils/             # Utilities
│       └── colors.js      # Color palette & theme
└── App.js                 # Root component
```

## Mock Data & Authentication

Currently, the app uses **mock data** for all functionality:

### Login & OTP
- Enter any 10-digit mobile number starting with 6-9
- OTP will be displayed on screen (any 4-digit code works)
- The generated OTP is logged in console

### Menu Items
- 10+ mock items (teas, coffees, snacks)
- All items are available with images from Unsplash

### Nearby Vehicles
- 4 mock vehicles with different locations around Bangalore
- Simulated location updates every 3 seconds

### Order Tracking
- Mock order data with simulated delivery tracking
- Live location updates for vehicle movement

## Features Walkthrough

### 1. Authentication Flow
- **Login Screen**: Enter mobile number (e.g., 9876543210)
- **OTP Screen**: Enter the displayed OTP or any 4-digit code
- Successfully logged in!

### 2. Home/Map Screen
- View map with your location
- See nearby tea/coffee vehicles as markers
- Tap markers to view vehicle info
- Navigate to menu to place orders

### 3. Menu Screen
- Filter by category (All, Tea, Coffee, Snacks)
- Add items to cart
- View cart summary with total amount
- Checkout to place order

### 4. Orders Screen
- View active orders
- Check order history
- Track active deliveries in real-time

### 5. Track Order Screen
- See live map with your location and vehicle location
- View estimated delivery time
- Check order details and vehicle info
- Vehicle marker moves to simulate real tracking

### 6. Profile Screen
- View user information
- Access saved addresses (coming soon)
- Check order history
- Logout functionality

## Color Scheme

The app uses a warm, inviting color palette inspired by tea and coffee:

- **Primary (Coffee)**: `#6F4E37` - Rich coffee brown
- **Secondary (Tea)**: `#8B9556` - Tea green
- **Accent**: `#FF6B35` - Vibrant orange
- Status colors for order tracking and UI feedback

## Next Steps (Backend Integration)

To connect with a real backend:

1. Replace mock services in `src/services/` with actual API calls
2. Implement real OTP sending via SMS gateway
3. Connect to backend for menu items, vehicle locations
4. Integrate real-time location tracking with WebSockets
5. Add payment gateway integration
6. Implement push notifications for order updates

## Screenshots

(Screenshots will be added after UI finalization)

## Known Issues

- Google Maps requires API key configuration
- Some Android permissions may require manual enabling
- Location permissions must be granted for map features

## Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0  
**Built with** ❤️ **using React Native**
