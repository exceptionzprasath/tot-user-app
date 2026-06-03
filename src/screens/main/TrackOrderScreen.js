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
    const [timeLeft, setTimeLeft] = useState(60);

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

    const isFlaskTea = order?.items?.some(item => 
        (item.name || '').toLowerCase().includes('flask tea')
    );
    const timeoutLimit = isFlaskTea ? 300 : 60;

    useEffect(() => {
        if (order?.status !== 'placed') return;

        // Calculate time elapsed since creation
        const createdTime = new Date(order.createdAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
        const remaining = Math.max(0, timeoutLimit - elapsedSeconds);
        
        setTimeLeft(remaining);

        if (remaining <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [order?.status, order?.createdAt, timeoutLimit]);

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

    if (order?.status === 'unassigned' || order?.status === 'expired') {
        return (
            <SafeAreaView style={styles.apologyContainer}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                <View style={styles.apologyContent}>
                    <Animatable.View animation="bounceIn" duration={1000} style={styles.apologyIconWrapper}>
                        <Icon name="sad-outline" size={72} color={COLORS.secondary} />
                    </Animatable.View>
                    <Animatable.Text animation="fadeInUp" duration={800} delay={300} style={styles.apologyTitle}>
                        Thank you for your interest!
                    </Animatable.Text>
                    <Animatable.Text animation="fadeInUp" duration={800} delay={500} style={styles.apologySub}>
                        We are sorry that our riders are busy right now, so thanks for your understanding.
                    </Animatable.Text>
                    {order?.paymentMode === 'online' && (
                        <Animatable.View 
                            animation="fadeInUp" 
                            duration={800} 
                            delay={600} 
                            style={styles.refundContainer}
                        >
                            <Icon name="cash-outline" size={24} color="#2E7D32" style={styles.refundIcon} />
                            <Text style={styles.refundText}>
                                Refund initiated successfully. Amount will be credited to your original payment method within 2-3 business days.
                            </Text>
                        </Animatable.View>
                    )}
                    <Animatable.View animation="fadeInUp" duration={800} delay={700} style={styles.btnWrapper}>
                        <TouchableOpacity
                            style={styles.apologyButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('MainTabs', { screen: 'Menu' })}
                        >
                            <Text style={styles.apologyButtonText}>Back to Menu</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </SafeAreaView>
        );
    }

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

                {order?.status === 'placed' && (
                    <View style={styles.countdownContainer}>
                        <View style={styles.countdownHeader}>
                            <Text style={styles.countdownLabel}>
                                {timeLeft > 0 
                                    ? isFlaskTea 
                                        ? `Awaiting Corporate approval... ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`
                                        : `Connecting to nearby riders... ${timeLeft}s` 
                                    : isFlaskTea
                                        ? 'Refunding order...'
                                        : 'Assigning rider now...'}
                            </Text>
                            <Icon name="radio-outline" size={18} color={COLORS.secondary} />
                        </View>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${(timeLeft / timeoutLimit) * 100}%` }
                                ]} 
                            />
                        </View>
                        <Text style={styles.countdownHint}>
                            {isFlaskTea 
                                ? 'Corporate Manager is reviewing your premium Flask Tea order (Max 5 mins)'
                                : 'Rider will accept and confirm your delivery in under a minute'}
                        </Text>
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
                                    <Text style={styles.vehicleInfo}>Thambi Oru Tea Partner</Text>
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
    apologyContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    apologyContent: {
        paddingHorizontal: SIZES.paddingXL,
        alignItems: 'center',
        justifyContent: 'center',
    },
    apologyIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.secondary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.paddingXL,
    },
    apologyTitle: {
        fontSize: SIZES.xxlarge,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SIZES.paddingS,
    },
    apologySub: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SIZES.paddingXL,
    },
    btnWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    apologyButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 14,
        paddingHorizontal: SIZES.paddingXL,
        borderRadius: SIZES.radiusLarge,
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 0.8,
        ...SHADOWS.medium,
    },
    apologyButtonText: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    refundContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#2E7D3230',
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.paddingXL,
        width: width * 0.85,
    },
    refundIcon: {
        marginRight: 10,
    },
    refundText: {
        flex: 1,
        fontSize: SIZES.small + 1,
        color: '#2E7D32',
        fontWeight: '600',
        lineHeight: 18,
    },
    countdownContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.padding,
        padding: SIZES.padding,
        borderRadius: SIZES.radiusLarge,
        marginBottom: SIZES.padding,
        ...SHADOWS.small,
    },
    countdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    countdownLabel: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.lightGray,
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.secondary,
        borderRadius: 4,
    },
    countdownHint: {
        fontSize: SIZES.xs,
        color: COLORS.mediumGray,
        marginTop: 6,
        lineHeight: 16,
    },
});

export default TrackOrderScreen;
