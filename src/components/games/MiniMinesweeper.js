import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const GRID_SIZE = 5;
const NUM_MINES = 4;

const MiniMinesweeper = () => {
    const [board, setBoard] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [revealedCount, setRevealedCount] = useState(0);

    const initialize = () => {
        let newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ isMine: false, revealed: false, adjacent: 0 }));
        let minesPlaced = 0;
        
        while (minesPlaced < NUM_MINES) {
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (!newBoard[r][c].isMine) {
                newBoard[r][c] = { ...newBoard[r][c], isMine: true };
                minesPlaced++;
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!newBoard[r][c].isMine) {
                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (r + i >= 0 && r + i < GRID_SIZE && c + j >= 0 && c + j < GRID_SIZE) {
                                if (newBoard[r+i][c+j].isMine) count++;
                            }
                        }
                    }
                    newBoard[r][c] = { ...newBoard[r][c], adjacent: count };
                }
            }
        }

        setBoard(newBoard);
        setGameOver(false);
        setWin(false);
        setRevealedCount(0);
    };

    useEffect(() => { initialize(); }, []);

    const handlePress = (r, c) => {
        if (gameOver || win || board[r][c].revealed) return;
        
        const newBoard = [...board.map(row => [...row])];
        
        if (newBoard[r][c].isMine) {
            // Reveal all
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    newBoard[i][j].revealed = true;
                }
            }
            setBoard(newBoard);
            setGameOver(true);
            return;
        }
        
        // Simple reveal (not flood fill for brevity, just single tile)
        newBoard[r][c].revealed = true;
        setBoard(newBoard);
        setRevealedCount(rc => rc + 1);

        if (revealedCount + 1 === GRID_SIZE * GRID_SIZE - NUM_MINES) {
            setWin(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mini Minesweeper</Text>
            {gameOver && <Text style={styles.loseMsg}>BOOM! You hit a mine.</Text>}
            {win && <Text style={styles.winMsg}>You Cleared It!</Text>}

            <View style={styles.grid}>
                {board.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((cell, c) => (
                            <TouchableOpacity
                                key={`${r}-${c}`}
                                style={[styles.cell, cell.revealed ? styles.revealed : styles.hidden]}
                                onPress={() => handlePress(r, c)}
                                disabled={gameOver || win || cell.revealed}
                            >
                                {cell.revealed && (
                                    <Text style={[styles.cellText, { color: cell.isMine ? COLORS.error : COLORS.primary }]}>
                                        {cell.isMine ? '💣' : cell.adjacent > 0 ? cell.adjacent : ''}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.btn} onPress={initialize}>
                <Text style={styles.btnText}>Restart</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    loseMsg: { fontSize: 20, color: COLORS.error, fontWeight: 'bold', marginBottom: 20 },
    winMsg: { fontSize: 20, color: COLORS.success, fontWeight: 'bold', marginBottom: 20 },
    grid: { backgroundColor: COLORS.mediumGray, padding: 2 },
    row: { flexDirection: 'row' },
    cell: { width: 50, height: 50, margin: 2, justifyContent: 'center', alignItems: 'center' },
    hidden: { backgroundColor: COLORS.primary },
    revealed: { backgroundColor: COLORS.white },
    cellText: { fontSize: 24, fontWeight: 'bold' },
    btn: { marginTop: 30, padding: 15, backgroundColor: COLORS.darkBg, borderRadius: 10 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default MiniMinesweeper;
