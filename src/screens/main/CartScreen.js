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

const CartScreen = ({ navigation }) => {
    const { cart, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount } = useCart();
    const { savedLocations } = useLocation();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const extraBottom = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 15 : 0);
    const cartItems = Object.values(cart);

    // Ordering States
    const [isOrdering, setIsOrdering] = React.useState(false);
    const [orderStep, setOrderStep] = React.useState('fetching'); // 'fetching' | 'confirm'
    const [locationData, setLocationData] = React.useState(null);
    const [readableAddress, setReadableAddress] = React.useState('');
    const [isFetchingInfo, setIsFetchingInfo] = React.useState(false);

    // Razorpay / Payment States
    const [pendingOrderId, setPendingOrderId] = React.useState(null);
    const [paymentStatus, setPaymentStatus] = React.useState('none'); // 'none' | 'initiating' | 'waiting' | 'failed'
    const [checkoutUrl, setCheckoutUrl] = React.useState('');

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
                    navigation.navigate('TrackOrder', { order: updatedOrder });
                }
            },
            (error) => console.error('Firestore order payment listen error:', error)
        );

        return () => {
            if (unsubscribe) unsubscribe();
        };
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

        setIsOrdering(true);
        setOrderStep('fetching');
        setReadableAddress('');

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location permission is required to place an order.');
            setIsOrdering(false);
            return;
        }

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocationData({ latitude, longitude });
                
                // Fetch readable address
                const address = await getAddressFromCoords(latitude, longitude);
                setReadableAddress(address);
                setOrderStep('confirm');
            },
            (error) => {
                console.error(error);
                Alert.alert('Location Error', 'Failed to get your current location. Please try again.');
                setIsOrdering(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
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
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success && response.data.pendingPayment) {
                const { orderId, checkoutUrl: url } = response.data;
                setPendingOrderId(orderId);
                setCheckoutUrl(url);
                setPaymentStatus('waiting');
                
                // Open the checkout page in the mobile browser
                Linking.openURL(url);
            } else {
                setPaymentStatus('none');
                Alert.alert('Error', response.data.message || 'Failed to initiate payment');
            }
        } catch (error) {
            console.error('Finalize Order Error:', error);
            setPaymentStatus('none');
            Alert.alert('Error', 'Connection failed. Please try again.');
        } finally {
            setIsFetchingInfo(false);
        }
    };

    const renderCartItem = ({ item, index }) => (
        <Animatable.View animation="fadeInRight" delay={index * 100} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
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
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                <TouchableOpacity onPress={() => {
                    // Logic to fully remove item if needed, but removeFromCart(id) 
                    // handles decrementing. Let's add a clear item function to context later
                    // For now, let's just use the decrement
                }}>
                </TouchableOpacity>
            </View>
        </Animatable.View>
    );

    const renderEmptyCart = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="cart-outline" size={80} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>Add some delicious tea and snacks to get started!</Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Menu')}>
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

                            <View style={styles.detailsList}>
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

                                {savedLocations.length > 0 && (
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
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View style={styles.confirmFooter}>
                                <TouchableOpacity
                                    style={[styles.confirmButton, isFetchingInfo && { opacity: 0.7 }]}
                                    onPress={finalizeOrder}
                                    disabled={isFetchingInfo}
                                >
                                    {isFetchingInfo ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <>
                                            <Text style={styles.confirmButtonText}>Place Order Now</Text>
                                            <Icon name="checkmark-circle" size={20} color={COLORS.white} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
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
                            <Text style={styles.summaryValue}>₹{getCartTotal()}</Text>
                        </View>
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
});

export default CartScreen;
