import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const HigherLower = () => {
    const [currentNum, setCurrentNum] = useState(0);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const start = () => {
        setCurrentNum(Math.floor(Math.random() * 100) + 1);
        setScore(0);
        setMessage('Guess if the next number is Higher or Lower');
        setGameOver(false);
    };

    useEffect(() => { start(); }, []);

    const guess = (isHigher) => {
        const next = Math.floor(Math.random() * 100) + 1;
        if ((isHigher && next >= currentNum) || (!isHigher && next <= currentNum)) {
            setScore(s => s + 1);
            setCurrentNum(next);
            setMessage('Correct! Keep going.');
        } else {
            setCurrentNum(next);
            setMessage(`Wrong! It was ${next}`);
            setGameOver(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.score}>Score: {score}</Text>
            
            <View style={styles.card}>
                <Text style={styles.num}>{currentNum}</Text>
            </View>

            <Text style={styles.msg}>{message}</Text>

            {!gameOver ? (
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.success }]} onPress={() => guess(true)}>
                        <Icon name="arrow-up" size={30} color={COLORS.white} />
                        <Text style={styles.btnText}>Higher</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.error }]} onPress={() => guess(false)}>
                        <Icon name="arrow-down" size={30} color={COLORS.white} />
                        <Text style={styles.btnText}>Lower</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.restartBtn} onPress={start}>
                    <Text style={styles.restartText}>Play Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    score: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { width: 150, height: 200, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderRadius: 20, elevation: 5, marginBottom: 30, borderWidth: 2, borderColor: COLORS.primary },
    num: { fontSize: 60, fontWeight: 'bold', color: COLORS.primary },
    msg: { fontSize: 18, marginBottom: 30, textAlign: 'center', height: 50 },
    row: { flexDirection: 'row', gap: 20 },
    btn: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginTop: 5 },
    restartBtn: { padding: 15, backgroundColor: COLORS.darkBg, borderRadius: 10, width: 200, alignItems: 'center' },
    restartText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default HigherLower;
