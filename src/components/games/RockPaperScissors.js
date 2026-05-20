import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../utils/colors';

const CHOICES = ['rock', 'paper', 'scissors'];

const getIcon = (choice) => {
    if (choice === 'rock') return 'ellipse';
    if (choice === 'paper') return 'document';
    return 'cut';
};

const RockPaperScissors = () => {
    const [userChoice, setUserChoice] = useState(null);
    const [compChoice, setCompChoice] = useState(null);
    const [result, setResult] = useState('Make your move!');

    const play = (choice) => {
        const cChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        setUserChoice(choice);
        setCompChoice(cChoice);

        if (choice === cChoice) setResult('Draw!');
        else if (
            (choice === 'rock' && cChoice === 'scissors') ||
            (choice === 'paper' && cChoice === 'rock') ||
            (choice === 'scissors' && cChoice === 'paper')
        ) {
            setResult('You Win! 🎉');
        } else {
            setResult('You Lose! 😢');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.result}>{result}</Text>
            
            {userChoice && compChoice && (
                <View style={styles.matchup}>
                    <View style={styles.playerCard}>
                        <Text>You</Text>
                        <Icon name={getIcon(userChoice)} size={50} color={COLORS.primary} />
                    </View>
                    <Text style={{fontSize: 30, fontWeight: 'bold'}}>VS</Text>
                    <View style={styles.playerCard}>
                        <Text>Comp</Text>
                        <Icon name={getIcon(compChoice)} size={50} color={COLORS.darkGray} />
                    </View>
                </View>
            )}

            <View style={styles.choices}>
                {CHOICES.map(c => (
                    <TouchableOpacity key={c} style={styles.btn} onPress={() => play(c)}>
                        <Icon name={getIcon(c)} size={40} color={COLORS.white} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center' },
    result: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
    matchup: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 40 },
    playerCard: { alignItems: 'center' },
    choices: { flexDirection: 'row', gap: 15 },
    btn: { padding: 20, backgroundColor: COLORS.primary, borderRadius: 50 }
});

export default RockPaperScissors;
