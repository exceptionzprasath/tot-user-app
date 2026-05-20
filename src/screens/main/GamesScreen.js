import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    SafeAreaView,
    StatusBar,
    Platform,
    Image,
    Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../../utils/colors';

// Import games
import TicTacToe from '../../components/games/TicTacToe';
import RockPaperScissors from '../../components/games/RockPaperScissors';
import MemoryMatch from '../../components/games/MemoryMatch';
import ColorMatch from '../../components/games/ColorMatch';
import ReactionTimer from '../../components/games/ReactionTimer';
import MathQuiz from '../../components/games/MathQuiz';
import DiceRoller from '../../components/games/DiceRoller';
import ClickCounter from '../../components/games/ClickCounter';
import GuessNumber from '../../components/games/GuessNumber';
import WordScramble from '../../components/games/WordScramble';
import SimonSays from '../../components/games/SimonSays';
import TypingTest from '../../components/games/TypingTest';
import SlidePuzzle from '../../components/games/SlidePuzzle';
import HigherLower from '../../components/games/HigherLower';
import MiniMinesweeper from '../../components/games/MiniMinesweeper';
import Hangman from '../../components/games/Hangman';
import SimpleBlackjack from '../../components/games/SimpleBlackjack';
import BubblePopper from '../../components/games/BubblePopper';
import TriviaQuiz from '../../components/games/TriviaQuiz';
import PairFinder from '../../components/games/PairFinder';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

const gamesList = [
    { id: '1', title: 'Tic Tac Toe', icon: 'grid', component: TicTacToe },
    { id: '2', title: 'Rock Paper Scissors', icon: 'hand-left', component: RockPaperScissors },
    { id: '3', title: 'Memory Match', icon: 'apps', component: MemoryMatch },
    { id: '4', title: 'Color Match', icon: 'color-palette', component: ColorMatch },
    { id: '5', title: 'Reaction Timer', icon: 'stopwatch', component: ReactionTimer },
    { id: '6', title: 'Math Quiz', icon: 'calculator', component: MathQuiz },
    { id: '7', title: 'Dice Roller', icon: 'cube', component: DiceRoller },
    { id: '8', title: 'Fastest Clicker', icon: 'flash', component: ClickCounter },
    { id: '9', title: 'Guess Number', icon: 'help', component: GuessNumber },
    { id: '10', title: 'Word Scramble', icon: 'text', component: WordScramble },
    { id: '11', title: 'Simon Says', icon: 'color-filter', component: SimonSays },
    { id: '12', title: 'Typing Test', icon: 'keypad', component: TypingTest },
    { id: '13', title: 'Slide Puzzle', icon: 'swap-horizontal', component: SlidePuzzle },
    { id: '14', title: 'Higher or Lower', icon: 'arrow-up-circle', component: HigherLower },
    { id: '15', title: 'Mini Minesweeper', icon: 'warning', component: MiniMinesweeper },
    { id: '16', title: 'Hangman', icon: 'body', component: Hangman },
    { id: '17', title: 'Simple 21', icon: 'layers', component: SimpleBlackjack },
    { id: '18', title: 'Bubble Popper', icon: 'radio-button-off', component: BubblePopper },
    { id: '19', title: 'Trivia Quiz', icon: 'school', component: TriviaQuiz },
    { id: '20', title: 'Pair Finder', icon: 'search', component: PairFinder },
];

const banners = [
    { id: 'gb1', image: require('../../assets/game-1.jpeg') },
    { id: 'gb2', image: require('../../assets/game-2.jpeg') },
    { id: 'gb3', image: require('../../assets/game-3.jpeg') },
    { id: 'gb4', image: require('../../assets/game-4.jpeg') },
    { id: 'gb5', image: require('../../assets/game-5.jpeg') },
];

const BannerCarousel = () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const bannerRef = React.useRef(null);

    React.useEffect(() => {
        if (banners.length <= 1) return;

        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % banners.length;
            if (bannerRef.current) {
                bannerRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setCurrentIndex(nextIndex);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <View style={styles.bannersSection}>
            <FlatList
                ref={bannerRef}
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                decelerationRate="fast"
                snapToInterval={width}
                snapToAlignment="start"
                initialNumToRender={banners.length}
                getItemLayout={(data, index) => (
                    { length: width, offset: width * index, index }
                )}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const index = Math.round(x / width);
                    if (index >= 0 && index < banners.length && index !== currentIndex) {
                        setCurrentIndex(index);
                    }
                }}
                scrollEventThrottle={16}
                renderItem={({ item }) => (
                    <View style={styles.bannerContainer}>
                        <Image
                            source={item.image}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>
                )}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        bannerRef.current?.scrollToIndex({ index: info.index, animated: true });
                    }, 500);
                }}
            />
            <View style={styles.bannerPagination}>
                {banners.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            currentIndex === index && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const GamesScreen = () => {
    const [selectedGame, setSelectedGame] = useState(null);

    const renderGameItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gameCard}
            onPress={() => setSelectedGame(item)}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Icon name={item.icon} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.gameTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 15 }]}>
                <Text style={styles.headerTitle}>Mini Games</Text>
                <Text style={styles.headerSubtitle}>Take a break and play!</Text>
            </View>

            <BannerCarousel />

            <FlatList
                data={gamesList}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={renderGameItem}
                columnWrapperStyle={styles.row}
            />

            <Modal
                visible={!!selectedGame}
                animationType="slide"
                onRequestClose={() => setSelectedGame(null)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setSelectedGame(null)} style={styles.backButton}>
                            <Icon name="close" size={28} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{selectedGame?.title}</Text>
                        <View style={{ width: 28 }} />
                    </View>
                    <View style={styles.gameContainer}>
                        {selectedGame && <selectedGame.component />}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.darkBg,
        paddingHorizontal: SIZES.padding,
        paddingBottom: SIZES.paddingL,
    },
    headerTitle: {
        fontSize: SIZES.xxlarge,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: SIZES.medium,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.padding,
    },
    gameCard: {
        width: '47%',
        backgroundColor: COLORS.cardBackground,
        borderRadius: SIZES.radiusLarge,
        padding: SIZES.padding,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.paddingS,
    },
    gameTitle: {
        fontSize: SIZES.medium,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray,
    },
    backButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: SIZES.large,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    gameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannersSection: {
        width: width,
        height: 180,
        marginBottom: SIZES.padding,
        marginTop: SIZES.paddingS,
    },
    bannerContainer: {
        width: width,
        height: 180,
        paddingHorizontal: SIZES.padding,
    },
    bannerImage: {
        width: width - SIZES.padding * 2,
        height: '100%',
        borderRadius: SIZES.radiusLarge,
    },
    bannerPagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        width: '100%',
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    paginationDotActive: {
        backgroundColor: COLORS.primary,
        width: 12,
    },
});

export default GamesScreen;
