import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    Dimensions,
    Platform,
    ImageBackground,
    KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';
import Button from '../../components/Button';
import { verifyOTP, sendOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const OTPScreen = ({ route, navigation }) => {
    const { login } = useAuth();
    const { phoneNumber } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];

    useEffect(() => {
        inputRefs[0].current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (timer > 0 && !canResend) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            setCanResend(true);
        }
    }, [timer, canResend]);

    const handleOtpChange = (value, index) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }

        if (index === 5 && value) {
            const otpString = newOtp.join('');
            if (otpString.length === 6) {
                handleVerifyOTP(otpString);
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handleVerifyOTP = async (otpString = otp.join('')) => {
        if (otpString.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);

        try {


            // authService verifyOTP handles the backend call automatically
            const response = await verifyOTP(otpString, phoneNumber);

            if (response.success) {
                await login(response.user || { phone: phoneNumber });
            } else {
                Alert.alert('Error', response.message || 'Verification failed');
                setOtp(['', '', '', '', '', '']);
                inputRefs[0].current?.focus();
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            Alert.alert('Invalid OTP', err.message || 'The OTP you entered is incorrect. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await sendOTP(phoneNumber);
            setOtp(['', '', '', '', '', '']);
            setTimer(30);
            setCanResend(false);
            inputRefs[0].current?.focus();
            Alert.alert('OTP Resent', 'A new OTP verification code has been sent to your mobile number.');
        } catch (err) {
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
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
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flexCenter}
                    >
                        <Animatable.View
                            animation="fadeInDown"
                            duration={800}
                            style={styles.headerContent}>
                            <View style={styles.iconContainer}>
                                <Icon name="shield-checkmark" size={40} color={COLORS.white} />
                            </View>
                            <Text style={styles.heroTitle}>Verification</Text>
                            <Text style={styles.heroSubtitle}>
                                Enter the 6-digit code sent to
                            </Text>
                            <Text style={styles.phoneNumberText}>{phoneNumber}</Text>


                        </Animatable.View>


                        {/* OTP Input */}
                        <Animatable.View
                            animation="fadeInUp"
                            duration={800}
                            delay={200}
                            style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={inputRefs[index]}
                                    style={[
                                        styles.otpInput,
                                        digit && styles.otpInputFilled,
                                    ]}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                    selectTextOnFocus
                                />
                            ))}
                        </Animatable.View>

                        {/* Verify Button */}
                        <Animatable.View
                            animation="fadeInUp"
                            duration={800}
                            delay={400}
                            style={styles.buttonSection}>
                            <Button
                                title="Verify & Continue"
                                onPress={() => handleVerifyOTP()}
                                loading={loading}
                                style={styles.verifyButton}
                                textStyle={styles.buttonText}
                                icon={<Icon name="checkmark-circle" size={22} color={COLORS.white} />}
                            />

                            {/* Resend OTP */}
                            <View style={styles.resendSection}>
                                {!canResend ? (
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.timerText}>
                                            Resend code in <Text style={styles.timerHighlight}>{timer}s</Text>
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={handleResendOTP} style={styles.resendButton}>
                                        <Text style={styles.resendText}>Didn't receive code? </Text>
                                        <Text style={styles.resendLink}>Resend OTP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animatable.View>
                    </KeyboardAvoidingView>

                    {/* Footer - Security Note */}
                    <Animatable.View
                        animation="fadeIn"
                        duration={1000}
                        delay={600}
                        style={styles.footer}
                    >
                        <View style={styles.securityNote}>
                            <Icon name="lock-closed" size={14} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.securityText}>
                                Secure 256-bit SSL encrypted connection
                            </Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    content: {
        flex: 1,
        paddingHorizontal: SIZES.padding * 1.5,
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    flexCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: SIZES.regular,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    phoneNumberText: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: '#E2F400',
        marginTop: 5,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 8,
    },
    otpInput: {
        width: 48,
        height: 55,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    otpInputFilled: {
        borderColor: '#E2F400',
        backgroundColor: 'rgba(226, 244, 0, 0.1)',
    },
    buttonSection: {
        width: '100%',
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 15,
        height: 65,
        ...SHADOWS.medium,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendSection: {
        alignItems: 'center',
        marginTop: 25,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    timerHighlight: {
        color: '#E2F400',
        fontWeight: 'bold',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    resendLink: {
        fontSize: 15,
        color: '#E2F400',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    footer: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    securityText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});

export default OTPScreen;
