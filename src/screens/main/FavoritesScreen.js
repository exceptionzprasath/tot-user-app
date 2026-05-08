import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    Platform,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';
import { getMenuItems } from '../../services/mockMenuService';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const FavoritesScreen = ({ navigation }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { favorites, isFavorite, toggleFavorite } = useFavorites();
    const { cart, addToCart, getCartCount, getCartTotal } = useCart();

    const [allMenuItems, setAllMenuItems] = useState([]);

    useEffect(() => {
        loadFavoriteItems();
    }, [favorites]); // Reload when favorites change

    const loadFavoriteItems = async () => {
        setLoading(true);
        try {
            const response = await getMenuItems(null);
            if (response.success) {
                setAllMenuItems(response.data);
                // Filter only favorited items
                const favoriteItems = response.data.filter(item => favorites.includes(item.id));
                setMenuItems(favoriteItems);
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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 10, paddingBottom: isSearchVisible ? SIZES.padding : SIZES.paddingL }]}>
                {isSearchVisible ? (
                    <Animatable.View animation="fadeInRight" duration={300} style={styles.searchBarWrapper}>
                        <Icon name="search-outline" size={20} color={COLORS.mediumGray} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search favorites..."
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
                            <Text style={styles.headerTitle}>Favorites</Text>
                            <Text style={styles.headerSubtitle}>{menuItems.length} saved items</Text>
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
                            <View style={styles.heartIconWrapper}>
                                <Icon name="heart" size={24} color={COLORS.error} />
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name={searchQuery ? "search-outline" : "heart-dislike-outline"} size={60} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>{searchQuery ? "No items found" : "No Favorites Yet"}</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? "Try searching for something else" : "Like items on the menu to see them here."}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} translucent />

            {loading ? (
                <Loader message="Fetching your favorites..." />
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContent : styles.listContent}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    renderItem={({ item, index }) => (
                        <Animatable.View
                            animation="fadeInUp"
                            delay={index * 50}
                            style={styles.cardWrapper}>
                            <ProductCard
                                item={item}
                                onAddToCart={() => addToCart(item)}
                                quantity={cart[item.id]?.quantity || 0}
                                isFavorite={isFavorite(item.id)}
                                onToggleFavorite={() => toggleFavorite(item.id)}
                            />
                        </Animatable.View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Cart Summary */}
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
    headerContainer: {
        backgroundColor: COLORS.background,
        paddingBottom: SIZES.paddingS,
    },
    header: {
        backgroundColor: COLORS.darkBg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingL,
        borderBottomLeftRadius: SIZES.radiusXL,
        borderBottomRightRadius: SIZES.radiusXL,
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
        gap: 12,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heartIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
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
    listContent: {
        paddingBottom: 100,
    },
    emptyListContent: {
        flexGrow: 1,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: SIZES.paddingXL * 2,
    },
    emptyTitle: {
        fontSize: SIZES.large,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: SIZES.padding,
    },
    emptySubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    cartSummary: {
        position: 'absolute',
        bottom: 20,
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
});

export default FavoritesScreen;
