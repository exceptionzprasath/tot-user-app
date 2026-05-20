import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const MemoryMatch = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);

    const initializeGame = () => {
        const shuffled = [...EMOJIS, ...EMOJIS]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji }));
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
    };

    useEffect(() => { initializeGame(); }, []);

    useEffect(() => {
        if (flipped.length === 2) {
            const [a, b] = flipped;
            if (cards[a].emoji === cards[b].emoji) {
                setMatched(prev => [...prev, a, b]);
            }
            setTimeout(() => setFlipped([]), 1000);
            setMoves(m => m + 1);
        }
    }, [flipped]);

    const handleFlip = (index) => {
        if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
            setFlipped([...flipped, index]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.moves}>Moves: {moves}</Text>
            {matched.length === cards.length && cards.length > 0 && <Text style={styles.win}>You Win!</Text>}
            
            <View style={styles.board}>
                {cards.map((card, index) => {
                    const isVisible = flipped.includes(index) || matched.includes(index);
                    return (
                        <TouchableOpacity
                            key={card.id}
                            style={[styles.card, isVisible ? styles.cardVisible : styles.cardHidden]}
                            onPress={() => handleFlip(index)}
                        >
                            <Text style={styles.cardText}>{isVisible ? card.emoji : '❓'}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={initializeGame}>
                <Text style={styles.resetText}>Restart</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center' },
    moves: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    win: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold', marginBottom: 10 },
    board: { width: 320, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    card: { width: 70, height: 70, margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    cardHidden: { backgroundColor: COLORS.primary },
    cardVisible: { backgroundColor: COLORS.lightGray, borderWidth: 1, borderColor: '#ccc' },
    cardText: { fontSize: 32 },
    resetBtn: { marginTop: 20, padding: 15, backgroundColor: COLORS.darkBg, borderRadius: 10 },
    resetText: { color: COLORS.white, fontWeight: 'bold' }
});

export default MemoryMatch;
