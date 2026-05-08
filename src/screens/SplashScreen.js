import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, StatusBar, Dimensions, ImageBackground, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS, SHADOWS } from '../utils/colors';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Step 1: Show Foodman logo
        const timer1 = setTimeout(() => {
            setStep(2);
        }, 3000);

        // Step 2: Show App logo
        const timer2 = setTimeout(() => {
            onFinish();
        }, 6000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <ImageBackground
                source={{ uri: 'https://i.pinimg.com/736x/79/8b/5b/798b5b85d167cd4d18542a962a72c6dc.jpg' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <View style={styles.content}>
                    {step === 1 && (
                        <Animatable.View
                            animation="zoomIn"
                            duration={1800}
                            style={styles.logoContainer}
                        >
                            <Animatable.View animation="fadeOut" delay={2400} duration={600}>
                                <Image
                                    source={require('../assets/foodman.png')}
                                    style={styles.companyLogo}
                                    resizeMode="contain"
                                />
                            </Animatable.View>
                        </Animatable.View>
                    )}

                    {step === 2 && (
                        <Animatable.View
                            animation="fadeInUp"
                            duration={1000}
                            style={styles.logoContainer}
                        >
                            <View style={styles.logoBox}>
                                <Image
                                    source={require('../assets/logo.png')}
                                    style={styles.appLogo}
                                    resizeMode="contain"
                                />
                            </View>

                            <Animatable.View
                                animation="fadeInUp"
                                delay={500}
                                duration={1000}
                                style={styles.textGroup}
                            >
                                <Text style={styles.brandTitle}>
                                    Thambi <Text style={{ color: COLORS.secondary }}>Oru Tea</Text>
                                </Text>
                                <View style={styles.heroLine} />
                                <Text style={styles.tagline}>
                                    Premium Tea & Snacks
                                </Text>
                            </Animatable.View>
                        </Animatable.View>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Slightly darker for premium feel
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoBox: {
        width: 180,
        height: 180,
        backgroundColor: COLORS.white,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        ...SHADOWS.large,
    },
    companyLogo: {
        width: width * 0.85,
        height: width * 0.85,
        alignSelf: 'center',
    },
    companyText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 4,
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.8,
    },
    appLogo: {
        width: 140,
        height: 140,
    },
    textGroup: {
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    heroLine: {
        width: 40,
        height: 3,
        backgroundColor: COLORS.secondary,
        marginVertical: 12,
        borderRadius: 2,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
});

export default SplashScreen;
