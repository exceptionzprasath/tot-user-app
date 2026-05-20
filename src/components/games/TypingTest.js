import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const SENTENCES = [
    "The quick brown fox jumps over the lazy dog",
    "React Native is a great framework for mobile apps",
    "Thambi Oru Tea delivers the best tea in town",
    "Practice makes perfect when learning to type fast",
    "Keep pushing forward and never give up on your dreams"
];

const TypingTest = () => {
    const [sentence, setSentence] = useState('');
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const inputRef = useRef(null);

    const startGame = () => {
        setSentence(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
        setInput('');
        setStartTime(Date.now());
        setIsFinished(false);
        setWpm(0);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    useEffect(() => {
        if (input.length > 0 && input === sentence && !isFinished) {
            setIsFinished(true);
            const timeTaken = (Date.now() - startTime) / 60000; // minutes
            const words = sentence.split(' ').length;
            setWpm(Math.round(words / timeTaken));
        }
    }, [input]);

    const renderText = () => {
        return sentence.split('').map((char, index) => {
            let color = COLORS.textSecondary;
            if (index < input.length) {
                color = input[index] === char ? COLORS.success : COLORS.error;
            }
            return <Text key={index} style={{ color, fontSize: 24 }}>{char}</Text>;
        });
    };

    return (
        <View style={styles.container}>
            {sentence ? (
                <>
                    <View style={styles.textDisplay}>{renderText()}</View>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isFinished}
                    />
                    {isFinished && (
                        <View style={styles.resultBox}>
                            <Text style={styles.wpm}>WPM: {wpm}</Text>
                            <TouchableOpacity style={styles.btn} onPress={startGame}>
                                <Text style={styles.btnText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            ) : (
                <TouchableOpacity style={styles.btn} onPress={startGame}>
                    <Text style={styles.btnText}>Start Typing Test</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    textDisplay: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30, backgroundColor: COLORS.white, padding: 20, borderRadius: 10, elevation: 2 },
    input: { width: '100%', borderWidth: 2, borderColor: COLORS.primary, padding: 15, fontSize: 18, borderRadius: 10, marginBottom: 20 },
    resultBox: { alignItems: 'center', marginTop: 20 },
    wpm: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
    btn: { paddingHorizontal: 30, paddingVertical: 15, backgroundColor: COLORS.darkBg, borderRadius: 10 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default TypingTest;
