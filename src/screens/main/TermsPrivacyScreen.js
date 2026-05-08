import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const TermsPrivacyScreen = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Terms & Privacy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Terms and Conditions Section */}
                <View style={styles.section}>
                    <View style={styles.titleContainer}>
                        <Icon name="document-text" size={22} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
                    </View>
                    <Text style={styles.introText}>
                        Welcome to Food Man – Thambi Oru Tea. By using our mobile application, you agree to the following terms:
                    </Text>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>1. Use of the App</Text>
                        <Text style={styles.clauseText}>• You must be at least 18 years old or use under supervision.</Text>
                        <Text style={styles.clauseText}>• Provide accurate details while placing orders.</Text>
                        <Text style={styles.clauseText}>• Misuse may lead to account suspension.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>2. Orders & Payments</Text>
                        <Text style={styles.clauseText}>• Orders are subject to availability.</Text>
                        <Text style={styles.clauseText}>• Prices may change without prior notice.</Text>
                        <Text style={styles.clauseText}>• Payment methods include: UPI / Online Payments, Cash on Delivery (Cash in Hand).</Text>
                        <Text style={styles.clauseText}>• Orders cannot be cancelled once preparation has started.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>3. Delivery Policy</Text>
                        <Text style={styles.clauseText}>• Delivery time is estimated and may vary.</Text>
                        <Text style={styles.clauseText}>• Provide correct address and contact details.</Text>
                        <Text style={styles.clauseText}>• Failed delivery due to incorrect details is not eligible for refund.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>4. Refund & Cancellation</Text>
                        <Text style={styles.clauseText}>Refunds are applicable only if:</Text>
                        <Text style={styles.clauseText}>• Wrong item delivered</Text>
                        <Text style={styles.clauseText}>• Damaged or poor-quality product</Text>
                        <Text style={styles.clauseText}>Refunds will be processed within 5–7 business days.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>5. User Responsibilities</Text>
                        <Text style={styles.clauseText}>• No illegal or fraudulent usage.</Text>
                        <Text style={styles.clauseText}>• No attempts to hack or disrupt services.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>6. Intellectual Property</Text>
                        <Text style={styles.clauseText}>• All branding and content belong to Food Man.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>7. Limitation of Liability</Text>
                        <Text style={styles.clauseText}>• Not responsible for delays due to external factors.</Text>
                        <Text style={styles.clauseText}>• Customers must check ingredients for allergies.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>8. Changes to Terms</Text>
                        <Text style={styles.clauseText}>• We may update terms anytime. Continued use means acceptance.</Text>
                    </View>
                </View>

                {/* Privacy Policy Section */}
                <View style={styles.section}>
                    <View style={styles.titleContainer}>
                        <Icon name="shield-checkmark" size={22} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>PRIVACY POLICY</Text>
                    </View>
                    <Text style={styles.introText}>
                        At Food Man – Thambi Oru Tea, your privacy is important to us.
                    </Text>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>1. Information We Collect</Text>
                        <Text style={styles.clauseText}>• Name, phone number, email</Text>
                        <Text style={styles.clauseText}>• Delivery address</Text>
                        <Text style={styles.clauseText}>• Order history</Text>
                        <Text style={styles.clauseText}>• Device/app usage data</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>2. How We Use Your Information</Text>
                        <Text style={styles.clauseText}>• Order processing & delivery</Text>
                        <Text style={styles.clauseText}>• Customer support</Text>
                        <Text style={styles.clauseText}>• App improvement</Text>
                        <Text style={styles.clauseText}>• Notifications & updates</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>3. Data Sharing</Text>
                        <Text style={styles.clauseText}>We do not sell your data. Data may be shared with:</Text>
                        <Text style={styles.clauseText}>• Delivery partners</Text>
                        <Text style={styles.clauseText}>• Payment gateways</Text>
                        <Text style={styles.clauseText}>• Legal authorities (if required)</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>4. Data Security</Text>
                        <Text style={styles.clauseText}>• We use secure systems, but no system is 100% secure.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>5. Cookies & Tracking</Text>
                        <Text style={styles.clauseText}>• Used to improve app performance and user experience.</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>6. Your Rights</Text>
                        <Text style={styles.clauseText}>• Request data update or deletion</Text>
                        <Text style={styles.clauseText}>• Opt-out of promotional messages</Text>
                    </View>

                    <View style={styles.clause}>
                        <Text style={styles.clauseTitle}>7. Changes to Policy</Text>
                        <Text style={styles.clauseText}>• Policy may be updated periodically.</Text>
                    </View>

                    <View style={styles.footerInfo}>
                        <Text style={styles.clauseTitle}>8. Contact Information</Text>
                        <Text style={styles.contactText}>Business Name: Food Man</Text>
                        <Text style={styles.contactText}>Email: foodmanadmin@gmail.com</Text>
                        <Text style={styles.contactText}>Phone: 0424-7167303</Text>

                        <Text style={[styles.contactText, { marginTop: 10, fontWeight: '600' }]}>Address:</Text>
                        <Text style={styles.contactText}>S.NO - 34, D.NO - 47A</Text>
                        <Text style={styles.contactText}>Chinnamuthu Main Street</Text>
                        <Text style={styles.contactText}>Erode, Erode District</Text>
                        <Text style={styles.contactText}>Tamil Nadu – 638011</Text>
                    </View>
                </View>

                <View style={styles.bottomGap} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingL,
        borderBottomLeftRadius: SIZES.radiusXL,
        borderBottomRightRadius: SIZES.radiusXL,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.white,
    },
    scrollContent: {
        padding: SIZES.padding,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.padding,
        ...SHADOWS.small,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: SIZES.paddingS,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: SIZES.regular,
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: 0.5,
    },
    introText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SIZES.padding,
    },
    clause: {
        marginBottom: SIZES.padding,
    },
    clauseTitle: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    clauseText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 4,
    },
    footerInfo: {
        marginTop: SIZES.paddingS,
        paddingTop: SIZES.paddingS,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    contactText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    bottomGap: {
        height: 40,
    },
});

export default TermsPrivacyScreen;
