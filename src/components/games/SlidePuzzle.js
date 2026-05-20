import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const SlidePuzzle = () => {
    const [board, setBoard] = useState([]);
    const [moves, setMoves] = useState(0);

    const initialize = () => {
        let arr = [1, 2, 3, 4, 5, 6, 7, 8, null];
        // simple shuffle
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setBoard(arr);
        setMoves(0);
    };

    useEffect(() => { initialize(); }, []);

    const isSolved = () => {
        for (let i = 0; i < 8; i++) {
            if (board[i] !== i + 1) return false;
        }
        return true;
    };

    const handlePress = (index) => {
        const emptyIndex = board.indexOf(null);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;

        if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1) {
            const newBoard = [...board];
            newBoard[emptyIndex] = newBoard[index];
            newBoard[index] = null;
            setBoard(newBoard);
            setMoves(m => m + 1);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.moves}>Moves: {moves}</Text>
            {isSolved() && board.length > 0 && <Text style={styles.win}>Puzzle Solved!</Text>}

            <View style={styles.grid}>
                {board.map((num, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.tile, !num && styles.emptyTile]}
                        onPress={() => handlePress(i)}
                        disabled={!num}
                    >
                        {num && <Text style={styles.tileText}>{num}</Text>}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={initialize}>
                <Text style={styles.btnText}>Shuffle</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    moves: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    win: { fontSize: 24, color: COLORS.success, fontWeight: 'bold', marginBottom: 20 },
    grid: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: COLORS.darkGray, padding: 5, borderRadius: 10 },
    tile: { width: 90, height: 90, backgroundColor: COLORS.primary, margin: 3, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    emptyTile: { backgroundColor: 'transparent' },
    tileText: { fontSize: 36, color: COLORS.white, fontWeight: 'bold' },
    btn: { marginTop: 40, padding: 15, backgroundColor: COLORS.darkBg, borderRadius: 10, width: 200, alignItems: 'center' },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default SlidePuzzle;
