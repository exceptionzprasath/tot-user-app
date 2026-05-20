import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
const COLOR_CODES = { RED: '#D32F2F', BLUE: '#1976D2', GREEN: '#388E3C', YELLOW: '#FBC02D' };

const ColorMatch = () => {
    const [word, setWord] = useState('');
    const [color, setColor] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);

    const nextRound = () => {
        setWord(COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]);
        setColor(Object.values(COLOR_CODES)[Math.floor(Math.random() * 4)]);
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        nextRound();
    };

    useEffect(() => {
        let timer;
        if (isPlaying && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isPlaying]);

    const handleGuess = (guessedColorName) => {
        if (!isPlaying) return;
        if (COLOR_CODES[guessedColorName] === color) {
            setScore(s => s + 1);
        } else {
            setScore(s => Math.max(0, s - 1));
        }
        nextRound();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tap the color of the text, not the word!</Text>
            <View style={styles.stats}>
                <Text style={styles.statText}>Score: {score}</Text>
                <Text style={styles.statText}>Time: {timeLeft}s</Text>
            </View>

            {isPlaying ? (
                <>
                    <Text style={[styles.word, { color }]}>{word}</Text>
                    <View style={styles.btnRow}>
                        {COLOR_NAMES.map(c => (
                            <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: COLOR_CODES[c] }]} onPress={() => handleGuess(c)}>
                                <Text style={styles.btnText}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            ) : (
                <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                    <Text style={styles.startText}>{timeLeft === 0 ? 'Play Again' : 'Start Game'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: COLORS.textSecondary },
    stats: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 40 },
    statText: { fontSize: 20, fontWeight: 'bold' },
    word: { fontSize: 60, fontWeight: '900', marginBottom: 40 },
    btnRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    colorBtn: { width: '45%', padding: 20, alignItems: 'center', borderRadius: 10 },
    btnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    startBtn: { padding: 20, backgroundColor: COLORS.primary, borderRadius: 10 },
    startText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' }
});

export default ColorMatch;
