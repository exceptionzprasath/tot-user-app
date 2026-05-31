import React, { useState, useEffect } from 'react';
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
    Dimensions,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import { useLocation } from '../../context/LocationContext';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const SavedLocationsScreen = ({ navigation }) => {
    const { savedLocations, addLocation, removeLocation } = useLocation();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showMap, setShowMap] = useState(false);

    const [newLocation, setNewLocation] = useState({
        label: '',
        address: '',
        latitude: null,
        longitude: null,
    });

    const [mapRegion, setMapRegion] = useState(null);

    // Synchronize map region when newLocation coordinates are obtained
    useEffect(() => {
        if (newLocation.latitude && newLocation.longitude) {
            setMapRegion({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setShowMap(true);
        }
    }, [newLocation.latitude, newLocation.longitude]);

    const handleAddressChange = async (text) => {
        setNewLocation(prev => ({ ...prev, address: text }));
        if (text.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            // Priority search focusing around Erode/Tamil Nadu for relevant localized results
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ThambiOruTeaApp/1.0',
                    },
                }
            );
            const data = await response.json();
            setSuggestions(data || []);
        } catch (error) {
            console.error('Autocomplete fetch error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSuggestion = (item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        setNewLocation(prev => ({
            ...prev,
            address: item.display_name,
            latitude: lat,
            longitude: lon,
        }));
        setSuggestions([]);
    };

    const fetchGPSPin = () => {
        setIsLocating(true);
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setNewLocation(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
                setIsLocating(false);
            },
            (error) => {
                Alert.alert('Error', 'Failed to retrieve GPS location.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const fetchCurrentLocation = () => {
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
                        address: data.display_name || 'Current Location',
                        latitude,
                        longitude,
                    }));
                } catch (error) {
                    Alert.alert('Error', 'Failed to retrieve address for coordinates.');
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                Alert.alert('Error', 'Failed to retrieve GPS location.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleMarkerDragEnd = async (coordinate) => {
        const { latitude, longitude } = coordinate;
        setNewLocation(prev => ({
            ...prev,
            latitude,
            longitude,
        }));

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
            if (data && data.display_name) {
                setNewLocation(prev => ({
                    ...prev,
                    address: data.display_name,
                }));
            }
        } catch (error) {
            console.error('Reverse geocode on drag end failed:', error);
        }
    };

    const handleSaveLocation = () => {
        if (!newLocation.label.trim()) {
            Alert.alert('Error', 'Please enter a label (e.g. Home, Work)');
            return;
        }
        if (!newLocation.address.trim() || !newLocation.latitude || !newLocation.longitude) {
            Alert.alert('Error', 'Please search and select a suggested location on the map.');
            return;
        }

        addLocation(newLocation);
        setIsAddModalVisible(false);
        setNewLocation({ label: '', address: '', latitude: null, longitude: null });
        setSuggestions([]);
        setShowMap(false);
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
                {item.latitude && item.longitude && (
                    <Text style={styles.coordinatesText}>Pin: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</Text>
                )}
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
                onRequestClose={() => {
                    setIsAddModalVisible(false);
                    setShowMap(false);
                    setSuggestions([]);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Location</Text>
                            <TouchableOpacity onPress={() => {
                                setIsAddModalVisible(false);
                                setShowMap(false);
                                setSuggestions([]);
                            }}>
                                <Icon name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {/* Label */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Label</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Home, Work, Friend's House"
                                    value={newLocation.label}
                                    onChangeText={(text) => setNewLocation(prev => ({ ...prev, label: text }))}
                                />
                            </View>

                            {/* Autocomplete Search input */}
                            <View style={styles.inputGroup}>
                                <View style={styles.addressLabelRow}>
                                    <Text style={styles.inputLabel}>Search Address</Text>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TouchableOpacity 
                                            style={styles.fetchButton} 
                                            onPress={fetchGPSPin}
                                            disabled={isLocating}
                                        >
                                            <Icon name="pin" size={14} color={COLORS.primary} />
                                            <Text style={styles.fetchText}>GPS Pin</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.fetchButton} 
                                            onPress={fetchCurrentLocation}
                                            disabled={isLocating}
                                        >
                                            {isLocating ? (
                                                <ActivityIndicator size="small" color={COLORS.primary} />
                                            ) : (
                                                <>
                                                    <Icon name="locate" size={14} color={COLORS.primary} />
                                                    <Text style={styles.fetchText}>Current Address</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Type street, area or building name..."
                                    value={newLocation.address}
                                    onChangeText={handleAddressChange}
                                />
                                {isSearching && (
                                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 8 }} />
                                )}

                                {/* Suggestions dropdown list */}
                                {suggestions.length > 0 && (
                                    <View style={styles.suggestionsContainer}>
                                        {suggestions.map((item, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionRow}
                                                onPress={() => handleSelectSuggestion(item)}
                                            >
                                                <Icon name="location-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                                                <Text style={styles.suggestionText} numberOfLines={2}>
                                                    {item.display_name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Interactive Map View */}
                            {showMap && newLocation.latitude && newLocation.longitude && (
                                <View style={styles.mapWrapper}>
                                    <Text style={styles.mapLabel}>Adjust Marker to Exact Doorstep</Text>
                                    <View style={styles.mapContainer}>
                                        <MapView
                                            style={styles.map}
                                            region={mapRegion}
                                            onRegionChangeComplete={(region) => setMapRegion(region)}
                                        >
                                            <Marker
                                                draggable
                                                coordinate={{
                                                    latitude: newLocation.latitude,
                                                    longitude: newLocation.longitude
                                                }}
                                                onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate)}
                                                title={newLocation.label || "Doorstep"}
                                                description="Drag me to your exact entrance"
                                            />
                                        </MapView>
                                    </View>
                                    <View style={styles.mapTipBox}>
                                        <Icon name="information-circle" size={16} color="#2E7D32" style={{ marginRight: 6 }} />
                                        <Text style={styles.mapTipText}>
                                            Drag the red pin to mark your exact doorstep. Your coordinates will sync dynamically for the delivery rider.
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity 
                                style={[
                                    styles.saveButton,
                                    (!newLocation.latitude || !newLocation.longitude) && { opacity: 0.6 }
                                ]} 
                                onPress={handleSaveLocation}
                                disabled={!newLocation.latitude || !newLocation.longitude}
                            >
                                <Text style={styles.saveButtonText}>Save Location</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    coordinatesText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 4,
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
        maxHeight: height * 0.9,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: SIZES.xlarge,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    inputGroup: {
        marginBottom: 16,
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
    suggestionsContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: SIZES.radius,
        marginTop: 6,
        ...SHADOWS.medium,
        maxHeight: 180,
        overflow: 'hidden',
    },
    suggestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    suggestionText: {
        fontSize: SIZES.small,
        color: COLORS.textPrimary,
        flex: 1,
    },
    mapWrapper: {
        marginBottom: 16,
    },
    mapLabel: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    mapContainer: {
        height: 220,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: COLORS.lightGray,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapTipBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#2E7D3230',
        borderRadius: SIZES.radius,
        padding: 10,
        marginTop: 8,
    },
    mapTipText: {
        flex: 1,
        fontSize: 10,
        color: '#2E7D32',
        fontWeight: '600',
        lineHeight: 15,
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
