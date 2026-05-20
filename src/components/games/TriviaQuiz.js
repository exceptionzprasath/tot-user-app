import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const QUESTIONS = [
    { q: 'What is the capital of France?', opts: ['London', 'Berlin', 'Paris', 'Madrid'], a: 'Paris' },
    { q: 'What is 8 + 5?', opts: ['12', '13', '14', '15'], a: '13' },
    { q: 'Which planet is known as the Red Planet?', opts: ['Earth', 'Mars', 'Jupiter', 'Venus'], a: 'Mars' },
    { q: 'Who wrote "Hamlet"?', opts: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'], a: 'William Shakespeare' },
    { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 'Pacific' },
    { q: 'What is the chemical symbol for Gold?', opts: ['Ag', 'Au', 'Pb', 'Fe'], a: 'Au' },
    { q: 'Which animal is known as the King of the Jungle?', opts: ['Tiger', 'Elephant', 'Lion', 'Bear'], a: 'Lion' },
    { q: 'How many continents are there?', opts: ['5', '6', '7', '8'], a: '7' }
];

const TriviaQuiz = () => {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    
    // Pick 5 random questions once per game
    const [quizSet] = useState(() => [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5));

    const handleAnswer = (opt) => {
        if (opt === quizSet[currentQ].a) {
            setScore(s => s + 1);
        }
        
        if (currentQ < quizSet.length - 1) {
            setCurrentQ(c => c + 1);
        } else {
            setShowResult(true);
        }
    };

    const restart = () => {
        // Simple reload trick for a new set of questions - we'll just reset indices for simplicity, 
        // to properly get new questions we would reset state, but since state init happens once,
        // we'll just replay the same 5 in this simple version, or we can just keep playing.
        setCurrentQ(0);
        setScore(0);
        setShowResult(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trivia Quiz</Text>
            
            {showResult ? (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>You scored {score} out of {quizSet.length}!</Text>
                    <TouchableOpacity style={styles.btn} onPress={restart}>
                        <Text style={styles.btnText}>Play Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={styles.progress}>Question {currentQ + 1} of {quizSet.length}</Text>
                    <View style={styles.qCard}>
                        <Text style={styles.qText}>{quizSet[currentQ].q}</Text>
                    </View>

                    <View style={styles.opts}>
                        {quizSet[currentQ].opts.map((opt, i) => (
                            <TouchableOpacity key={i} style={styles.optBtn} onPress={() => handleAnswer(opt)}>
                                <Text style={styles.optText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    progress: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 20 },
    qCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 15, elevation: 3, width: '100%', marginBottom: 30 },
    qText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
    opts: { width: '100%', gap: 15 },
    optBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    optText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    resultBox: { alignItems: 'center', marginTop: 50 },
    resultText: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
    btn: { backgroundColor: COLORS.darkBg, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 10 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default TriviaQuiz;
