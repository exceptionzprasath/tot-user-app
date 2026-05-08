import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS, SIZES } from '../utils/colors';

const Loader = ({ message = "Loading..." }) => {
    return (
        <View style={styles.container}>
            <LottieView
                source={require('../assets/Time.json')}
                autoPlay
                loop
                style={styles.lottie}
            />
            {message && <Text style={styles.text}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    lottie: {
        width: 150,
        height: 150,
    },
    text: {
        marginTop: 10,
        fontSize: SIZES.medium,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
    },
});

export default Loader;
