import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../utils/colors';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    maxLength,
    multiline = false,
    numberOfLines = 1,
    error,
    icon,
    rightIcon,
    style,
    inputStyle,
    editable = true,
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                error && styles.inputError,
                !editable && styles.inputDisabled,
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        icon && styles.inputWithIcon,
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.mediumGray}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    editable={editable}
                />

                {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.paddingS,
    },
    label: {
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SIZES.paddingS,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.gray,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        minHeight: 50,
        ...SHADOWS.small,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    inputDisabled: {
        backgroundColor: COLORS.lightGray,
        opacity: 0.7,
    },
    iconContainer: {
        marginRight: SIZES.paddingS,
    },
    rightIconContainer: {
        marginLeft: SIZES.paddingS,
    },
    input: {
        flex: 1,
        fontSize: SIZES.regular,
        color: COLORS.textPrimary,
        paddingVertical: SIZES.paddingS,
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    inputMultiline: {
        textAlignVertical: 'top',
        paddingTop: SIZES.paddingS,
    },
    errorText: {
        fontSize: SIZES.small,
        color: COLORS.error,
        marginTop: SIZES.paddingXS,
        marginLeft: SIZES.paddingXS,
    },
});

export default Input;
