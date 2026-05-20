import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { COLORS } from '../../utils/colors';

const GuessNumber = () => {
    const [target, setTarget] = useState(Math.floor(Math.random() * 100) + 1);
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('Guess a number between 1 and 100');
    const [attempts, setAttempts] = useState(0);
    const [won, setWon] = useState(false);

    const handleGuess = () => {
        const num = parseInt(guess);
        if (isNaN(num)) return;
        
        Keyboard.dismiss();
        setAttempts(a => a + 1);

        if (num === target) {
            setMessage(`Correct! It took you ${attempts + 1} attempts.`);
            setWon(true);
        } else if (num < target) {
            setMessage('Too Low! Try higher.');
        } else {
            setMessage('Too High! Try lower.');
        }
        setGuess('');
    };

    const restart = () => {
        setTarget(Math.floor(Math.random() * 100) + 1);
        setGuess('');
        setMessage('Guess a number between 1 and 100');
        setAttempts(0);
        setWon(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Guess The Number</Text>
            
            <View style={styles.msgBox}>
                <Text style={styles.msgText}>{message}</Text>
            </View>

            {!won && (
                <>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={guess}
                        onChangeText={setGuess}
                        placeholder="Enter your guess"
                        maxLength={3}
                    />
                    <TouchableOpacity style={styles.btn} onPress={handleGuess}>
                        <Text style={styles.btnText}>Submit Guess</Text>
                    </TouchableOpacity>
                </>
            )}

            {won && (
                <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.success }]} onPress={restart}>
                    <Text style={styles.btnText}>Play Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    msgBox: { padding: 20, backgroundColor: COLORS.lightGray, borderRadius: 10, marginBottom: 30, width: '100%' },
    msgText: { fontSize: 18, textAlign: 'center', color: COLORS.textPrimary },
    input: { 
        borderWidth: 2, borderColor: COLORS.mediumGray, 
        width: 150, fontSize: 30, textAlign: 'center', 
        padding: 10, borderRadius: 10, marginBottom: 20 
    },
    btn: { paddingHorizontal: 30, paddingVertical: 15, backgroundColor: COLORS.primary, borderRadius: 10 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default GuessNumber;
