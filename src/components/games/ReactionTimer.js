import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const ReactionTimer = () => {
    const [gameState, setGameState] = useState('waiting'); // waiting, ready, active, done
    const [result, setResult] = useState(null);
    const timeoutRef = useRef(null);
    const startTimeRef = useRef(0);

    const handlePress = () => {
        if (gameState === 'waiting' || gameState === 'done') {
            setGameState('ready');
            setResult(null);
            const randomDelay = Math.random() * 3000 + 1500; // 1.5s to 4.5s
            timeoutRef.current = setTimeout(() => {
                setGameState('active');
                startTimeRef.current = Date.now();
            }, randomDelay);
        } else if (gameState === 'ready') {
            clearTimeout(timeoutRef.current);
            setGameState('done');
            setResult('Too early!');
        } else if (gameState === 'active') {
            const time = Date.now() - startTimeRef.current;
            setGameState('done');
            setResult(`${time} ms`);
        }
    };

    const getBgColor = () => {
        switch (gameState) {
            case 'ready': return COLORS.warning; // Yellow
            case 'active': return '#4CAF50'; // Green
            case 'done': return result === 'Too early!' ? COLORS.error : COLORS.primary;
            default: return COLORS.mediumGray;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reaction Timer</Text>
            <Text style={styles.subtitle}>
                {gameState === 'waiting' ? 'Tap to start' :
                 gameState === 'ready' ? 'Wait for Green...' :
                 gameState === 'active' ? 'TAP NOW!' : 'Tap to try again'}
            </Text>

            <TouchableOpacity 
                style={[styles.pad, { backgroundColor: getBgColor() }]} 
                onPress={handlePress}
                activeOpacity={1}
            >
                {gameState === 'done' && result && (
                    <Text style={styles.resultText}>{result}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', flex: 1, paddingTop: 40 },
    title: { fontSize: 24, fontWeight: 'bold' },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 40, marginTop: 10 },
    pad: { width: 300, height: 400, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    resultText: { fontSize: 40, fontWeight: 'bold', color: COLORS.white }
});

export default ReactionTimer;
