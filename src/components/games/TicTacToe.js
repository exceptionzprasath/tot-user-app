import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS, SIZES } from '../../utils/colors';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handlePress = (index) => {
        if (board[index] || checkWinner(board)) return;
        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsXNext(!isXNext);
    };

    const winner = checkWinner(board);
    const status = winner ? `Winner: ${winner}` : board.every(s => s) ? 'Draw!' : `Next player: ${isXNext ? 'X' : 'O'}`;

    return (
        <View style={styles.container}>
            <Text style={styles.status}>{status}</Text>
            <View style={styles.board}>
                {board.map((cell, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.cell}
                        onPress={() => handlePress(index)}
                    >
                        <Text style={[styles.cellText, { color: cell === 'X' ? COLORS.primary : COLORS.blue }]}>{cell}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={() => setBoard(Array(9).fill(null))}>
                <Text style={styles.resetText}>Restart Game</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center' },
    status: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    board: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
        width: 100, height: 100,
        borderWidth: 1, borderColor: '#333',
        justifyContent: 'center', alignItems: 'center'
    },
    cellText: { fontSize: 40, fontWeight: 'bold' },
    resetBtn: { marginTop: 30, padding: 15, backgroundColor: COLORS.primary, borderRadius: 10 },
    resetText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default TicTacToe;
