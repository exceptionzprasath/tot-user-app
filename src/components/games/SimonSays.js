import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const PAD_COLORS = ['#D32F2F', '#1976D2', '#388E3C', '#FBC02D'];

const SimonSays = () => {
    const [sequence, setSequence] = useState([]);
    const [playerSeq, setPlayerSeq] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePad, setActivePad] = useState(null);
    const [score, setScore] = useState(0);

    const nextRound = (currentSeq) => {
        const newSeq = [...currentSeq, Math.floor(Math.random() * 4)];
        setSequence(newSeq);
        setPlayerSeq([]);
        playSequence(newSeq);
    };

    const startGame = () => {
        setScore(0);
        setIsPlaying(true);
        nextRound([]);
    };

    const playSequence = (seq) => {
        setIsPlaying(false); // disable input
        let i = 0;
        const interval = setInterval(() => {
            setActivePad(seq[i]);
            setTimeout(() => setActivePad(null), 400);
            i++;
            if (i >= seq.length) {
                clearInterval(interval);
                setIsPlaying(true); // enable input
            }
        }, 800);
    };

    const handlePress = (index) => {
        if (!isPlaying) return;
        const newPlayerSeq = [...playerSeq, index];
        setPlayerSeq(newPlayerSeq);
        setActivePad(index);
        setTimeout(() => setActivePad(null), 200);

        if (newPlayerSeq[newPlayerSeq.length - 1] !== sequence[newPlayerSeq.length - 1]) {
            // Game Over
            setIsPlaying(false);
            setSequence([]);
        } else if (newPlayerSeq.length === sequence.length) {
            // Success
            setScore(s => s + 1);
            setTimeout(() => nextRound(sequence), 1000);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.score}>Score: {score}</Text>
            {sequence.length === 0 && score > 0 && <Text style={styles.gameOver}>Game Over!</Text>}
            
            <View style={styles.padGrid}>
                {PAD_COLORS.map((color, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={1}
                        style={[
                            styles.pad,
                            { backgroundColor: color, opacity: activePad === i ? 1 : 0.5 }
                        ]}
                        onPress={() => handlePress(i)}
                    />
                ))}
            </View>

            {sequence.length === 0 && (
                <TouchableOpacity style={styles.btn} onPress={startGame}>
                    <Text style={styles.btnText}>Start Game</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    score: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    gameOver: { fontSize: 20, color: COLORS.primary, marginBottom: 20 },
    padGrid: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    pad: { width: 140, height: 140, borderRadius: 20 },
    btn: { marginTop: 40, padding: 15, backgroundColor: COLORS.darkBg, borderRadius: 10, width: 200, alignItems: 'center' },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default SimonSays;
