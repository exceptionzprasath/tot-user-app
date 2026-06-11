import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import { COLORS, SHADOWS } from '../../utils/colors';
import Button from '../../components/Button';
import { registerUser, sendOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation, route }) => {
    const { login } = useAuth();
    const { phoneNumber } = route.params;
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setLoading(true);

        try {
            // Simplified registration for customers: only Name and Phone
            const formData = new FormData();
            formData.append('phone', phoneNumber);
            formData.append('name', name);
            formData.append('role', 'customer');

            const result = await registerUser(formData);

            if (result.success) {
                Alert.alert('Success', 'Welcome to Thambioru Tea! Registration successful.', [
                    { 
                        text: 'Continue', 
                        onPress: async () => {
                            try {
                                // Directly login the newly registered user and force isVerified to true
                                await login({
                                    ...(result.user || {}),
                                    phone: phoneNumber,
                                    name: name.trim(),
                                    role: 'customer',
                                    isVerified: true
                                });
                            } catch (err) {
                                console.error('Auto login error after registration:', err);
                                Alert.alert('Error', 'Failed to log in automatically. Please try logging in.');
                            }
                        } 
                    }
                ]);
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color={COLORS.black} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Welcome!</Text>
                        <Text style={styles.subtitle}>Just a name to get you started</Text>
                    </Animatable.View>

                    <Animatable.View animation="fadeInUp" duration={1000} delay={200} style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>What should we call you?</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="person-outline" size={22} color={COLORS.primary} />
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="Your Full Name"
                                    value={name}
                                    onChangeText={setName}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={[styles.inputWrapper, styles.disabledInput]}>
                                <Icon name="call-outline" size={22} color={COLORS.mediumGray} />
                                <Text style={styles.phoneText}>{phoneNumber}</Text>
                            </View>
                        </View>

                        <Button 
                            title="Register & Continue" 
                            onPress={handleRegister} 
                            loading={loading}
                            style={styles.submitBtn}
                        />
                    </Animatable.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginTop: 5,
    },
    form: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1.5,
        borderColor: '#EEEEEE',
        borderRadius: 15,
        paddingHorizontal: 16,
        height: 60,
    },
    disabledInput: {
        backgroundColor: '#F3F3F3',
        borderColor: '#EEEEEE',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#000000',
    },
    phoneText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#888888',
        fontWeight: '500',
    },
    submitBtn: {
        marginTop: 20,
        height: 60,
        borderRadius: 15,
        backgroundColor: COLORS.primary,
        ...SHADOWS.medium,
    }
});

export default RegisterScreen;
