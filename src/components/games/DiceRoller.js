import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../utils/colors';

const DiceRoller = () => {
    const [diceValues, setDiceValues] = useState([1, 1]);
    const [isRolling, setIsRolling] = useState(false);
    const spinValue = new Animated.Value(0);

    const rollDice = () => {
        setIsRolling(true);
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setDiceValues([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ]);
            spinValue.setValue(0);
            setIsRolling(false);
        });
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getIcon = (val) => {
        const map = { 1: 'dice-outline', 2: 'dice-outline', 3: 'dice-outline', 4: 'dice-outline', 5: 'dice-outline', 6: 'dice-outline' };
        // For simplicity using same icon but displaying number
        return 'cube-outline';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Total: {diceValues[0] + diceValues[1]}</Text>
            
            <View style={styles.diceContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <View style={styles.die}>
                        <Text style={styles.dieText}>{diceValues[0]}</Text>
                    </View>
                </Animated.View>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <View style={styles.die}>
                        <Text style={styles.dieText}>{diceValues[1]}</Text>
                    </View>
                </Animated.View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={rollDice} disabled={isRolling}>
                <Text style={styles.btnText}>{isRolling ? 'Rolling...' : 'Roll Dice'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    title: { fontSize: 30, fontWeight: 'bold', marginBottom: 50 },
    diceContainer: { flexDirection: 'row', gap: 20, marginBottom: 60 },
    die: { 
        width: 100, height: 100, backgroundColor: COLORS.white, 
        justifyContent: 'center', alignItems: 'center', 
        borderRadius: 20, elevation: 5,
        borderWidth: 2, borderColor: COLORS.primary
    },
    dieText: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary },
    btn: { paddingHorizontal: 40, paddingVertical: 15, backgroundColor: COLORS.primary, borderRadius: 30 },
    btnText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' }
});

export default DiceRoller;
