import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const ICONS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍'];

const PairFinder = () => {
    const [grid, setGrid] = useState([]);
    const [target, setTarget] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isPlaying, setIsPlaying] = useState(false);

    const generateGrid = () => {
        // Pick a target
        const t = ICONS[Math.floor(Math.random() * ICONS.length)];
        setTarget(t);

        // Fill grid with random icons
        let arr = [];
        for (let i = 0; i < 15; i++) {
            let r;
            do { r = ICONS[Math.floor(Math.random() * ICONS.length)]; } while (r === t);
            arr.push(r);
        }
        // Insert exactly one target
        arr.push(t);
        arr.sort(() => Math.random() - 0.5);
        setGrid(arr);
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(15);
        setIsPlaying(true);
        generateGrid();
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

    const handleTap = (icon) => {
        if (!isPlaying) return;
        if (icon === target) {
            setScore(s => s + 1);
            generateGrid();
        } else {
            setScore(s => Math.max(0, s - 1));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stats}>Score: {score}</Text>
                <Text style={styles.stats}>Time: {timeLeft}s</Text>
            </View>

            {isPlaying ? (
                <>
                    <Text style={styles.instruction}>Find the: <Text style={styles.targetIcon}>{target}</Text></Text>
                    <View style={styles.gridContainer}>
                        {grid.map((icon, i) => (
                            <TouchableOpacity key={i} style={styles.tile} onPress={() => handleTap(icon)}>
                                <Text style={styles.icon}>{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            ) : (
                <View style={styles.center}>
                    <Text style={styles.gameOver}>{timeLeft === 0 ? 'Game Over!' : 'Pair Finder'}</Text>
                    {timeLeft === 0 && <Text style={styles.finalScore}>Final Score: {score}</Text>}
                    <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                        <Text style={styles.startText}>{timeLeft === 0 ? 'Play Again' : 'Start'}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    stats: { fontSize: 20, fontWeight: 'bold' },
    instruction: { fontSize: 24, marginBottom: 30, color: COLORS.textSecondary },
    targetIcon: { fontSize: 32, color: COLORS.textPrimary },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, width: 300 },
    tile: { width: 60, height: 60, backgroundColor: COLORS.white, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    icon: { fontSize: 30 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    gameOver: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
    finalScore: { fontSize: 20, marginBottom: 30 },
    startBtn: { padding: 15, backgroundColor: COLORS.primary, borderRadius: 10, width: 200, alignItems: 'center' },
    startText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default PairFinder;
