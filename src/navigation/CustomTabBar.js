import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../utils/colors';

const { width } = Dimensions.get('window');
const BASE_TAB_BAR_HEIGHT = 70;
const CURVE_WIDTH = 110;
const CENTER_BUTTON_SIZE = 75;

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const [animStep, setAnimStep] = React.useState(1);

    // Total height includes the bottom safe area/button navigation height
    const totalHeight = BASE_TAB_BAR_HEIGHT + insets.bottom;

    return (
        <View style={[styles.container, { height: totalHeight }]}>
            <View style={styles.svgWrapper}>
                <Svg
                    width={width}
                    height={totalHeight}
                    viewBox={`0 0 ${width} ${totalHeight}`}>
                    <Path
                        d={`M0 20 
                           L${(width - CURVE_WIDTH) / 2} 20 
                           C${(width - CURVE_WIDTH) / 2 + 25} 20, ${(width - CURVE_WIDTH) / 2 + 15} ${BASE_TAB_BAR_HEIGHT * 0.85}, ${(width - CURVE_WIDTH) / 2 + CURVE_WIDTH / 2} ${BASE_TAB_BAR_HEIGHT * 0.85} 
                           C${(width - CURVE_WIDTH) / 2 + CURVE_WIDTH - 15} ${BASE_TAB_BAR_HEIGHT * 0.85}, ${(width - CURVE_WIDTH) / 2 + CURVE_WIDTH - 25} 20, ${(width - CURVE_WIDTH) / 2 + CURVE_WIDTH} 20 
                           L${width} 20 L${width} ${totalHeight} L0 ${totalHeight} Z`}
                        fill={COLORS.primary}
                    />
                </Svg>
            </View>

            <View style={[styles.tabsWrapper, { height: BASE_TAB_BAR_HEIGHT, paddingBottom: 0 }]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    let iconName;
                    switch (route.name) {
                        case 'Menu': iconName = isFocused ? 'home' : 'home-outline'; break;
                        case 'Favorites': iconName = isFocused ? 'heart' : 'heart-outline'; break;
                        case 'Orders': iconName = isFocused ? 'receipt' : 'receipt-outline'; break;
                        case 'Profile': iconName = isFocused ? 'person' : 'person-outline'; break;
                        default: iconName = 'help-outline';
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.7}
                            onPress={onPress}
                            style={[
                                styles.tabItem,
                                index === 1 && { marginRight: CURVE_WIDTH / 2 },
                                index === 2 && { marginLeft: CURVE_WIDTH / 2 },
                            ]}>
                            <Icon
                                name={iconName}
                                size={26}
                                color={isFocused ? COLORS.secondary : 'rgba(255, 255, 255, 0.7)'}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={[styles.centerButton, { top: -CENTER_BUTTON_SIZE / 2 + 8 }]}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Menu')}
            >
                <View style={styles.lottieWrapper}>
                    {animStep === 1 ? (
                        <LottieView
                            source={require('../assets/tot-2.json')}
                            autoPlay
                            loop={false}
                            onAnimationFinish={() => setAnimStep(2)}
                            style={styles.lottie}
                        />
                    ) : (
                        <LottieView
                            source={require('../assets/Order now.json')}
                            autoPlay
                            loop={false}
                            onAnimationFinish={() => setAnimStep(1)}
                            style={styles.lottieSecondary}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: width,
        backgroundColor: 'transparent',
    },
    svgWrapper: {
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
    },
    tabsWrapper: {
        flexDirection: 'row',
        width: width,
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 2,
        marginTop: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    centerButton: {
        position: 'absolute',
        left: (width - CENTER_BUTTON_SIZE) / 2,
        width: CENTER_BUTTON_SIZE,
        height: CENTER_BUTTON_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    lottieWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: CENTER_BUTTON_SIZE * 1.5,
        height: CENTER_BUTTON_SIZE * 1.5,
    },
    lottieSecondary: {
        width: CENTER_BUTTON_SIZE * 2.2,
        height: CENTER_BUTTON_SIZE * 2.2,
    },
});

export default CustomTabBar;
