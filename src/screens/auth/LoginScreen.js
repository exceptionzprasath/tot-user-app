import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    StatusBar,
    Image,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import Button from '../../components/Button';
import { checkPhone, sendOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validatePhoneNumber = (number) => {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(number);
    };

    const handleSendOTP = async () => {
        setError('');

        if (!validatePhoneNumber(phoneNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        const fullPhone = `+91${phoneNumber}`;
        
        // Special Bypass for Hari
        if (phoneNumber === '9361016097') {
            setLoading(true);
            try {
                // Instantly login with mock session
                await login({ phone: fullPhone, name: 'Hari', role: 'customer', isVerified: true });
                return; // Root switch will handle navigation
            } catch (err) {
                console.error('Bypass error:', err);
                setError('Login failed. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);

        try {
            // Step 1: Check if user exists in DynamoDB
            const checkResult = await checkPhone(fullPhone);

            if (checkResult.success) {
                if (checkResult.exists) {
                    /* Comment out OTP screen flow temporarily
                    let appSignature = '';
                    if (Platform.OS === 'android') {
                        try {
                            const { getAppSignature: getHash } = require('@pushpendersingh/react-native-otp-verify');
                            const signatures = await getHash();
                            if (Array.isArray(signatures) && signatures.length > 0) {
                                appSignature = signatures[0];
                            } else if (typeof signatures === 'string') {
                                appSignature = signatures;
                            }
                            console.log('📱 App Signature retrieved:', appSignature);
                        } catch (e) {
                            console.log('Error getting app signature in LoginScreen:', e);
                        }
                    }

                    const response = await sendOTP(fullPhone, appSignature);
                    if (response.success) {
                        Alert.alert(
                            'OTP Sent',
                            'An OTP verification code has been sent to your mobile number.'
                        );
                        navigation.navigate('OTP', { phoneNumber: fullPhone });
                    } else {
                        setError(response.message || 'Failed to send OTP. Please try again.');
                    }
                    */

                    // Instantly login with existing profile and force isVerified to true
                    await login({ ...(checkResult.user || {}), phone: fullPhone, isVerified: true });
                } else {
                    // Step 2b: New user — go to Register screen
                    navigation.navigate('Register', { phoneNumber: fullPhone });
                }
            } else {
                setError('Service validation failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ImageBackground
                source={{ uri: 'https://i.pinimg.com/736x/28/d1/2c/28d12cccc6b6744d2727296abe3f032e.jpg' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay} />

                <SafeAreaView style={styles.content}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flexCenter}
                    >
                        {/* Logo Container */}
                        <Animatable.View
                            animation="zoomIn"
                            duration={1200}
                            style={styles.logoContainer}
                        >
                            <View style={styles.logoBox}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                        </Animatable.View>

                        {/* Text Content */}
                        <Animatable.View
                            animation="fadeInUp"
                            duration={1000}
                            delay={300}
                            style={styles.textContainer}
                        >
                            <Text style={styles.heroTitle}>Thambi <Text style={{ color: COLORS.secondary }}>Oru Tea</Text></Text>
                            <View style={styles.heroLine} />
                            <Text style={styles.heroSubtitle}>
                                Login with your phone number to continue
                            </Text>
                        </Animatable.View>

                        {/* Input Area */}
                        <Animatable.View
                            animation="fadeInUp"
                            duration={1000}
                            delay={600}
                            style={styles.inputSection}
                        >
                            <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
                                <Text style={styles.countryCode}>+91</Text>
                                <View style={styles.separator} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChangeText={(text) => {
                                        setPhoneNumber(text);
                                        setError('');
                                    }}
                                />
                                {validatePhoneNumber(phoneNumber) && (
                                    <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                                )}
                            </View>

                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <Button
                                title="Get OTP"
                                onPress={handleSendOTP}
                                loading={loading}
                                style={styles.getOtpButton}
                                textStyle={styles.buttonText}
                                icon={<Icon name="arrow-forward" size={22} color={COLORS.white} />}
                            />
                        </Animatable.View>
                    </KeyboardAvoidingView>

                    {/* Footer - Terms & Conditions */}
                    <Animatable.View
                        animation="fadeIn"
                        duration={1000}
                        delay={1000}
                        style={styles.footer}
                    >
                        <Text style={styles.footerText}>
                            By continuing, you agree to our
                        </Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}> & </Text>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </Animatable.View>
                </SafeAreaView>
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
        backgroundColor: 'rgba(0, 0, 0, 0.55)', // Dark overlay for readability
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.padding * 1.5,
    },
    flexCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoBox: {
        width: 130,
        height: 130,
        backgroundColor: COLORS.white,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    logo: {
        width: 100,
        height: 100,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    heroTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: COLORS.white,
        textAlign: 'center',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
        textTransform: 'uppercase',
    },
    heroLine: {
        width: 60,
        height: 3,
        backgroundColor: COLORS.secondary,
        marginTop: 8,
        borderRadius: 2,
        alignSelf: 'center',
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        marginTop: 15,
        lineHeight: 22,
        letterSpacing: 0.5,
        fontWeight: '500',
    },
    inputSection: {
        width: '100%',
        marginTop: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 65,
        marginBottom: 10,
    },
    inputWrapperError: {
        borderColor: COLORS.error,
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
    },
    countryCode: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
    },
    separator: {
        width: 1.5,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 15,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: COLORS.white,
        fontWeight: '500',
    },
    errorText: {
        color: '#FFCDD2',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    getOtpButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        height: 65,
        marginTop: 15,
        ...SHADOWS.large,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    footerStatus: {
        marginTop: 'auto',
        marginBottom: 10,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 25,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
        letterSpacing: 0.3,
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: 8,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
        letterSpacing: 0.5,
    },
});

export default LoginScreen;
