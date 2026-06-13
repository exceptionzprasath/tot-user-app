import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Alert,
    Linking,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import api from '../../services/api';
import { listenToOrder } from '../../config/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const CartScreen = ({ navigation }) => {
    const { cart, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
    const { savedLocations } = useLocation();
    const { user, isFreeTeaEligible, logout, refreshFreeTeaEligibility } = useAuth();
    const insets = useSafeAreaInsets();
    const extraBottom = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 15 : 0);
    const cartItems = Object.values(cart);

    // Ordering States
    const [isOrdering, setIsOrdering] = React.useState(false);
    const [orderStep, setOrderStep] = React.useState('fetching'); // 'fetching' | 'confirm'
    const [locationData, setLocationData] = React.useState(null);
    const [readableAddress, setReadableAddress] = React.useState('');
    const [isFetchingInfo, setIsFetchingInfo] = React.useState(false);

    // Live Riders Map States
    const [onlineRiders, setOnlineRiders] = React.useState([]);
    const [isFetchingRiders, setIsFetchingRiders] = React.useState(false);

    // Poll online riders when overlay is shown
    React.useEffect(() => {
        let interval;
        const fetchRiders = async () => {
            try {
                const res = await api.get('/riders/online');
                if (res.data.success) {
                    setOnlineRiders(res.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching online riders:', err);
            }
        };

        if (isOrdering && orderStep === 'confirm') {
            fetchRiders();
            interval = setInterval(fetchRiders, 10000); // Poll every 10s
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOrdering, orderStep]);

    // Razorpay / Payment States
    const [pendingOrderId, setPendingOrderId] = React.useState(null);
    const [paymentStatus, setPaymentStatus] = React.useState('none'); // 'none' | 'initiating' | 'waiting' | 'failed'
    const [checkoutUrl, setCheckoutUrl] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('COD'); // null | 'ONLINE' | 'COD'

    // Real-time Firestore event listener for payment success
    React.useEffect(() => {
        if (!pendingOrderId) return;

        console.log('🔥 [Firestore] Listening to order for payment verification:', pendingOrderId);
        const unsubscribe = listenToOrder(
            pendingOrderId,
            (updatedOrder) => {
                if (updatedOrder && updatedOrder.status === 'placed') {
                    console.log('💳 [Firestore] Payment verified in app for order:', pendingOrderId);
                    clearCart();
                    setIsOrdering(false);
                    setPendingOrderId(null);
                    setPaymentStatus('none');
                    refreshFreeTeaEligibility();
                    navigation.navigate('TrackOrder', { order: updatedOrder });
                }
            },
            (error) => console.error('Firestore order payment listen error:', error)
        );

        return () => {
            if (unsubscribe) unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingOrderId]);

    // Handle deep link redirect back to app
    React.useEffect(() => {
        const handleDeepLink = async (event) => {
            const url = event.url;
            console.log('🔗 [Deep Link] App opened with url:', url);
            if (url && url.includes('payment-success')) {
                const urlParts = url.split('?');
                if (urlParts.length > 1) {
                    const params = urlParts[1].split('&');
                    const orderIdParam = params.find(p => p.startsWith('orderId='));
                    if (orderIdParam) {
                        const orderId = orderIdParam.split('=')[1];
                        if (orderId === pendingOrderId) {
                            console.log('💳 [Deep Link] Payment successful for order:', orderId);
                            try {
                                const response = await api.get(`/orders/${orderId}`);
                                if (response.data.success) {
                                    clearCart();
                                    setIsOrdering(false);
                                    setPendingOrderId(null);
                                    setPaymentStatus('none');
                                    refreshFreeTeaEligibility();
                                    navigation.navigate('TrackOrder', { order: response.data.data });
                                }
                            } catch (err) {
                                console.error('Error fetching order after deep link:', err);
                            }
                        }
                    }
                }
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });

        return () => {
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingOrderId]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            return auth === 'granted';
        }

        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'Thambi Oru Tea needs access to your location to deliver your tea.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return false;
    };

    const getAddressFromCoords = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ThambiOruTeaApp/1.0',
                    },
                }
            );
            const data = await response.json();
            return data.display_name || 'Address not found';
        } catch (error) {
            console.error('Geocoding error:', error);
            return 'Could not fetch address';
        }
    };

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        // Check for active pending orders (within 5 minutes)
        if (user && user.phone) {
            setIsOrdering(true);
            setOrderStep('fetching'); // Show loading indicator
            try {
                const activeRes = await api.get(`/orders/customer/${user.phone}`);
                if (activeRes.data.success && activeRes.data.data && activeRes.data.data.length > 0) {
                    const latestOrder = activeRes.data.data[0];
                    const elapsedSeconds = Math.floor((Date.now() - new Date(latestOrder.createdAt).getTime()) / 1000);
                    const isConfirmedActive = latestOrder.status === 'confirmed';
                    const isPlacedActive = latestOrder.status === 'placed' && elapsedSeconds < 300;

                    if (isConfirmedActive || isPlacedActive) {
                        setIsOrdering(false);
                        Alert.alert(
                            'Active Order Pending',
                            isConfirmedActive
                                ? 'You already have an order accepted and being delivered by a rider. To prevent duplicates, you cannot place another order until the current one is delivered.'
                                : 'You already have an active order waiting for rider confirmation. To prevent duplicates, you cannot place another order until the current one is accepted or expires.',
                            [
                                {
                                    text: 'Track Pending Order',
                                    onPress: () => {
                                        navigation.navigate('TrackOrder', { order: latestOrder });
                                    }
                                },
                                { text: 'Back', style: 'cancel' }
                            ]
                        );
                        return;
                    }
                }
            } catch (e) {
                console.error('Error checking active orders:', e);
            } finally {
                setIsOrdering(false);
            }
        }

        /* Comment out number verified check temporarily
        if (!user || !user.isVerified) {
            Alert.alert(
                'Verification Required',
                'You must verify your mobile number before placing an order. Would you like to log out and log in again to verify your number?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Log Out',
                        style: 'destructive',
                        onPress: async () => {
                            await logout();
                        }
                    }
                ]
            );
            return;
        }
        */

        setIsOrdering(true);
        setOrderStep('fetching');
        setReadableAddress('');

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location permission is required to place an order.');
            setIsOrdering(false);
            return;
        }

        const performLocationFetch = (highAccuracy = true) => {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationData({ latitude, longitude });

                    // Fetch readable address
                    const address = await getAddressFromCoords(latitude, longitude);
                    setReadableAddress(address);
                    setOrderStep('confirm');
                },
                async (error) => {
                    console.log(`Location fetch error (highAccuracy=${highAccuracy}):`, error.code, error.message);
                    if (highAccuracy) {
                        console.log('Retrying location fetch with low accuracy...');
                        performLocationFetch(false);
                    } else {
                        Alert.alert('Location Error', 'Failed to get your current location. Please check your GPS/Network settings and try again.');
                        setIsOrdering(false);
                    }
                },
                { 
                    enableHighAccuracy: highAccuracy, 
                    timeout: highAccuracy ? 10000 : 20000, 
                    maximumAge: 10000 
                }
            );
        };
        performLocationFetch(true);
    };

    const finalizeOrder = async () => {
        if (isFetchingInfo) return;
        setIsFetchingInfo(true);
        setPaymentStatus('initiating');

        try {
            const orderData = {
                id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
                items: cartItems,
                totalAmount: getCartTotal(),
                deliveryAddress: readableAddress,
                locationCoords: locationData,
                customerLocation: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    address: readableAddress
                },
                customerName: user?.name,
                customerPhone: user?.phone,
                paymentMethod: paymentMethod, // 'ONLINE' or 'COD'
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success) {
                if (response.data.pendingPayment) {
                    const { orderId, checkoutUrl: url } = response.data;
                    setPendingOrderId(orderId);
                    setCheckoutUrl(url);
                    setPaymentStatus('waiting');

                    // Open the checkout page in the mobile browser
                    Linking.openURL(url);
                } else {
                    // COD order placed successfully!
                    clearCart();
                    setIsOrdering(false);
                    setPaymentStatus('none');
                    refreshFreeTeaEligibility();
                    navigation.navigate('TrackOrder', { order: response.data.order || response.data.data });
                }
            } else {
                setPaymentStatus('none');
                Alert.alert('Error', response.data.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Finalize Order Error:', error);
            setPaymentStatus('none');
            const errMsg = error.response?.data?.message || 'Connection failed. Please try again.';
            Alert.alert('Order Failed', errMsg);
        } finally {
            setIsFetchingInfo(false);
        }
    };

    const renderCartItem = ({ item, index }) => {
        const isFreeTea = isFreeTeaEligible && item.id === 'item_001';
        const displayTotal = isFreeTea
            ? Math.max(0, item.price * (item.quantity - 1))
            : item.price * item.quantity;

        return (
            <Animatable.View animation="fadeInRight" delay={index * 100} style={styles.cartItem}>
                <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                        {isFreeTea && (
                            <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ color: '#2E7D32', fontSize: 9, fontWeight: '700' }}>1 cup FREE</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => removeFromCart(item.id)}>
                            <Icon name="remove" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => addToCart(item)}>
                            <Icon name="add" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.itemRight}>
                    {isFreeTea && item.quantity === 1 ? (
                        <Text style={[styles.itemTotal, { color: '#2E7D32' }]}>FREE</Text>
                    ) : (
                        <View style={{ alignItems: 'flex-end' }}>
                            {isFreeTea && (
                                <Text style={{ fontSize: 10, color: COLORS.mediumGray, textDecorationLine: 'line-through' }}>₹{item.price * item.quantity}</Text>
                            )}
                            <Text style={styles.itemTotal}>₹{displayTotal}</Text>
                        </View>
                    )}
                </View>
            </Animatable.View>
        );
    };

    const renderEmptyCart = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="cart-outline" size={80} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>Add some delicious tea and snacks to get started!</Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Menu' })}>
                <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
        </View>
    );

    const renderOrderOverlay = () => {
        if (!isOrdering) return null;

        return (
            <View style={styles.overlayContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
                <Animatable.View animation="zoomIn" duration={300} style={styles.modalContent}>
                    {paymentStatus !== 'none' ? (
                        <View style={styles.fetchingContainer}>
                            {paymentStatus === 'initiating' ? (
                                <>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                    <Text style={[styles.fetchingText, { marginTop: 15 }]}>Initiating secure payment...</Text>
                                </>
                            ) : (
                                <>
                                    <ActivityIndicator size="large" color={COLORS.primary} />
                                    <Text style={[styles.fetchingText, { fontSize: SIZES.large, color: COLORS.primary, marginTop: 15 }]}>Awaiting Payment...</Text>
                                    <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginHorizontal: 20, marginTop: 10, fontSize: SIZES.small, lineHeight: 18 }}>
                                        Please complete the payment in the secure browser window that was opened.
                                    </Text>

                                    <View style={{ width: '100%', gap: 10, marginTop: 25 }}>
                                        <TouchableOpacity
                                            style={styles.confirmButton}
                                            onPress={() => checkoutUrl && Linking.openURL(checkoutUrl)}
                                        >
                                            <Icon name="open-outline" size={18} color={COLORS.white} />
                                            <Text style={styles.confirmButtonText}>Reopen Payment Page</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.confirmButton, { backgroundColor: COLORS.success }]}
                                            onPress={async () => {
                                                if (pendingOrderId) {
                                                    setIsFetchingInfo(true);
                                                    try {
                                                        const res = await api.get(`/orders/${pendingOrderId}`);
                                                        if (res.data.success && res.data.data.status === 'placed') {
                                                            clearCart();
                                                            setIsOrdering(false);
                                                            setPendingOrderId(null);
                                                            setPaymentStatus('none');
                                                            navigation.navigate('TrackOrder', { order: res.data.data });
                                                        } else {
                                                            Alert.alert('Status Check', 'Payment confirmation not received yet. Please try again or complete transaction.');
                                                        }
                                                    } catch (err) {
                                                        Alert.alert('Status Check', 'Could not check order status. Please try again.');
                                                    } finally {
                                                        setIsFetchingInfo(false);
                                                    }
                                                }
                                            }}
                                            disabled={isFetchingInfo}
                                        >
                                            {isFetchingInfo ? (
                                                <ActivityIndicator color={COLORS.white} />
                                            ) : (
                                                <>
                                                    <Icon name="refresh-outline" size={18} color={COLORS.white} />
                                                    <Text style={styles.confirmButtonText}>Refresh Payment Status</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.confirmButton, { backgroundColor: COLORS.gray, opacity: 0.8 }]}
                                            onPress={() => {
                                                setPaymentStatus('none');
                                                setPendingOrderId(null);
                                                setIsOrdering(false);
                                            }}
                                        >
                                            <Icon name="close-circle-outline" size={18} color={COLORS.white} />
                                            <Text style={styles.confirmButtonText}>Cancel Transaction</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    ) : orderStep === 'fetching' ? (
                        <View style={styles.fetchingContainer}>
                            <LottieView
                                source={require('../../assets/location.json')}
                                autoPlay
                                loop
                                style={styles.lottieAnimation}
                            />
                            <Text style={styles.fetchingText}>Fetching current location...</Text>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsOrdering(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.confirmContainer}>
                            <View style={styles.confirmHeader}>
                                <Text style={styles.confirmTitle}>Confirm Order Details</Text>
                                <TouchableOpacity onPress={() => setIsOrdering(false)}>
                                    <Icon name="close" size={24} color={COLORS.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            {/* Filter riders within 5km radius */}
                            {(() => {
                                const nearbyRiders = onlineRiders.filter(r => {
                                    if (!locationData || !r.lat || !r.lng) return false;
                                    const d = calculateDistance(locationData.latitude, locationData.longitude, r.lat, r.lng);
                                    return d <= 2.0;
                                });

                                const GOOGLE_MAPS_API_KEY = 'AIzaSyBO86Y_HqbJDWjCfBljLC72qiazTSk4i1o';
                                const staticMapUrl = locationData
                                    ? `https://maps.googleapis.com/maps/api/staticmap?center=${locationData.latitude},${locationData.longitude}&zoom=12&size=600x440&maptype=roadmap&markers=color:blue%7Clabel:C%7C${locationData.latitude},${locationData.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                                    : '';

                                return (
                                    <>
                                        <ScrollView
                                            style={{ maxHeight: 380 }}
                                            contentContainerStyle={styles.detailsList}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View style={styles.detailItem}>
                                                <Icon name="person-outline" size={20} color={COLORS.primary} />
                                                <View style={styles.detailTextContainer}>
                                                    <Text style={styles.detailLabel}>Name</Text>
                                                    <Text style={styles.detailValue}>{user?.name || 'Guest User'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.detailItem}>
                                                <Icon name="call-outline" size={20} color={COLORS.primary} />
                                                <View style={styles.detailTextContainer}>
                                                    <Text style={styles.detailLabel}>Phone</Text>
                                                    <Text style={styles.detailValue}>{user?.phone || 'Not available'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.detailItem}>
                                                <Icon name="location-outline" size={20} color={COLORS.primary} />
                                                <View style={styles.detailTextContainer}>
                                                    <Text style={styles.detailLabel}>Delivery Address</Text>
                                                    <Text style={styles.detailValue} numberOfLines={3}>
                                                        {readableAddress || 'Fetching address...'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.savedLocationsSelection}>
                                                <Text style={styles.savedLocationsTitle}>Deliver to saved location:</Text>
                                                <View style={styles.savedLocationsList}>
                                                    {savedLocations.map((loc) => (
                                                        <TouchableOpacity
                                                            key={loc.id}
                                                            style={[
                                                                styles.savedLocationChip,
                                                                readableAddress === loc.address && styles.savedLocationChipActive
                                                            ]}
                                                            onPress={() => {
                                                                setReadableAddress(loc.address);
                                                                setLocationData({ latitude: loc.latitude, longitude: loc.longitude });
                                                            }}
                                                        >
                                                            <Icon
                                                                name={loc.label.toLowerCase() === 'home' ? 'home' : loc.label.toLowerCase() === 'work' ? 'briefcase' : 'location'}
                                                                size={14}
                                                                color={readableAddress === loc.address ? COLORS.white : COLORS.primary}
                                                            />
                                                            <Text style={[
                                                                styles.savedLocationChipText,
                                                                readableAddress === loc.address && styles.savedLocationChipTextActive
                                                            ]}>{loc.label}</Text>
                                                        </TouchableOpacity>
                                                    ))}

                                                    <TouchableOpacity
                                                        style={[styles.savedLocationChip, { borderStyle: 'dashed', backgroundColor: COLORS.white }]}
                                                        onPress={() => {
                                                            setIsOrdering(false);
                                                            navigation.navigate('MainTabs', {
                                                                screen: 'Profile',
                                                                params: { screen: 'SavedLocations' }
                                                            });
                                                        }}
                                                    >
                                                        <Icon name="add" size={14} color={COLORS.primary} />
                                                        <Text style={styles.savedLocationChipText}>Other Location</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Payment Method Selection */}
                                            <View style={styles.paymentMethodSelection}>
                                                <Text style={styles.paymentMethodTitle}>Select Payment Method:</Text>
                                                <View style={styles.paymentMethodList}>
                                                    {/*
                                                    <TouchableOpacity 
                                                        style={[styles.paymentMethodChip, paymentMethod === 'ONLINE' && styles.paymentMethodChipActive]}
                                                        onPress={() => setPaymentMethod('ONLINE')}
                                                    >
                                                        <Icon name="card-outline" size={16} color={paymentMethod === 'ONLINE' ? COLORS.white : COLORS.primary} />
                                                        <Text style={[styles.paymentMethodChipText, paymentMethod === 'ONLINE' && styles.paymentMethodChipTextActive]}>Pay Online</Text>
                                                    </TouchableOpacity>
                                                    */}
                                                    <TouchableOpacity 
                                                        style={[styles.paymentMethodChip, paymentMethod === 'COD' && styles.paymentMethodChipActive]}
                                                        onPress={() => setPaymentMethod('COD')}
                                                    >
                                                        <Icon name="cash-outline" size={16} color={paymentMethod === 'COD' ? COLORS.white : COLORS.primary} />
                                                        <Text style={[styles.paymentMethodChipText, paymentMethod === 'COD' && styles.paymentMethodChipTextActive]}>COD (Cash)</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Live Riders Map (Between Payment Selection and Delivery Info) */}
                                            <View style={{
                                                marginTop: 15,
                                                paddingTop: 15,
                                                borderTopWidth: 1,
                                                borderTopColor: COLORS.lightGray
                                            }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                                    <Text style={{ fontSize: SIZES.small, fontWeight: '600', color: COLORS.textSecondary }}>
                                                        Riders Nearby (Within 2 km):
                                                    </Text>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: nearbyRiders.length > 0 ? '#E8F5E9' : '#FFEBEE',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 3,
                                                        borderRadius: 12,
                                                        gap: 4
                                                    }}>
                                                        <View style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: nearbyRiders.length > 0 ? '#4CAF50' : '#F44336'
                                                        }} />
                                                        <Text style={{
                                                            color: nearbyRiders.length > 0 ? '#2E7D32' : '#C62828',
                                                            fontSize: 9,
                                                            fontWeight: '800'
                                                        }}>
                                                            {nearbyRiders.length > 0 ? `${nearbyRiders.length} ONLINE` : 'NO RIDERS'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {locationData && (
                                                    <View style={{
                                                        width: '100%',
                                                        height: 220,
                                                        borderRadius: 12,
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        backgroundColor: '#E5E5E5',
                                                        borderWidth: 1,
                                                        borderColor: COLORS.lightGray
                                                    }}>
                                                        {/* Static Map Background */}
                                                        <Image
                                                            source={{ uri: staticMapUrl }}
                                                            style={{ width: '100%', height: '100%' }}
                                                            resizeMode="cover"
                                                        />

                                                        {/* Customer Center Dot */}
                                                        <View style={{
                                                            position: 'absolute',
                                                            left: ((SCREEN_WIDTH - 60) / 2) - 15,
                                                            top: (220 / 2) - 15,
                                                            alignItems: 'center',
                                                            zIndex: 5
                                                        }}>
                                                            <View style={{
                                                                width: 30,
                                                                height: 30,
                                                                borderRadius: 15,
                                                                backgroundColor: COLORS.primary + '30',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}>
                                                                <View style={{
                                                                    width: 16,
                                                                    height: 16,
                                                                    borderRadius: 8,
                                                                    backgroundColor: COLORS.primary,
                                                                    borderWidth: 2,
                                                                    borderColor: '#fff',
                                                                    shadowColor: '#000',
                                                                    shadowOffset: { width: 0, height: 1 },
                                                                    shadowOpacity: 0.3,
                                                                    shadowRadius: 1,
                                                                    elevation: 3
                                                                }} />
                                                            </View>
                                                        </View>

                                                        {/* Online Riders Markers */}
                                                        {nearbyRiders.map((rider, idx) => {
                                                            const MAP_WIDTH = SCREEN_WIDTH - 60;
                                                            const MAP_HEIGHT = 220;
                                                            const latRad = (locationData.latitude * Math.PI) / 180;
                                                            const scale = (156543.03392 * Math.cos(latRad)) / Math.pow(2, 12);

                                                            const dx = (rider.lng - locationData.longitude) * Math.cos(latRad) * 111320;
                                                            const dy = (rider.lat - locationData.latitude) * 110540;

                                                            const px = dx / scale;
                                                            const py = -dy / scale;

                                                            const left = (MAP_WIDTH / 2) + px;
                                                            const top = (MAP_HEIGHT / 2) + py;
                                                            const markerSize = 40;

                                                            // Skip rendering if marker lies outside boundaries
                                                            if (left < 20 || left > MAP_WIDTH - 20 || top < 20 || top > MAP_HEIGHT - 20) {
                                                                return null;
                                                            }

                                                            return (
                                                                <View key={rider.employeeId} style={{
                                                                    position: 'absolute',
                                                                    left: left - (markerSize / 2),
                                                                    top: top - (markerSize / 2) - 12,
                                                                    alignItems: 'center',
                                                                    zIndex: 10 + idx
                                                                }}>
                                                                    {/* Name Label */}
                                                                    <View style={{
                                                                        backgroundColor: 'rgba(0,0,0,0.75)',
                                                                        paddingHorizontal: 5,
                                                                        paddingVertical: 1,
                                                                        borderRadius: 3,
                                                                        marginBottom: 2
                                                                    }}>
                                                                        <Text style={{ color: '#fff', fontSize: 7, fontWeight: '700' }} numberOfLines={1}>
                                                                            {rider.employeeName}
                                                                        </Text>
                                                                    </View>

                                                                    {/* Selfie Photo */}
                                                                    <View style={{
                                                                        width: markerSize,
                                                                        height: markerSize,
                                                                        borderRadius: markerSize / 2,
                                                                        borderWidth: 2,
                                                                        borderColor: '#FFB300',
                                                                        backgroundColor: '#fff',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        shadowColor: '#000',
                                                                        shadowOffset: { width: 0, height: 1.5 },
                                                                        shadowOpacity: 0.25,
                                                                        shadowRadius: 1.5,
                                                                        elevation: 3,
                                                                        position: 'relative'
                                                                    }}>
                                                                        {rider.selfieUrl ? (
                                                                            <Image
                                                                                source={{ uri: rider.selfieUrl }}
                                                                                style={{
                                                                                    width: markerSize - 4,
                                                                                    height: markerSize - 4,
                                                                                    borderRadius: (markerSize - 4) / 2
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Icon name="person" size={16} color="#FFB300" />
                                                                        )}

                                                                        {/* Green Online Dot */}
                                                                        <View style={{
                                                                            position: 'absolute',
                                                                            bottom: 0,
                                                                            right: 0,
                                                                            width: 9,
                                                                            height: 9,
                                                                            borderRadius: 4.5,
                                                                            backgroundColor: '#4CAF50',
                                                                            borderWidth: 1,
                                                                            borderColor: '#fff'
                                                                        }} />
                                                                    </View>
                                                                </View>
                                                            );
                                                        })}
                                                    </View>
                                                )}
                                            </View>

                                            {/* Direct Razorpay Secure Payment */}
                                        </ScrollView>

                                        <View style={styles.confirmFooter}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.confirmButton,
                                                    (isFetchingInfo || nearbyRiders.length === 0 || !paymentMethod) && { backgroundColor: COLORS.mediumGray, opacity: 0.7 }
                                                ]}
                                                onPress={finalizeOrder}
                                                disabled={isFetchingInfo || nearbyRiders.length === 0 || !paymentMethod}
                                            >
                                                {isFetchingInfo ? (
                                                    <ActivityIndicator color={COLORS.white} />
                                                ) : nearbyRiders.length === 0 ? (
                                                    <>
                                                        <Text style={styles.confirmButtonText}>No Riders Nearby (Min 2km)</Text>
                                                        <Icon name="alert-circle-outline" size={20} color={COLORS.white} />
                                                    </>
                                                ) : !paymentMethod ? (
                                                    <>
                                                        <Text style={styles.confirmButtonText}>Select Payment Method</Text>
                                                        <Icon name="wallet-outline" size={20} color={COLORS.white} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Text style={styles.confirmButtonText}>Place Order Now</Text>
                                                        <Icon name="checkmark-circle" size={20} color={COLORS.white} />
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                );
                            })()}
                        </View>
                    )}
                </Animatable.View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} translucent />

            {/* Header */}
            <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 20 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => cartItems.length > 0 && clearCart()}>
                    <Text style={styles.clearButtonText}>{cartItems.length > 0 ? 'Clear' : ''}</Text>
                </TouchableOpacity>
            </View>

            {cartItems.length > 0 ? (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCartItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Footer / Summary */}
                    <Animatable.View
                        animation="slideInUp"
                        duration={400}
                        style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding + extraBottom }]}
                    >
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Items ({getCartCount()})</Text>
                            <Text style={styles.summaryValue}>₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</Text>
                        </View>
                        {isFreeTeaEligible && cart['item_001'] && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: '#2E7D32', fontWeight: '600' }]}>First Tea Discount</Text>
                                <Text style={[styles.summaryValue, { color: '#2E7D32', fontWeight: '600' }]}>-₹15</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>FREE</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalValue}>₹{getCartTotal()}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.placeOrderButton}
                            onPress={handlePlaceOrder}>
                            <Text style={styles.placeOrderText}>Place Order</Text>
                            <Icon name="arrow-forward" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </Animatable.View>
                </>
            ) : (
                renderEmptyCart()
            )}

            {renderOrderOverlay()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.darkBg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingL,
        borderBottomLeftRadius: SIZES.radiusXL,
        borderBottomRightRadius: SIZES.radiusXL,
    },
    headerTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        paddingHorizontal: 10,
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: SIZES.small,
    },
    listContent: {
        padding: SIZES.padding,
        paddingBottom: 200,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.paddingS,
        marginBottom: SIZES.paddingS,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.lightGray,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    itemRight: {
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    itemTotal: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusXL,
        borderTopRightRadius: SIZES.radiusXL,
        padding: SIZES.padding,
        paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding,
        ...SHADOWS.large,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: SIZES.xxlarge,
        fontWeight: '800',
        color: COLORS.primary,
    },
    placeOrderButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
        marginTop: 20,
        gap: 10,
        ...SHADOWS.medium,
    },
    placeOrderText: {
        color: COLORS.white,
        fontSize: SIZES.large,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingXL,
    },
    emptyIconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.padding,
        paddingHorizontal: SIZES.paddingXL,
        borderRadius: SIZES.radius,
    },
    browseButtonText: {
        color: COLORS.white,
        fontSize: SIZES.medium,
        fontWeight: '600',
    },
    // Overlay Styles
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: SIZES.padding,
    },
    modalContent: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusXL,
        padding: SIZES.padding,
        ...SHADOWS.large,
    },
    fetchingContainer: {
        alignItems: 'center',
        paddingVertical: SIZES.paddingXL,
    },
    lottieAnimation: {
        width: 150,
        height: 150,
    },
    fetchingText: {
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginTop: 20,
        textAlign: 'center',
    },
    cancelButton: {
        marginTop: 30,
        padding: 10,
    },
    cancelButtonText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.medium,
        fontWeight: '500',
    },
    confirmContainer: {
        padding: SIZES.paddingS,
    },
    confirmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    confirmTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    detailsList: {
        marginBottom: 30,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 15,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        fontWeight: '600',
        lineHeight: 22,
    },
    confirmFooter: {
        marginTop: 10,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
        gap: 10,
        ...SHADOWS.medium,
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: SIZES.large,
        fontWeight: '700',
    },
    savedLocationsSelection: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    savedLocationsTitle: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    savedLocationsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    savedLocationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    savedLocationChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    savedLocationChipText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.primary,
    },
    savedLocationChipTextActive: {
        color: COLORS.white,
    },
    paymentMethodSelection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    paymentMethodTitle: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    paymentMethodList: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentMethodChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    paymentMethodChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    paymentMethodChipText: {
        fontSize: SIZES.small + 1,
        fontWeight: '600',
        color: COLORS.primary,
    },
    paymentMethodChipTextActive: {
        color: COLORS.white,
    },
    addLocationPromptCard: {
        backgroundColor: COLORS.primary + '10',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1.5,
        borderColor: COLORS.primary + '30',
        borderStyle: 'dashed',
        marginTop: 10,
        marginBottom: 5,
    },
    addLocationPromptContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addLocationPromptTitle: {
        fontSize: SIZES.regular - 1,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 2,
    },
    addLocationPromptSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
});

export default CartScreen;
