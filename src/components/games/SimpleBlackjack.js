import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const SimpleBlackjack = () => {
    const [playerTotal, setPlayerTotal] = useState(0);
    const [dealerTotal, setDealerTotal] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [msg, setMsg] = useState('');

    const start = () => {
        setPlayerTotal(drawCard() + drawCard());
        setDealerTotal(drawCard());
        setGameOver(false);
        setMsg('');
    };

    const drawCard = () => Math.floor(Math.random() * 10) + 1; // Simplification (1-10)

    const hit = () => {
        const newTotal = playerTotal + drawCard();
        setPlayerTotal(newTotal);
        if (newTotal > 21) {
            setMsg('Bust! You Lose.');
            setGameOver(true);
        }
    };

    const stand = () => {
        let dt = dealerTotal;
        while (dt < 17) {
            dt += drawCard();
        }
        setDealerTotal(dt);
        setGameOver(true);
        
        if (dt > 21) setMsg('Dealer Busts! You Win!');
        else if (dt > playerTotal) setMsg('Dealer Wins.');
        else if (dt < playerTotal) setMsg('You Win!');
        else setMsg('Push (Tie).');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Simple 21</Text>

            <View style={styles.table}>
                <View style={styles.hand}>
                    <Text style={styles.handTitle}>Dealer</Text>
                    <Text style={styles.score}>{dealerTotal}</Text>
                </View>

                <View style={styles.hand}>
                    <Text style={styles.handTitle}>You</Text>
                    <Text style={styles.score}>{playerTotal}</Text>
                </View>
            </View>

            <Text style={styles.msg}>{msg}</Text>

            {!gameOver ? (
                playerTotal > 0 ? (
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.blue }]} onPress={hit}>
                            <Text style={styles.btnText}>Hit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.warning }]} onPress={stand}>
                            <Text style={styles.btnText}>Stand</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.btn, { width: 200 }]} onPress={start}>
                        <Text style={styles.btnText}>Deal Cards</Text>
                    </TouchableOpacity>
                )
            ) : (
                <TouchableOpacity style={[styles.btn, { width: 200, backgroundColor: COLORS.success }]} onPress={start}>
                    <Text style={styles.btnText}>Play Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
    table: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 40 },
    hand: { alignItems: 'center', padding: 20, backgroundColor: COLORS.white, borderRadius: 10, elevation: 3, width: 120 },
    handTitle: { fontSize: 18, color: COLORS.textSecondary, marginBottom: 10 },
    score: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary },
    msg: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, height: 35 },
    row: { flexDirection: 'row', gap: 20 },
    btn: { padding: 15, backgroundColor: COLORS.primary, borderRadius: 10, alignItems: 'center', width: 120 },
    btnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default SimpleBlackjack;
