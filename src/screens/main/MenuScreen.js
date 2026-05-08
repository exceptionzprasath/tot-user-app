import React, { useState, useEffect, useRef } from 'react';
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

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

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

const MenuScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [currentLocation, setCurrentLocation] = useState('Fetching location...');
    const [isLocating, setIsLocating] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { cart, addToCart, removeFromCart, getCartCount, getCartTotal } = useCart();

    useEffect(() => {
        loadMenuItems();
        requestLocationPermission();
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
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
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
            },
            (error) => {
                console.log(error.code, error.message);
                setCurrentLocation('Location error');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
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

    const renderLocationBar = () => (
        <TouchableOpacity
            style={styles.locationContainer}
            activeOpacity={0.8}
            onPress={getLocation}
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
                        contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContent : styles.listContent}
                        ListHeaderComponent={renderListHeader}
                        ListEmptyComponent={renderEmpty}
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
                                />
                            </Animatable.View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            {/* Cart Summary commented out as requested */}
            {/* {getCartCount() > 0 && (
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
            )} */}
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
});

export default MenuScreen;
