import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const ClickCounter = () => {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [finished, setFinished] = useState(false);

    const startGame = () => {
        setClicks(0);
        setTimeLeft(10);
        setIsPlaying(true);
        setFinished(false);
    };

    useEffect(() => {
        let timer;
        if (isPlaying && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            setFinished(true);
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isPlaying]);

    const handlePress = () => {
        if (!isPlaying && !finished) startGame();
        if (isPlaying) setClicks(c => c + 1);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fastest Clicker</Text>
            <View style={styles.stats}>
                <Text style={styles.statText}>Time: {timeLeft}s</Text>
                <Text style={styles.statText}>CPS: {finished ? (clicks / 10).toFixed(1) : 0}</Text>
            </View>

            <TouchableOpacity 
                style={[styles.bigBtn, { backgroundColor: isPlaying ? COLORS.success : COLORS.primary }]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.btnText}>
                    {!isPlaying && !finished ? 'Tap to Start!' : 
                     isPlaying ? clicks.toString() : 'Time Up!'}
                </Text>
            </TouchableOpacity>

            {finished && (
                <TouchableOpacity style={styles.resetBtn} onPress={startGame}>
                    <Text style={styles.resetText}>Play Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingTop: 40, flex: 1 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    stats: { flexDirection: 'row', gap: 40, marginBottom: 40 },
    statText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textSecondary },
    bigBtn: { 
        width: 250, height: 250, borderRadius: 125, 
        justifyContent: 'center', alignItems: 'center',
        elevation: 10
    },
    btnText: { fontSize: 40, fontWeight: 'bold', color: COLORS.white },
    resetBtn: { marginTop: 50, padding: 15, backgroundColor: COLORS.darkGray, borderRadius: 10 },
    resetText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default ClickCounter;
