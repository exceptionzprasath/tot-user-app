import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    Alert,
    Platform,
    TextInput,
    Image,
    Animated,
    PermissionsAndroid,
    Modal,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import LottieView from 'lottie-react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';
import { getMenuItems } from '../../services/mockMenuService';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Added api import here

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
const ITEM_WIDTH = 55;
const getItemLayout = (data, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
});

// Premium Swapping Title Component
const SwappingTitle = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const titles = [
        { main: 'Food', sub: 'Man', logo: require('../../assets/FM-bg.png') },
        { main: 'Thambi Oru', sub: 'Tea', logo: require('../../assets/logo.png') },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -40,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setActiveIndex(prev => (prev + 1) % titles.length);
                slideAnim.setValue(40);
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const current = titles[activeIndex];

    return (
        <View style={swapStyles.container}>
            <Animated.View
                style={[
                    swapStyles.textRow,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: opacityAnim,
                    },
                ]}>
                <Image
                    source={current.logo}
                    style={swapStyles.logo}
                    resizeMode="contain"
                />
                <Text style={swapStyles.mainText}>
                    {current.main}{' '}
                    <Text style={swapStyles.accentText}>
                        {current.sub}
                    </Text>
                </Text>
            </Animated.View>
        </View>
    );
};

const swapStyles = StyleSheet.create({
    container: {
        height: 50,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 12,
        borderRadius: 8,
    },
    mainText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    accentText: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.secondary,
        letterSpacing: 1.2,
    },
});

const banners = [
    { id: 'b1', image: require('../../assets/banner1.jpeg') },
    { id: 'b2', image: require('../../assets/banner2.jpeg') },
    { id: 'b3', image: require('../../assets/banner3.jpeg') },
    { id: 'b4', image: require('../../assets/banner4.jpeg') },
];

const BannerCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const bannerRef = useRef(null);

    useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % banners.length;
            if (bannerRef.current) {
                bannerRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setCurrentIndex(nextIndex);
            }
        }, 3000); // 2 seconds speed

        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <View style={styles.bannersSection}>
            <FlatList
                ref={bannerRef}
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                decelerationRate="fast"
                snapToInterval={width}
                snapToAlignment="start"
                initialNumToRender={banners.length}
                getItemLayout={(data, index) => (
                    { length: width, offset: width * index, index }
                )}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const index = Math.round(x / width);
                    if (index >= 0 && index < banners.length && index !== currentIndex) {
                        setCurrentIndex(index);
                    }
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <View style={styles.bannerContainer}>
                        <Image
                            source={item.image}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>
                )}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        bannerRef.current?.scrollToIndex({ index: info.index, animated: true });
                    }, 500);
                }}
            />
            <View style={styles.bannerPagination}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            currentIndex === index && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'tea', name: 'Tea', icon: 'leaf-outline' },
    // { id: 'snacks', name: 'Snacks', icon: 'fast-food-outline' },
];

const formatLocalDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MenuScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isGridView, setIsGridView] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('Fetching location...');
    const [isLocating, setIsLocating] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { cart, addToCart, removeFromCart, getCartCount, getCartTotal } = useCart();
    const { isFreeTeaEligible, user } = useAuth(); // Added user here
    
        const [locationCoords, setLocationCoords] = useState(null);
        const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
        const [bulkCount, setBulkCount] = useState('0');
        const [bulkLocationAddress, setBulkLocationAddress] = useState('');
        const [bulkCoords, setBulkCoords] = useState(null);

        const flatListRef = useRef(null);
        const countPresets = useMemo(() => [50, 100, 150, 200, 250, 300, 400, 500, 750, 1000], []);
        const countOptions = useMemo(() => Array.from({ length: 951 }, (_, i) => i + 50), []);

        const selectCount = (val) => {
            setBulkCount(val.toString());
            try {
                const targetIndex = val - 50;
                flatListRef.current?.scrollToIndex({
                    index: targetIndex >= 0 ? targetIndex : 0,
                    animated: true,
                    viewPosition: 0.5
                });
            } catch (e) {}
        };
        const [isPlacingBulkOrder, setIsPlacingBulkOrder] = useState(false);
        const [selectedBulkDate, setSelectedBulkDate] = useState('');
        const [selectedBulkTime, setSelectedBulkTime] = useState('11:00 AM');
        const [customBulkTime, setCustomBulkTime] = useState('');
        const [isCalendarVisible, setIsCalendarVisible] = useState(false);
        const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

        const handlePrevMonth = () => {
            setCurrentCalendarMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setMonth(newMonth.getMonth() - 1);
                return newMonth;
            });
        };

        const handleNextMonth = () => {
            setCurrentCalendarMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setMonth(newMonth.getMonth() + 1);
                return newMonth;
            });
        };

        const generateCalendarDays = () => {
            const year = currentCalendarMonth.getFullYear();
            const month = currentCalendarMonth.getMonth();
            const firstDay = new Date(year, month, 1);
            const startDayIndex = firstDay.getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            
            const days = [];
            for (let i = 0; i < startDayIndex; i++) {
                days.push(null);
            }
            for (let d = 1; d <= totalDays; d++) {
                days.push(new Date(year, month, d));
            }
            return days;
        };

        const formatDateString = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${weekdayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        };

        const timeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', 'custom'
        ];

    useEffect(() => {
        requestLocationPermission();
    }, []);

    useEffect(() => {
        loadMenuItems();
    }, [selectedCategory]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                getLocation();
            } else {
                setCurrentLocation('Permission Denied');
            }
        } else {
            getLocation();
        }
    };

    const getLocation = () => {
        if (!Geolocation) {
            Alert.alert(
                'Initialization Error',
                'Geolocation module is not available. Please restart your build (npm run android) to link the new library.'
            );
            setCurrentLocation('Rebuild Required');
            return;
        }

        setIsLocating(true);

        const reverseGeocode = async (latitude, longitude) => {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAs3nkKoCsndZiXeV6oh0PvRLL7FpMiZ4k`
                );
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    setCurrentLocation(data.results[0].formatted_address);
                } else {
                    setCurrentLocation('Unknown Location');
                }
            } catch (error) {
                setCurrentLocation('Failed to get address');
            } finally {
                setIsLocating(false);
            }
        };

        // Try high-accuracy GPS first
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationCoords({ latitude, longitude });
                reverseGeocode(latitude, longitude);
            },
            (error) => {
                console.log('High-accuracy location failed, retrying with low accuracy:', error.code, error.message);
                // Fallback: retry with low accuracy (Wi-Fi/Cell tower) which is much faster on cold start
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocationCoords({ latitude, longitude });
                        reverseGeocode(latitude, longitude);
                    },
                    (fallbackError) => {
                        console.log('Low-accuracy location also failed:', fallbackError.code, fallbackError.message);
                        setCurrentLocation('Location unavailable');
                        setIsLocating(false);
                    },
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const loadMenuItems = async () => {
        setLoading(true);
        try {
            const response = await getMenuItems(selectedCategory === 'all' ? null : selectedCategory);
            if (response.success) {
                setMenuItems(response.data);
            }
        } catch (error) {
            console.error('Error loading menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCheckout = () => {
        navigation.navigate('Cart');
    };

    const handleOpenBulkModal = () => {
        setBulkCount('50');
        setBulkLocationAddress(currentLocation && currentLocation !== 'Fetching location...' && currentLocation !== 'Location unavailable' && currentLocation !== 'Permission Denied' ? currentLocation : '');
        setBulkCoords(locationCoords);
        
        // Default to tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedBulkDate(formatLocalDateToYYYYMMDD(tomorrow));
        setSelectedBulkTime('11:00 AM');
        setCustomBulkTime('');
        
        setIsBulkModalVisible(true);

        // Scroll to index 0 with a slight delay once modal renders
        setTimeout(() => {
            try {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: false,
                    viewPosition: 0.5
                });
            } catch (e) {}
        }, 350);
    };

    const handleFetchBulkLocation = () => {
        if (!Geolocation) {
            Alert.alert('Error', 'Geolocation module is unavailable.');
            return;
        }

        const performFetch = (highAccuracy) => {
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setBulkCoords({ latitude, longitude });
                    try {
                        const response = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAs3nkKoCsndZiXeV6oh0PvRLL7FpMiZ4k`
                        );
                        const data = await response.json();
                        if (data.results && data.results.length > 0) {
                            setBulkLocationAddress(data.results[0].formatted_address);
                        } else {
                            setBulkLocationAddress('GPS Location Coordinates Captured');
                        }
                    } catch (err) {
                        setBulkLocationAddress('GPS Location Coordinates Captured');
                    }
                },
                (error) => {
                    if (highAccuracy) {
                        console.log('Bulk Modal high accuracy fetch failed, retrying low accuracy...');
                        performFetch(false);
                    } else {
                        Alert.alert('Location Error', 'Unable to fetch location. Please type your address manually.');
                    }
                },
                { enableHighAccuracy: highAccuracy, timeout: 8000, maximumAge: 30000 }
            );
        };

        performFetch(true);
    };

    const handlePlaceBulkOrder = async () => {
        const count = parseInt(bulkCount);
        if (!count || count < 50) {
            Alert.alert('Invalid Count', 'Minimum bulk order is 50 teas.');
            return;
        }
        if (!selectedBulkDate) {
            Alert.alert('Date Required', 'Please select a delivery date.');
            return;
        }
        const timeVal = selectedBulkTime === 'custom' ? customBulkTime : selectedBulkTime;
        if (!timeVal || !timeVal.trim()) {
            Alert.alert('Time Required', 'Please select or enter a delivery time.');
            return;
        }
        if (!bulkLocationAddress.trim()) {
            Alert.alert('Location Required', 'Please enter a delivery address.');
            return;
        }

        setIsPlacingBulkOrder(true);

        try {
            const orderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
            const orderData = {
                id: orderId,
                items: [
                    {
                        id: 'item_002',
                        name: 'Tea (Bulk)',
                        price: 13,
                        quantity: count
                    }
                ],
                totalAmount: count * 13,
                deliveryAddress: bulkLocationAddress,
                locationCoords: bulkCoords || { latitude: 0, longitude: 0 },
                customerLocation: {
                    latitude: bulkCoords?.latitude || 0,
                    longitude: bulkCoords?.longitude || 0,
                    address: bulkLocationAddress
                },
                customerName: user?.name || 'Customer',
                customerPhone: user?.phone,
                paymentMethod: 'COD',
                isBulk: true,
                deliveryDate: selectedBulkDate,
                deliveryTime: timeVal
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success) {
                setIsBulkModalVisible(false);
                setBulkCount('');
                setBulkLocationAddress('');
                setBulkCoords(null);
                
                // Navigate to track order
                navigation.navigate('TrackOrder', { order: response.data.order || response.data.data });
            } else {
                Alert.alert('Order Failed', response.data.message || 'Failed to place bulk order.');
            }
        } catch (error) {
            console.error('Error placing bulk order:', error);
            Alert.alert('Network Error', 'Could not reach server. Please try again.');
        } finally {
            setIsPlacingBulkOrder(false);
        }
    };

    const renderLocationBar = () => (
        <TouchableOpacity
            style={styles.locationContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile', { screen: 'SavedLocations' })}
        >
            <View style={styles.locationMain}>
                <View style={styles.locationIconWrapper}>
                    <LottieView
                        source={require('../../assets/location.json')}
                        autoPlay
                        loop
                        style={styles.locationLottie}
                    />
                </View>
                <View style={styles.locationTextContent}>
                    <Text style={styles.locationLabel}>Current Location</Text>
                    <Text style={styles.locationAddress} numberOfLines={1}>
                        {isLocating ? 'Locating...' : currentLocation}
                    </Text>
                </View>
            </View>
            <Icon name="chevron-forward" size={16} color={COLORS.mediumGray} />
        </TouchableOpacity>
    );

    const renderTopBar = () => (
        <View style={styles.topBarWrapper}>
            <View style={[styles.headerRow, { paddingTop: STATUSBAR_HEIGHT + 10 }]}>
                {isSearchVisible ? (
                    <Animatable.View animation="fadeInRight" duration={300} style={styles.searchBarWrapper}>
                        <Icon name="search-outline" size={20} color={COLORS.mediumGray} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search menu items..."
                            placeholderTextColor={COLORS.mediumGray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => {
                            setIsSearchVisible(false);
                            setSearchQuery('');
                        }}>
                            <Icon name="close" size={20} color={COLORS.mediumGray} />
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    <>
                        <View>
                            <SwappingTitle />
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={() => setIsSearchVisible(true)}>
                                <Icon name="search-outline" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cartButton}
                                onPress={() => navigation.navigate('Cart')}>
                                <Icon name="cart-outline" size={22} color={COLORS.white} />
                                {getCartCount() > 0 && (
                                    <View style={styles.headerCartBadge}>
                                        <Text style={styles.headerCartCountText}>{getCartCount()}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    const renderListHeader = () => (
        <View style={styles.headerContainer}>

            {/* Banners Component */}
            <BannerCarousel />

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryItem,
                            selectedCategory === category.id && styles.categoryItemActive,
                        ]}
                        onPress={() => setSelectedCategory(category.id)}>
                        <Icon
                            name={category.icon}
                            size={16}
                            color={selectedCategory === category.id ? COLORS.white : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category.id && styles.categoryTextActive,
                            ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Section Title & View Toggle */}
            <View style={styles.sectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>
                        {searchQuery ? `Search Results for "${searchQuery}"` : (selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.name)}
                    </Text>
                    <Text style={styles.itemCount}>{filteredItems.length} items</Text>
                </View>

                {/* View Toggler */}
                <View style={styles.viewToggler}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, isGridView && styles.toggleBtnActive]}
                        onPress={() => setIsGridView(true)}
                    >
                        <Icon name="grid" size={16} color={isGridView ? COLORS.white : COLORS.mediumGray} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, !isGridView && styles.toggleBtnActive]}
                        onPress={() => setIsGridView(false)}
                    >
                        <Icon name="list" size={16} color={!isGridView ? COLORS.white : COLORS.mediumGray} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="search-outline" size={60} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>Try searching for something else</Text>
        </View>
    );

    const renderListFooter = () => {
        const hasFlaskTea = filteredItems.some(item => item.id === 'item_002');
        if (!hasFlaskTea) return null;

        return (
            <Animatable.View
                animation="fadeInUp"
                delay={100}
                style={styles.bulkSectionCard}
            >
                <View style={styles.bulkSectionHeader}>
                    <Icon name="cube" size={22} color={COLORS.primary} />
                    <Text style={styles.bulkSectionTitle}>Corporate & Event Bulk Orders</Text>
                </View>
                <Text style={styles.bulkSectionDescription}>
                    Hosting an event or meeting? Order tea in bulk (min 50 teas) and select your expected date and time for hot, fresh delivery.
                </Text>
                <TouchableOpacity
                    style={styles.bulkSectionButton}
                    onPress={() => handleOpenBulkModal()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.bulkSectionButtonText}>Order Bulk Tea</Text>
                    <Icon name="calendar-outline" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
            </Animatable.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} translucent />

            {loading ? (
                <Loader message="Brewing your menu..." />
            ) : (
                <>
                    {renderTopBar()}
                    {renderLocationBar()}
                    <FlatList
                        key={isGridView ? 'grid' : 'list'}
                        data={filteredItems}
                        keyExtractor={(item) => item.id}
                        numColumns={isGridView ? 2 : 1}
                        columnWrapperStyle={isGridView ? styles.row : null}
                        contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContent : [styles.listContent, getCartCount() > 0 && { paddingBottom: 180 }]}
                        ListHeaderComponent={renderListHeader}
                        ListEmptyComponent={renderEmpty}
                        ListFooterComponent={renderListFooter}
                        renderItem={({ item, index }) => (
                            <Animatable.View
                                animation="fadeInUp"
                                delay={index * 50}
                                style={isGridView ? styles.cardWrapper : styles.listWrapper}>
                                <ProductCard
                                    item={item}
                                    onAddToCart={() => addToCart(item)}
                                    onRemoveFromCart={() => removeFromCart(item.id)}
                                    quantity={cart[item.id]?.quantity || 0}
                                    isFavorite={isFavorite(item.id)}
                                    onToggleFavorite={() => toggleFavorite(item.id)}
                                    layout={isGridView ? 'grid' : 'list'}
                                    isFreeTeaEligible={isFreeTeaEligible}
                                />
                            </Animatable.View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            {/* Cart Summary commented out as requested */}
            {getCartCount() > 0 && (
                <Animatable.View animation="slideInUp" duration={300} style={styles.cartSummary}>
                    <View style={styles.cartInfo}>
                        <View style={styles.cartBadge}>
                            <Icon name="cart" size={20} color={COLORS.white} />
                            <View style={styles.cartCountBadge}>
                                <Text style={styles.cartCountText}>{getCartCount()}</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.cartLabel}>{getCartCount()} items</Text>
                            <Text style={styles.cartTotal}>₹{getCartTotal()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutText}>Checkout</Text>
                        <Icon name="arrow-forward" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </Animatable.View>
            )}

            {/* Event Bulk Order Modal */}
            <Modal
                visible={isBulkModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsBulkModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🍵 Event Bulk Order</Text>
                            <TouchableOpacity
                                style={styles.closeModalButton}
                                onPress={() => setIsBulkModalVisible(false)}
                            >
                                <Icon name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                            {/* Description */}
                            <Text style={styles.modalDescription}>
                                Order Tea in bulk for your corporate meetings, celebrations or gatherings. Minimum order is 50 teas.
                            </Text>

                            {/* Form Inputs */}
                            <View style={styles.modalForm}>
                                {/* Quantity Selector */}
                                <Text style={styles.inputLabel}>Order Count (Number of Teas)</Text>
                                
                                {/* Quick Presets */}
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {countPresets.map((preset) => {
                                        const isSelected = parseInt(bulkCount) === preset;
                                        return (
                                            <TouchableOpacity
                                                key={preset}
                                                style={{
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? COLORS.primary : COLORS.mediumGray + '35',
                                                    backgroundColor: isSelected ? COLORS.primary + '15' : COLORS.white,
                                                }}
                                                onPress={() => selectCount(preset)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={{
                                                    fontSize: 11,
                                                    fontWeight: '800',
                                                    color: isSelected ? COLORS.primary : COLORS.textSecondary
                                                }}>{preset}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Scroll Wheel FlatList */}
                                <View style={{ 
                                    borderWidth: 1.5, 
                                    borderColor: COLORS.lightGray, 
                                    borderRadius: 12, 
                                    paddingVertical: 10, 
                                    backgroundColor: '#F9F9F9',
                                    marginBottom: 16
                                }}>
                                    <FlatList
                                        ref={flatListRef}
                                        horizontal
                                        data={countOptions}
                                        keyExtractor={(item) => item.toString()}
                                        showsHorizontalScrollIndicator={false}
                                        getItemLayout={getItemLayout}
                                        contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 - 20 }}
                                        renderItem={({ item }) => {
                                            const isSelected = parseInt(bulkCount) === item;
                                            return (
                                                <TouchableOpacity
                                                    style={{
                                                        width: ITEM_WIDTH,
                                                        height: ITEM_WIDTH,
                                                        borderRadius: ITEM_WIDTH / 2,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        backgroundColor: isSelected ? COLORS.primary : 'transparent',
                                                        borderWidth: isSelected ? 0 : 1,
                                                        borderColor: isSelected ? 'transparent' : COLORS.mediumGray + '25',
                                                        marginHorizontal: 4,
                                                    }}
                                                    onPress={() => selectCount(item)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={{
                                                        fontSize: SIZES.regular,
                                                        fontWeight: '800',
                                                        color: isSelected ? COLORS.white : COLORS.textPrimary
                                                    }}>
                                                        {item}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </View>

                                {/* Expected Delivery Date Selector */}
                                <Text style={styles.inputLabel}>Expected Delivery Date</Text>
                                <TouchableOpacity
                                    style={styles.dateSelectorBtn}
                                    onPress={() => setIsCalendarVisible(true)}
                                    activeOpacity={0.8}
                                >
                                    <Icon name="calendar-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                                    <Text style={styles.dateSelectorBtnText}>
                                        {selectedBulkDate ? formatDateString(selectedBulkDate) : 'Select Delivery Date'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Expected Delivery Time Selector */}
                                <Text style={styles.inputLabel}>Expected Delivery Time</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
                                    {timeSlots.map((slot) => {
                                        const isSelected = selectedBulkTime === slot;
                                        return (
                                            <TouchableOpacity
                                                key={slot}
                                                style={[styles.timeChip, isSelected && styles.chipActive]}
                                                onPress={() => setSelectedBulkTime(slot)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.timeChipText, isSelected && styles.chipMainTextActive]}>
                                                    {slot === 'custom' ? 'Custom Time' : slot}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                {selectedBulkTime === 'custom' && (
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="e.g. 10:30 AM, 02:45 PM"
                                        placeholderTextColor={COLORS.mediumGray}
                                        value={customBulkTime}
                                        onChangeText={setCustomBulkTime}
                                    />
                                )}

                                {/* Location Input */}
                                <Text style={styles.inputLabel}>Delivery Location</Text>
                                <View style={styles.locationInputContainer}>
                                    <TextInput
                                        style={[styles.textInput, styles.locationInput]}
                                        placeholder="Enter complete delivery address"
                                        placeholderTextColor={COLORS.mediumGray}
                                        multiline
                                        numberOfLines={3}
                                        value={bulkLocationAddress}
                                        onChangeText={setBulkLocationAddress}
                                    />
                                    <TouchableOpacity
                                        style={styles.gpsButton}
                                        onPress={handleFetchBulkLocation}
                                        activeOpacity={0.7}
                                    >
                                        <Icon name="locate" size={20} color={COLORS.primary} />
                                        <Text style={styles.gpsButtonText}>Use GPS Location</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Cost & Summary */}
                            <View style={styles.modalCostContainer}>
                                <Text style={styles.costLabel}>Price per tea:</Text>
                                <Text style={styles.costValue}>₹13 / tea</Text>
                            </View>
                            <View style={[styles.modalCostContainer, { borderTopWidth: 1, borderTopColor: COLORS.lightGray, paddingTop: 10 }]}>
                                <Text style={styles.totalLabel}>Total Estimated Cost:</Text>
                                <Text style={styles.totalValue}>₹{(parseInt(bulkCount) || 0) * 13}</Text>
                            </View>
                        </ScrollView>

                        {/* Order Now Button */}
                        <TouchableOpacity
                            style={[
                                styles.orderNowButton,
                                (!bulkCount || parseInt(bulkCount) < 50 || !bulkLocationAddress.trim() || isPlacingBulkOrder) && styles.orderNowButtonDisabled
                            ]}
                            onPress={handlePlaceBulkOrder}
                            disabled={!bulkCount || parseInt(bulkCount) < 50 || !bulkLocationAddress.trim() || isPlacingBulkOrder}
                            activeOpacity={0.8}
                        >
                            {isPlacingBulkOrder ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.orderNowButtonText}>Order Now</Text>
                                    <Icon name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Calendar Modal */}
            <Modal
                visible={isCalendarVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsCalendarVisible(false)}
            >
                <View style={styles.calendarModalOverlay}>
                    <View style={styles.calendarModalContent}>
                        {/* Header */}
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarNavBtn}>
                                <Icon name="chevron-back" size={20} color={COLORS.textPrimary} style={{ marginTop: Platform.OS === 'ios' ? 0 : 0 }} />
                            </TouchableOpacity>
                            <Text style={styles.calendarMonthTitle}>
                                {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Text>
                            <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavBtn}>
                                <Icon name="chevron-forward" size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Weekdays Row */}
                        <View style={styles.calendarWeekdaysRow}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <Text key={idx} style={styles.calendarWeekdayText}>{day}</Text>
                            ))}
                        </View>

                        {/* Days Grid */}
                        <View style={styles.calendarDaysGrid}>
                            {generateCalendarDays().map((dayObj, index) => {
                                if (!dayObj) {
                                    return <View key={`empty-${index}`} style={styles.calendarDayCellEmpty} />;
                                }
                                
                                const isToday = new Date().toDateString() === dayObj.toDateString();
                                const isSelected = selectedBulkDate === formatLocalDateToYYYYMMDD(dayObj);
                                
                                // Disable past days
                                const todayDate = new Date();
                                todayDate.setHours(0,0,0,0);
                                const isPast = dayObj < todayDate;
                                
                                return (
                                    <TouchableOpacity
                                        key={dayObj.toISOString()}
                                        style={[
                                            styles.calendarDayCell,
                                            isSelected && styles.calendarDayCellSelected,
                                            isToday && !isSelected && styles.calendarDayCellToday,
                                            isPast && styles.calendarDayCellDisabled
                                        ]}
                                        disabled={isPast}
                                        onPress={() => {
                                            setSelectedBulkDate(formatLocalDateToYYYYMMDD(dayObj));
                                            setIsCalendarVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.calendarDayText,
                                            isSelected && styles.calendarDayTextSelected,
                                            isPast && styles.calendarDayTextDisabled,
                                            isToday && !isSelected && styles.calendarDayTextToday
                                        ]}>
                                            {dayObj.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.calendarCloseBtn}
                            onPress={() => setIsCalendarVisible(false)}
                        >
                            <Text style={styles.calendarCloseBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SIZES.padding,
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
    },
    headerContainer: {
        backgroundColor: COLORS.background,
        paddingBottom: SIZES.paddingS,
    },
    topBarWrapper: {
        backgroundColor: COLORS.darkBg,
        paddingBottom: SIZES.paddingL + 5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingS,
    },
    headerTitle: {
        fontSize: SIZES.xxlarge,
        fontWeight: '700',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    headerCartBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: COLORS.secondary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.darkBg,
    },
    headerCartCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    searchBarWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLarge,
        paddingHorizontal: SIZES.padding,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        height: '100%',
        padding: 0,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: SIZES.padding,
    },
    emptySubtitle: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    bannersSection: {
        width: width,
        height: 180,
        marginVertical: SIZES.paddingS,
    },
    bannerContainer: {
        width: width,
        height: 180,
        paddingHorizontal: SIZES.padding,
    },
    bannerImage: {
        width: width - SIZES.padding * 2,
        height: '100%',
        borderRadius: SIZES.radiusLarge,
    },
    bannerPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        width: '100%',
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        backgroundColor: COLORS.white,
        width: 12,
    },
    categoriesContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding,
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingS + 4,
        paddingVertical: SIZES.paddingS,
        borderRadius: SIZES.radiusLarge,
        backgroundColor: COLORS.white,
        gap: 4,
        ...SHADOWS.small,
    },
    categoryItemActive: {
        backgroundColor: COLORS.primary,
    },
    categoryText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryTextActive: {
        color: COLORS.white,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.paddingS,
    },
    sectionTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    itemCount: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    listContent: {
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginTop: SIZES.paddingS,
    },
    cardWrapper: {
        width: (width - SIZES.padding * 2 - SIZES.paddingS) / 2,
    },
    listWrapper: {
        width: width - SIZES.padding * 2,
        marginHorizontal: SIZES.padding,
    },
    viewToggler: {
        flexDirection: 'row',
        backgroundColor: COLORS.offWhite,
        borderRadius: SIZES.radius + 4,
        padding: 4,
        gap: 4,
    },
    toggleBtn: {
        width: 32,
        height: 32,
        borderRadius: SIZES.radius,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleBtnActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.small,
    },
    cartSummary: {
        position: 'absolute',
        bottom: 100,
        left: SIZES.padding,
        right: SIZES.padding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.paddingS,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.radiusLarge,
        ...SHADOWS.large,
    },
    cartInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cartBadge: {
        position: 'relative',
    },
    cartCountBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.secondary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    cartLabel: {
        fontSize: SIZES.small,
        color: 'rgba(255,255,255,0.7)',
    },
    cartTotal: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.white,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: SIZES.paddingS,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.radius,
        gap: 6,
    },
    checkoutText: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.white,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.padding,
        paddingVertical: 12,
        marginHorizontal: SIZES.padding,
        marginTop: -25,
        marginBottom: 5,
        borderRadius: SIZES.radiusLarge,
        ...SHADOWS.medium,
        zIndex: 10,
        elevation: 10,
    },
    locationMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationIconWrapper: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    locationLottie: {
        width: 32,
        height: 32,
    },
    locationTextContent: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.mediumGray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationAddress: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusLarge * 1.5,
        borderTopRightRadius: SIZES.radiusLarge * 1.5,
        padding: SIZES.padding,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    closeModalButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalDescription: {
        fontSize: SIZES.small + 1,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 20,
    },
    modalForm: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        padding: SIZES.paddingS * 1.5,
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.gray,
        marginBottom: 16,
    },
    locationInputContainer: {
        flexDirection: 'column',
    },
    locationInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '0A',
    },
    gpsButtonText: {
        marginLeft: 6,
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: SIZES.medium,
    },
    modalCostContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    costLabel: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
    },
    costValue: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalLabel: {
        fontSize: SIZES.regular,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: SIZES.xlarge,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderNowButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: SIZES.radius,
        marginTop: 20,
        ...SHADOWS.medium,
    },
    orderNowButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    orderNowButtonText: {
        color: COLORS.white,
        fontSize: SIZES.regular,
        fontWeight: 'bold',
    },
    bulkSectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginHorizontal: SIZES.padding,
        marginBottom: SIZES.paddingS,
        marginTop: 4,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        ...SHADOWS.small,
    },
    bulkSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    bulkSectionTitle: {
        fontSize: SIZES.medium + 1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    bulkSectionDescription: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 12,
    },
    bulkSectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        ...SHADOWS.small,
    },
    bulkSectionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: SIZES.small + 1,
    },
    chipsContainer: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    chip: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.gray,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipMainText: {
        fontSize: SIZES.small + 1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    chipMainTextActive: {
        color: COLORS.white,
    },
    chipSubText: {
        fontSize: SIZES.xs,
        color: COLORS.mediumGray,
        textTransform: 'uppercase',
    },
    chipSubTextActive: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    timeChip: {
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.gray,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeChipText: {
        fontSize: SIZES.small + 1,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    dateSelectorBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.gray,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    dateSelectorBtnText: {
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    calendarModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    calendarModalContent: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLarge,
        padding: 20,
        width: '100%',
        maxWidth: 340,
        ...SHADOWS.large,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    calendarMonthTitle: {
        fontSize: SIZES.medium + 1,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    calendarNavBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarWeekdaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    calendarWeekdayText: {
        width: 38,
        textAlign: 'center',
        fontSize: SIZES.small,
        fontWeight: 'bold',
        color: COLORS.mediumGray,
    },
    calendarDaysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 4,
    },
    calendarDayCell: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 19,
        marginBottom: 4,
    },
    calendarDayCellEmpty: {
        width: 38,
        height: 38,
        marginBottom: 4,
    },
    calendarDayCellSelected: {
        backgroundColor: COLORS.primary,
    },
    calendarDayCellToday: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    calendarDayCellDisabled: {
        opacity: 0.3,
    },
    calendarDayText: {
        fontSize: SIZES.small + 1,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    calendarDayTextSelected: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    calendarDayTextToday: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    calendarDayTextDisabled: {
        color: COLORS.mediumGray,
    },
    calendarCloseBtn: {
        marginTop: 15,
        backgroundColor: COLORS.lightGray,
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        alignItems: 'center',
    },
    calendarCloseBtnText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: SIZES.regular,
    },
});

export default MenuScreen;
