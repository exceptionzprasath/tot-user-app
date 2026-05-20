import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const OrdersScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async (isRefreshing = false) => {
        if (!user?.phone) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await api.get(`/orders/customer/${user.phone}`);
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.phone]);

    useEffect(() => {
        fetchOrders();
        
        // Refresh when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders();
        });

        return unsubscribe;
    }, [fetchOrders, navigation]);

    const onRefresh = () => {
        fetchOrders(true);
    };

    const activeOrders = orders.filter(
        (order) => ['placed', 'confirmed'].includes(order.status)
    );
    const historyOrders = orders.filter(
        (order) => ['delivered', 'cancelled'].includes(order.status)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'placed':
                return COLORS.warning;
            case 'confirmed':
                return COLORS.info;
            case 'delivered':
                return COLORS.success;
            case 'cancelled':
                return COLORS.error;
            default:
                return COLORS.mediumGray;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'placed':
                return 'time-outline';
            case 'confirmed':
                return 'checkmark-circle-outline';
            case 'delivered':
                return 'checkmark-done-circle-outline';
            case 'cancelled':
                return 'close-circle-outline';
            default:
                return 'ellipse-outline';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'placed': return 'ORDER PLACED';
            case 'confirmed': return 'CONFIRMED';
            case 'delivered': return 'DELIVERED';
            case 'cancelled': return 'CANCELLED';
            default: return status.toUpperCase().replace('_', ' ');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderOrderCard = ({ item, index }) => (
        <Animatable.View animation="fadeInUp" delay={index * 100}>
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => {
                    if (['placed', 'confirmed'].includes(item.status)) {
                        navigation.navigate('TrackOrder', { order: item });
                    }
                }}>

                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Icon name="receipt-outline" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.orderId}>#{item.id}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                        <Icon name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.orderItems}>
                    {item.items?.slice(0, 3).map((orderItem, i) => (
                        <View key={i} style={styles.itemRow}>
                            <View style={styles.itemDot} />
                            <Text style={styles.itemText} numberOfLines={1}>
                                {orderItem.quantity}x {orderItem.name || orderItem.title}
                            </Text>
                        </View>
                    ))}
                    {(item.items?.length || 0) > 3 && (
                        <Text style={styles.moreItems}>+{(item.items?.length || 0) - 3} more items</Text>
                    )}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                    <View style={styles.dateContainer}>
                        <Icon name="calendar-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                    </View>
                </View>

                {/* Track Button for active orders */}
                {['placed', 'confirmed'].includes(item.status) && (
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => navigation.navigate('TrackOrder', { order: item })}>
                        <Icon name="navigate" size={16} color={COLORS.white} />
                        <Text style={styles.trackButtonText}>Track Order</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </Animatable.View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <Icon name="receipt-outline" size={48} color={COLORS.mediumGray} />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
                {activeTab === 'active'
                    ? 'You have no active orders at the moment'
                    : 'Your order history will appear here'}
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Menu')}>
                <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} translucent />

            {/* Header */}
            <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 20 }]}>
                <View>
                    <Text style={styles.headerTitle}>Orders</Text>
                    <Text style={styles.headerSubtitle}>Track your orders</Text>
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={onRefresh}>
                    {refreshing ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                        <Icon name="refresh-outline" size={20} color={COLORS.white} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.tabActive]}
                    onPress={() => setActiveTab('active')}>
                    <Icon
                        name="time-outline"
                        size={16}
                        color={activeTab === 'active' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                        Active
                    </Text>
                    {activeOrders.length > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                    onPress={() => setActiveTab('history')}>
                    <Icon
                        name="checkmark-done-outline"
                        size={16}
                        color={activeTab === 'history' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Order List */}
            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading orders...</Text>
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'active' ? activeOrders : historyOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                />
            )}
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
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: SIZES.padding,
        marginTop: SIZES.padding,
        marginBottom: SIZES.paddingS,
        backgroundColor: COLORS.lightGray,
        borderRadius: SIZES.radiusLarge,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.paddingS + 2,
        borderRadius: SIZES.radiusLarge - 4,
        gap: 8,
    },
    tabActive: {
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#4CAF50', // Green border for active tab
        ...SHADOWS.small,
    },
    tabText: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    tabBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.white,
    },
    listContent: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.paddingS,
        ...SHADOWS.small,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.paddingS,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderId: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingS,
        paddingVertical: 4,
        borderRadius: SIZES.radius,
        gap: 4,
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '700',
    },
    orderItems: {
        paddingVertical: SIZES.paddingS,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.lightGray,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    itemDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.mediumGray,
    },
    itemText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        flex: 1,
    },
    moreItems: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        marginTop: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.paddingS,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    totalLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    totalAmount: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.paddingS,
        borderRadius: SIZES.radius,
        marginTop: SIZES.paddingS,
        gap: 8,
    },
    trackButtonText: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.white,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.paddingXL * 2,
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.padding,
    },
    emptyTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SIZES.paddingL,
    },
    browseButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.paddingS,
        paddingHorizontal: SIZES.paddingL,
        borderRadius: SIZES.radius,
    },
    browseButtonText: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.white,
    },
});

export default OrdersScreen;
