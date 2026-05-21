import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    Platform,
    Linking,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { listenToOrder } from '../../config/firestore';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

const TrackOrderScreen = ({ route, navigation }) => {
    const { order: initialOrder } = route.params;
    const [order, setOrder] = useState(initialOrder);

    const getStatusStep = () => {
        switch (order?.status) {
            case 'placed':
                return 0;
            case 'confirmed':
                return 1;
            case 'delivered':
                return 2;
            default:
                return 0;
        }
    };

    const steps = [
        { label: 'Order Placed', icon: 'receipt-outline' },
        { label: 'Confirmed', icon: 'checkmark-circle-outline' },
        { label: 'Delivered', icon: 'checkmark-done-circle-outline' },
    ];

    useEffect(() => {
        // Firestore real-time listener for this specific order
        const unsubscribe = listenToOrder(
            order.id,
            (updatedOrder) => {
                console.log('TrackOrder updated via Firestore:', updatedOrder.status);
                setOrder(updatedOrder);
            },
            (error) => console.error('Firestore order listen error:', error)
        );

        return () => unsubscribe();
    }, [order.id]);

    const handleCall = (phone) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <SafeAreaView style={styles.headerWrapper}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Track Order</Text>
                        <Text style={styles.orderIdText}>#{order?.id}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCall(order?.employeePhone)}
                        disabled={!order?.employeePhone}
                    >
                        <Icon name="call" size={20} color={order?.employeePhone ? COLORS.primary : COLORS.gray} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Main Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
                {/* ETA Badge - Only show when confirmed or delivered */}
                {order?.status === 'confirmed' ? (
                    <View style={styles.etaHeader}>
                        <Icon name="time-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.etaTextHeader}>Estimated Delivery: 8-10 mins</Text>
                    </View>
                ) : order?.status === 'delivered' ? (
                    <View style={[styles.etaHeader, { backgroundColor: COLORS.success + '15' }]}>
                        <Icon name="checkmark-done-circle" size={24} color={COLORS.success} />
                        <Text style={[styles.etaTextHeader, { color: COLORS.success }]}>Order Delivered!</Text>
                    </View>
                ) : (
                    <View style={styles.etaHeader}>
                        <Icon name="hourglass-outline" size={24} color={COLORS.secondary} />
                        <Text style={styles.etaTextHeader}>Waiting for confirmation...</Text>
                    </View>
                )}

                <Animatable.View animation="fadeInUp" duration={500} style={styles.mainContent}>
                    {/* Status Timeline */}
                    <View style={styles.timelineContainer}>
                        <Text style={styles.sectionTitle}>Order Status</Text>
                        <View style={styles.timeline}>
                            {steps.map((step, index) => (
                                <View key={index} style={styles.timelineStep}>
                                    <View style={[
                                        styles.timelineIcon,
                                        index <= getStatusStep() && styles.timelineIconActive
                                    ]}>
                                        <Icon
                                            name={step.icon}
                                            size={16}
                                            color={index <= getStatusStep() ? COLORS.white : COLORS.mediumGray}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.timelineLabel,
                                        index <= getStatusStep() && styles.timelineLabelActive
                                    ]}>
                                        {step.label}
                                    </Text>
                                    {index < steps.length - 1 && (
                                        <View style={[
                                            styles.timelineLine,
                                            index < getStatusStep() && styles.timelineLineActive
                                        ]} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Driver Info - Only show when employee is assigned */}
                    {order?.employeeId && (
                        <View style={styles.driverCard}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.driverInitial}>
                                    {order.employeeName?.charAt(0) || 'E'}
                                </Text>
                            </View>
                            <View style={styles.driverInfo}>
                                <Text style={styles.driverName}>{order.employeeName}</Text>
                                <View style={styles.ratingContainer}>
                                    <Icon name="star" size={12} color={COLORS.warning} />
                                    <Text style={styles.ratingText}>4.8</Text>
                                    <Text style={styles.vehicleInfo}>• Thambi Oru Tea Partner</Text>
                                </View>
                            </View>
                            <View style={styles.driverActions}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => handleCall(order.employeePhone)}
                                >
                                    <Icon name="call-outline" size={18} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Order Summary */}
                    <View style={styles.orderSummary}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        {order?.items?.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                            </View>
                        ))}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{order?.totalAmount}</Text>
                        </View>
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.addressCard}>
                        <View style={styles.addressIcon}>
                            <Icon name="location" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.addressContent}>
                            <Text style={styles.addressLabel}>Delivery Address</Text>
                            <Text style={styles.addressText}>
                                {typeof order?.deliveryAddress === 'string' 
                                    ? order.deliveryAddress 
                                    : order?.deliveryAddress?.address || 'Address information unavailable'}
                            </Text>
                        </View>
                    </View>
                </Animatable.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerWrapper: {
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        marginTop: SIZES.padding,
        marginBottom: SIZES.padding,
        paddingHorizontal: SIZES.paddingS,
        paddingVertical: SIZES.paddingS,
        borderRadius: SIZES.radiusLarge,
        ...SHADOWS.medium,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    orderIdText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingBottom: SIZES.paddingXL * 2,
    },
    etaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radiusLarge,
        marginBottom: SIZES.padding,
        gap: 8,
        ...SHADOWS.small,
    },
    etaTextHeader: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    mainContent: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.radiusLarge,
        ...SHADOWS.medium,
    },
    sectionTitle: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SIZES.paddingS,
    },
    timelineContainer: {
        marginBottom: SIZES.padding,
    },
    timeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    timelineStep: {
        alignItems: 'center',
        flex: 1,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    timelineIconActive: {
        backgroundColor: COLORS.primary,
    },
    timelineLabel: {
        fontSize: SIZES.xs,
        color: COLORS.mediumGray,
        textAlign: 'center',
    },
    timelineLabelActive: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    timelineLine: {
        position: 'absolute',
        top: 16,
        right: -10,
        width: 20,
        height: 2,
        backgroundColor: COLORS.lightGray,
    },
    timelineLineActive: {
        backgroundColor: COLORS.primary,
    },
    driverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        padding: SIZES.paddingS,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.padding,
    },
    driverAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.paddingS,
    },
    driverInitial: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.white,
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    ratingText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    vehicleInfo: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    driverActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    orderSummary: {
        marginBottom: SIZES.padding,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.paddingS,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    itemQuantity: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.primary,
        width: 30,
    },
    itemName: {
        flex: 1,
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
    },
    itemPrice: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: SIZES.paddingS,
        marginTop: SIZES.paddingS,
        borderTopWidth: 2,
        borderTopColor: COLORS.lightGray,
    },
    totalLabel: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    totalValue: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addressCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        padding: SIZES.padding,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.paddingXL,
    },
    addressIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.paddingS,
    },
    addressContent: {
        flex: 1,
    },
    addressLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    addressText: {
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
});

export default TrackOrderScreen;
