import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    Platform,
    ActivityIndicator,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { useLocation } from '../../context/LocationContext';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const SavedLocationsScreen = ({ navigation }) => {
    const { savedLocations, addLocation, removeLocation } = useLocation();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [newLocation, setNewLocation] = useState({
        label: '',
        address: '',
        latitude: null,
        longitude: null,
    });

    const getLocation = () => {
        setIsLocating(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'ThambiOruTeaApp/1.0',
                            },
                        }
                    );
                    const data = await response.json();
                    setNewLocation(prev => ({
                        ...prev,
                        address: data.display_name || 'Address not found',
                        latitude,
                        longitude,
                    }));
                } catch (error) {
                    Alert.alert('Error', 'Failed to get address');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                Alert.alert('Error', 'Failed to get location');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleSaveLocation = () => {
        if (!newLocation.label.trim()) {
            Alert.alert('Error', 'Please enter a label (e.g. Home, Work)');
            return;
        }
        if (!newLocation.address.trim()) {
            Alert.alert('Error', 'Please enter or fetch an address');
            return;
        }

        addLocation(newLocation);
        setIsAddModalVisible(false);
        setNewLocation({ label: '', address: '', latitude: null, longitude: null });
    };

    const handleDeleteLocation = (id) => {
        Alert.alert(
            'Delete Location',
            'Are you sure you want to delete this saved location?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeLocation(id) }
            ]
        );
    };

    const renderLocationItem = ({ item }) => (
        <View style={styles.locationItem}>
            <View style={styles.locationIconWrapper}>
                <Icon 
                    name={
                        item.label.toLowerCase() === 'home' ? 'home' : 
                        item.label.toLowerCase() === 'work' ? 'briefcase' : 'location'
                    } 
                    size={20} 
                    color={COLORS.primary} 
                />
            </View>
            <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{item.label}</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>{item.address}</Text>
            </View>
            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteLocation(item.id)}
            >
                <Icon name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

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
                <Text style={styles.headerTitle}>Saved Locations</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={savedLocations}
                keyExtractor={(item) => item.id}
                renderItem={renderLocationItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="map-outline" size={80} color={COLORS.mediumGray} />
                        <Text style={styles.emptyTitle}>No saved locations</Text>
                        <Text style={styles.emptySubtitle}>Add your home, work or other addresses for quicker ordering.</Text>
                    </View>
                }
            />

            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setIsAddModalVisible(true)}
            >
                <Icon name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>

            {/* Add Location Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Location</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Label</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Home, Work, Friend's House"
                                value={newLocation.label}
                                onChangeText={(text) => setNewLocation(prev => ({ ...prev, label: text }))}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.addressLabelRow}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TouchableOpacity 
                                    style={styles.fetchButton} 
                                    onPress={getLocation}
                                    disabled={isLocating}
                                >
                                    {isLocating ? (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    ) : (
                                        <>
                                            <Icon name="locate" size={16} color={COLORS.primary} />
                                            <Text style={styles.fetchText}>Current</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter address details"
                                value={newLocation.address}
                                onChangeText={(text) => setNewLocation(prev => ({ ...prev, address: text }))}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.saveButton} 
                            onPress={handleSaveLocation}
                        >
                            <Text style={styles.saveButtonText}>Save Location</Text>
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
    listContent: {
        padding: SIZES.padding,
        paddingBottom: 180,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.paddingS,
        ...SHADOWS.small,
    },
    locationIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.paddingS,
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    deleteButton: {
        padding: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 100,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.large,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        paddingHorizontal: SIZES.paddingXL,
    },
    emptyTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: SIZES.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: SIZES.radiusXL,
        borderTopRightRadius: SIZES.radiusXL,
        padding: SIZES.padding,
        paddingBottom: Platform.OS === 'ios' ? 40 : SIZES.padding,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.offWhite,
        borderRadius: SIZES.radius,
        padding: SIZES.paddingS + 2,
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    addressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    fetchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    fetchText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.primary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.padding,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginTop: 10,
        ...SHADOWS.medium,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: SIZES.medium,
        fontWeight: '700',
    },
});

export default SavedLocationsScreen;
