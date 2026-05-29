import React from 'react';
import { View, Text, StyleSheet, Linking, StatusBar, TouchableOpacity, Dimensions, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../utils/colors';

const { width } = Dimensions.get('window');

const ForceUpdateScreen = ({ playStoreUrl, currentVersion, requiredVersion }) => {
    
    const handleUpdate = () => {
        const url = playStoreUrl || 'https://play.google.com/store/apps/details?id=com.thambiorutea';
        Linking.openURL(url).catch(err => {
            console.error('Failed to open playstore URL:', err.message);
            // Fallback link
            Linking.openURL('https://play.google.com/store');
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
            
            {/* Background Accent Gradients / Circles */}
            <View style={styles.topAccent} />
            <View style={styles.bottomAccent} />

            <View style={styles.cardContainer}>
                {/* Visual Icon Illustration */}
                <Animatable.View 
                    animation="bounceIn" 
                    duration={1500} 
                    style={styles.iconWrapper}
                >
                    <View style={styles.outerCircle}>
                        <View style={styles.middleCircle}>
                            <View style={styles.innerCircle}>
                                {/* Arrow Down Custom Shape */}
                                <View style={styles.arrowShaft} />
                                <View style={styles.arrowHead} />
                                <View style={styles.arrowBase} />
                            </View>
                        </View>
                    </View>
                </Animatable.View>

                {/* Typography Copy */}
                <Animatable.View 
                    animation="fadeInUp" 
                    delay={400} 
                    style={styles.textWrapper}
                >
                    <Text style={styles.title}>Time for an Update!</Text>
                    <Text style={styles.description}>
                        We've made Thambioru Tea even better with new features, improved ordering, and faster deliveries. 
                    </Text>
                    <Text style={styles.descriptionHighlight}>
                        To keep ordering fresh hot tea, please install the latest version from the Play Store.
                    </Text>
                </Animatable.View>

                {/* Call To Action */}
                <Animatable.View 
                    animation="pulse" 
                    iterationCount="infinite" 
                    duration={2000}
                    style={styles.buttonWrapper}
                >
                    <TouchableOpacity 
                        style={styles.updateButton} 
                        activeOpacity={0.8}
                        onPress={handleUpdate}
                    >
                        <Text style={styles.updateButtonText}>Update Thambioru Tea App</Text>
                    </TouchableOpacity>
                </Animatable.View>

                {/* Version Indicators */}
                <Animatable.View 
                    animation="fadeIn" 
                    delay={800} 
                    style={styles.versionWrapper}
                >
                    <Text style={styles.versionText}>
                        Current Version: <Text style={styles.boldText}>{currentVersion}</Text> | Required: <Text style={styles.boldText}>{requiredVersion}</Text>
                    </Text>
                </Animatable.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    topAccent: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: COLORS.primary + '10', // 10% opacity
    },
    bottomAccent: {
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: COLORS.secondary + '15', // 15% opacity
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    iconWrapper: {
        marginBottom: 28,
    },
    outerCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: COLORS.secondary + '20', // Transparent secondary yellow
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleCircle: {
        width: 106,
        height: 106,
        borderRadius: 53,
        backgroundColor: COLORS.secondary + '40',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary, // Red circle
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4,
    },
    // Custom Arrow Down Graphics
    arrowShaft: {
        width: 12,
        height: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    arrowHead: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 16,
        borderRightWidth: 16,
        borderTopWidth: 16,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF',
        marginTop: -2,
    },
    arrowBase: {
        width: 34,
        height: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        marginTop: 6,
    },
    textWrapper: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#111111',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 10,
    },
    descriptionHighlight: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 8,
    },
    buttonWrapper: {
        width: '100%',
        marginBottom: 24,
    },
    updateButton: {
        width: '100%',
        height: 54,
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    versionWrapper: {
        paddingTop: 8,
    },
    versionText: {
        fontSize: 12,
        color: '#999999',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#666666',
    },
});

export default ForceUpdateScreen;
