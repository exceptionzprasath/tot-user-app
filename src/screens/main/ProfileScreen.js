import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform,
    Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ActivityIndicator, TextInput } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const { logout, user: contextUser, updateUser } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Use user from context or fall back to a safe empty object
    const userData = contextUser || {};
    const displayName = userData.name || 'User';
    const displayPhone = userData.phone || 'No phone';

    useEffect(() => {
        setTempName(displayName);
    }, [displayName]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const value = await AsyncStorage.getItem('notifications_enabled');
            if (value !== null) {
                setNotificationsEnabled(JSON.parse(value));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const toggleNotifications = async (value) => {
        setNotificationsEnabled(value);
        try {
            await AsyncStorage.setItem('notifications_enabled', JSON.stringify(value));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const saveProfile = async () => {
        if (!tempName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.patch('/auth/profile', {
                phone: displayPhone,
                name: tempName.trim()
            });

            if (response.data.success) {
                await updateUser({ name: tempName.trim() });
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update Profile Error:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const showHelpSupport = () => {
        Alert.alert(
            'Help & Support',
            `Mobile - 0424-7167303\n\nBuilding No./Flat No.: S.NO - 34 , D.NO - 47A\nRoad/Street: CHINNAMUTHU MAIN STREET\nCity/Town/Village: Erode\nDistrict: Erode\nState: Tamil Nadu\nPIN Code: 638011`,
            [{ text: 'Close', style: 'default' }]
        );
    };

    const showAboutUs = () => {
        Alert.alert(
            'About Us',
            `Welcome to Food Man – Thambi Oru Tea!\n\nWe are dedicated to delivering fresh, hot, and high-quality tea and snacks right to your doorstep. Our mission is to make your tea time simple, quick, and enjoyable through a smooth online ordering experience.\n\nWith a focus on taste, hygiene, and timely delivery, we bring your favorite tea just a few clicks away.\n\nEnjoy your tea, anytime, anywhere with Food Man ☕`,
            [{ text: 'Close', style: 'default' }]
        );
    };

    const MenuItem = ({ icon, title, subtitle, onPress, showBorder = true, rightElement }) => (
        <TouchableOpacity
            style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}>
            <View style={styles.menuIconContainer}>
                <Icon name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement ? rightElement : <Icon name="chevron-forward" size={18} color={COLORS.mediumGray} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} translucent />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 20 }]}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.brandName}>THAMBI ORU TEA</Text>
                            <View style={styles.taglineRow}>
                                <View style={styles.taglineLine} />
                                <Text style={styles.tagline}>authentic taste</Text>
                                <View style={styles.taglineLine} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.sectionLabel}>Account Info</Text>

                        <View style={styles.profileRow}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.nameInput}
                                        value={tempName}
                                        onChangeText={setTempName}
                                        autoFocus
                                        placeholder="Enter your name"
                                    />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <Text style={styles.profileName}>{displayName}</Text>
                                        {/* Comment out verification badge temporarily
                                        userData.isVerified ? (
                                            <View style={styles.verifiedBadge}>
                                                <Icon name="checkmark-circle" size={12} color="#2E7D32" />
                                                <Text style={styles.verifiedText}>Verified</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.unverifiedBadge}>
                                                <Icon name="close-circle" size={12} color="#C62828" />
                                                <Text style={styles.unverifiedText}>Not Verified</Text>
                                            </View>
                                        )
                                        */}
                                    </View>
                                )}
                                <View style={styles.phoneRow}>
                                    <Icon name="call-outline" size={14} color={COLORS.mediumGray} />
                                    <Text style={styles.profilePhone}>{displayPhone}</Text>
                                </View>
                            </View>
                            {isEditing ? (
                                <View style={styles.editActions}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.saveBtn]}
                                        onPress={saveProfile}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator size="small" color={COLORS.white} />
                                        ) : (
                                            <Icon name="checkmark" size={20} color={COLORS.white} />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.cancelBtn]}
                                        onPress={() => setIsEditing(false)}
                                        disabled={isSaving}
                                    >
                                        <Icon name="close" size={20} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <Icon name="create-outline" size={18} color={COLORS.primary} />
                                    <Text style={styles.editText}>Edit</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Quick Stats - Commented for now as requested */}
                    {/* 
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Icon name="receipt-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.statValue}>12</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="star-outline" size={24} color={COLORS.secondary} />
                            <Text style={styles.statValue}>4.8</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="gift-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.statValue}>3</Text>
                            <Text style={styles.statLabel}>Rewards</Text>
                        </View>
                    </View> 
                    */}

                    {/* Menu Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>My Orders</Text>
                        <View style={styles.menuContainer}>
                            <MenuItem
                                icon="receipt-outline"
                                title="Order History"
                                onPress={() => navigation.navigate('Orders')}
                            />
                            <MenuItem
                                icon="location-outline"
                                title="Saved Locations"
                                onPress={() => navigation.navigate('SavedLocations')}
                            />
                            <MenuItem
                                icon="heart-outline"
                                title="Favorites"
                                onPress={() => navigation.navigate('Favorites')}
                                showBorder={false}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Settings</Text>
                        <View style={styles.menuContainer}>
                            {/* <MenuItem
                                icon="notifications-outline"
                                title="Notifications"
                                showBorder={false}
                                rightElement={
                                    <Switch
                                        value={notificationsEnabled}
                                        onValueChange={toggleNotifications}
                                        trackColor={{ false: COLORS.mediumGray, true: COLORS.primary + '80' }}
                                        thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray}
                                    />
                                }
                            /> */}
                            <MenuItem
                                icon="help-circle-outline"
                                title="Help & Support"
                                onPress={showHelpSupport}
                                showBorder={false}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <View style={styles.menuContainer}>
                            <MenuItem
                                icon="information-circle-outline"
                                title="About Us"
                                onPress={showAboutUs}
                            />
                            <MenuItem
                                icon="document-text-outline"
                                title="Terms & Privacy"
                                onPress={() => navigation.navigate('TermsPrivacy')}
                                showBorder={false}
                            />
                        </View>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="log-out-outline" size={20} color={COLORS.error} />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    {/* Version */}
                    <Text style={styles.versionText}>Version 1.14</Text>
                </View>
            </ScrollView>
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
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingL,
        borderBottomLeftRadius: SIZES.radiusXL,
        borderBottomRightRadius: SIZES.radiusXL,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandName: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.white,
        letterSpacing: 2,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    taglineLine: {
        width: 20,
        height: 1,
        backgroundColor: COLORS.secondary,
    },
    tagline: {
        fontSize: SIZES.small,
        color: COLORS.secondary,
        fontStyle: 'italic',
    },
    content: {
        paddingHorizontal: SIZES.padding,
        paddingTop: SIZES.padding,
        paddingBottom: 100,
    },
    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        ...SHADOWS.small,
    },
    sectionLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: SIZES.paddingS,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.paddingS,
    },
    avatarText: {
        fontSize: SIZES.xlarge,
        fontWeight: '600',
        color: COLORS.white,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    profilePhone: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: SIZES.paddingXS,
        paddingHorizontal: SIZES.paddingS,
    },
    editText: {
        fontSize: SIZES.medium,
        color: COLORS.primary,
        fontWeight: '600',
    },
    nameInput: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.textPrimary,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        paddingVertical: 2,
        marginBottom: 2,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: COLORS.success,
    },
    cancelBtn: {
        backgroundColor: COLORS.error,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SIZES.paddingS,
        marginBottom: SIZES.padding,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.paddingS,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    statValue: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    section: {
        marginBottom: SIZES.padding,
    },
    sectionTitle: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SIZES.paddingS,
        marginLeft: SIZES.paddingXS,
    },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.paddingS + 4,
        paddingHorizontal: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    menuItemNoBorder: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.paddingS,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: SIZES.regular,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    menuSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error + '10',
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
        marginTop: SIZES.paddingS,
        gap: 8,
    },
    logoutText: {
        fontSize: SIZES.regular,
        fontWeight: '600',
        color: COLORS.error,
    },
    versionText: {
        textAlign: 'center',
        fontSize: SIZES.small,
        color: COLORS.mediumGray,
        marginTop: SIZES.paddingL,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
        alignSelf: 'center',
    },
    verifiedText: {
        color: '#2E7D32',
        fontSize: 10,
        fontWeight: 'bold',
    },
    unverifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
        alignSelf: 'center',
    },
    unverifiedText: {
        color: '#C62828',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
