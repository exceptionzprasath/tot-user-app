import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { COLORS } from '../../utils/colors';

const WORDS = ['REACT', 'MOBILE', 'NATIVE', 'COFFEE', 'DEVELOPER', 'KEYBOARD', 'SCREEN'];

const WordScramble = () => {
    const [word, setWord] = useState('');
    const [scrambled, setScrambled] = useState('');
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('');
    const [score, setScore] = useState(0);

    const generateWord = () => {
        const w = WORDS[Math.floor(Math.random() * WORDS.length)];
        setWord(w);
        const s = w.split('').sort(() => Math.random() - 0.5).join('');
        setScrambled(s);
        setGuess('');
        setMessage('');
    };

    useEffect(() => { generateWord(); }, []);

    const handleGuess = () => {
        Keyboard.dismiss();
        if (guess.toUpperCase() === word) {
            setScore(s => s + 1);
            setMessage('Correct! 🎉');
            setTimeout(generateWord, 1500);
        } else {
            setMessage('Incorrect, try again! ❌');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.score}>Score: {score}</Text>
            
            <View style={styles.card}>
                <Text style={styles.scrambled}>{scrambled}</Text>
            </View>

            <Text style={styles.msg}>{message}</Text>

            <TextInput
                style={styles.input}
                value={guess}
                onChangeText={setGuess}
                placeholder="Unscramble the word"
                autoCapitalize="characters"
            />
            
            <View style={styles.row}>
                <TouchableOpacity style={styles.btn} onPress={handleGuess}>
                    <Text style={styles.btnText}>Check</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.darkGray }]} onPress={generateWord}>
                    <Text style={styles.btnText}>Skip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    score: { fontSize: 20, fontWeight: 'bold', alignSelf: 'flex-end', marginBottom: 20 },
    card: { padding: 30, backgroundColor: COLORS.white, borderRadius: 10, elevation: 5, marginBottom: 20, width: '100%', alignItems: 'center' },
    scrambled: { fontSize: 40, letterSpacing: 10, fontWeight: 'bold', color: COLORS.primary },
    msg: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 20, height: 25 },
    input: { 
        borderWidth: 1, borderColor: COLORS.mediumGray, 
        width: '100%', fontSize: 20, padding: 15, 
        borderRadius: 10, marginBottom: 20, textAlign: 'center'
    },
    row: { flexDirection: 'row', gap: 15 },
    btn: { flex: 1, padding: 15, backgroundColor: COLORS.primary, borderRadius: 10, alignItems: 'center' },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default WordScramble;
