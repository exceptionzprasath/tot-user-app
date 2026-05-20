import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const WORDS = ['REACT', 'JAVASCRIPT', 'TEA', 'COFFEE', 'MOBILE', 'DEVELOPER'];

const Hangman = () => {
    const [word, setWord] = useState('');
    const [guessed, setGuessed] = useState(new Set());
    const [mistakes, setMistakes] = useState(0);

    const initialize = () => {
        setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
        setGuessed(new Set());
        setMistakes(0);
    };

    useEffect(() => { initialize(); }, []);

    const handleGuess = (letter) => {
        if (guessed.has(letter) || mistakes >= 6) return;
        const newGuessed = new Set(guessed).add(letter);
        setGuessed(newGuessed);
        if (!word.includes(letter)) {
            setMistakes(m => m + 1);
        }
    };

    const isWin = word.length > 0 && word.split('').every(char => guessed.has(char));
    const isLoss = mistakes >= 6;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <View style={styles.container}>
            <Text style={styles.mistakes}>Mistakes: {mistakes} / 6</Text>
            
            <View style={styles.wordDisplay}>
                {word.split('').map((char, i) => (
                    <Text key={i} style={styles.charBox}>
                        {guessed.has(char) || isLoss ? char : '_'}
                    </Text>
                ))}
            </View>

            {isWin && <Text style={styles.win}>You Survived!</Text>}
            {isLoss && <Text style={styles.loss}>Game Over!</Text>}

            <View style={styles.keyboard}>
                {alphabet.map(letter => {
                    const isUsed = guessed.has(letter);
                    const isCorrect = isUsed && word.includes(letter);
                    const isWrong = isUsed && !word.includes(letter);
                    
                    let bgColor = COLORS.lightGray;
                    if (isCorrect) bgColor = COLORS.success;
                    if (isWrong) bgColor = COLORS.mediumGray;

                    return (
                        <TouchableOpacity
                            key={letter}
                            style={[styles.key, { backgroundColor: bgColor }]}
                            onPress={() => handleGuess(letter)}
                            disabled={isUsed || isWin || isLoss}
                        >
                            <Text style={styles.keyText}>{letter}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {(isWin || isLoss) && (
                <TouchableOpacity style={styles.btn} onPress={initialize}>
                    <Text style={styles.btnText}>Play Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    mistakes: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.error },
    wordDisplay: { flexDirection: 'row', gap: 10, marginBottom: 40 },
    charBox: { fontSize: 40, fontWeight: 'bold', width: 35, textAlign: 'center' },
    win: { fontSize: 24, color: COLORS.success, fontWeight: 'bold', marginBottom: 20 },
    loss: { fontSize: 24, color: COLORS.error, fontWeight: 'bold', marginBottom: 20 },
    keyboard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 350 },
    key: { width: 40, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
    keyText: { fontSize: 18, fontWeight: 'bold' },
    btn: { marginTop: 30, padding: 15, backgroundColor: COLORS.primary, borderRadius: 10 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default Hangman;
