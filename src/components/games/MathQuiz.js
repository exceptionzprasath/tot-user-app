import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const MathQuiz = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [answer, setAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);

    const generateQuestion = () => {
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let a = Math.floor(Math.random() * 12) + 1;
        let b = Math.floor(Math.random() * 12) + 1;
        if (op === '*') { a = Math.floor(Math.random() * 10); b = Math.floor(Math.random() * 10); }
        if (op === '-' && a < b) { const temp = a; a = b; b = temp; }
        
        let ans;
        if (op === '+') ans = a + b;
        else if (op === '-') ans = a - b;
        else ans = a * b;

        setQuestion(`${a} ${op} ${b} = ?`);
        setAnswer(ans);

        let opts = new Set([ans]);
        while (opts.size < 4) {
            opts.add(ans + Math.floor(Math.random() * 10) - 5);
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        generateQuestion();
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

    const handleAnswer = (opt) => {
        if (!isPlaying) return;
        if (opt === answer) setScore(s => s + 1);
        generateQuestion();
    };

    return (
        <View style={styles.container}>
            <View style={styles.stats}>
                <Text style={styles.statText}>Score: {score}</Text>
                <Text style={styles.statText}>Time: {timeLeft}s</Text>
            </View>

            {isPlaying ? (
                <>
                    <View style={styles.qCard}>
                        <Text style={styles.qText}>{question}</Text>
                    </View>
                    <View style={styles.optRow}>
                        {options.map((opt, i) => (
                            <TouchableOpacity key={i} style={styles.optBtn} onPress={() => handleAnswer(opt)}>
                                <Text style={styles.optText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            ) : (
                <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                    <Text style={styles.startText}>{timeLeft === 0 ? 'Play Again' : 'Start Quiz'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    stats: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
    statText: { fontSize: 20, fontWeight: 'bold' },
    qCard: { padding: 40, backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 40, elevation: 5 },
    qText: { fontSize: 40, fontWeight: 'bold' },
    optRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
    optBtn: { width: '48%', backgroundColor: COLORS.blue, padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
    optText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
    startBtn: { padding: 20, backgroundColor: COLORS.primary, borderRadius: 10, marginTop: 50 },
    startText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' }
});

export default MathQuiz;
