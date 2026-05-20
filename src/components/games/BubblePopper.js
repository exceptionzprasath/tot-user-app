import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

const BubblePopper = () => {
    const [bubbles, setBubbles] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isPlaying, setIsPlaying] = useState(false);

    const startGame = () => {
        setScore(0);
        setTimeLeft(15);
        setIsPlaying(true);
        setBubbles([]);
    };

    useEffect(() => {
        let timer;
        let spawner;
        if (isPlaying && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            spawner = setInterval(() => {
                setBubbles(prev => {
                    if (prev.length > 5) return prev; // max 6 bubbles on screen
                    const newBubble = {
                        id: Math.random().toString(),
                        x: Math.random() * (width - 100) + 20,
                        y: Math.random() * (height - 300) + 100,
                        size: Math.random() * 40 + 40,
                    };
                    return [...prev, newBubble];
                });
            }, 600);
        } else if (timeLeft === 0) {
            setIsPlaying(false);
            setBubbles([]);
        }
        return () => {
            clearTimeout(timer);
            clearInterval(spawner);
        };
    }, [timeLeft, isPlaying]);

    const pop = (id) => {
        if (!isPlaying) return;
        setBubbles(prev => prev.filter(b => b.id !== id));
        setScore(s => s + 1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stats}>Score: {score}</Text>
                <Text style={styles.stats}>Time: {timeLeft}s</Text>
            </View>

            <View style={styles.playArea}>
                {bubbles.map(b => (
                    <TouchableOpacity
                        key={b.id}
                        style={[styles.bubble, { left: b.x, top: b.y, width: b.size, height: b.size, borderRadius: b.size/2 }]}
                        onPress={() => pop(b.id)}
                        activeOpacity={0.5}
                    />
                ))}
            </View>

            {!isPlaying && (
                <View style={styles.overlay}>
                    <Text style={styles.gameOver}>{timeLeft === 0 ? 'Time Up!' : 'Bubble Popper'}</Text>
                    <TouchableOpacity style={styles.btn} onPress={startGame}>
                        <Text style={styles.btnText}>{timeLeft === 0 ? 'Play Again' : 'Start'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, zIndex: 10 },
    stats: { fontSize: 20, fontWeight: 'bold' },
    playArea: { flex: 1, position: 'relative' },
    bubble: { position: 'absolute', backgroundColor: 'rgba(211, 47, 47, 0.6)', borderWidth: 2, borderColor: COLORS.primary },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' },
    gameOver: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, color: COLORS.primary },
    btn: { padding: 15, backgroundColor: COLORS.primary, borderRadius: 10, width: 200, alignItems: 'center' },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default BubblePopper;
