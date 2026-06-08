import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES, SHADOWS } from '../utils/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - SIZES.padding * 2 - SIZES.paddingS) / 2;

const ProductCard = ({ item, onAddToCart, onRemoveFromCart, quantity = 0, isFavorite, onToggleFavorite, layout = 'grid', isFreeTeaEligible = false, onBulkOrderPress }) => {
    const isList = layout === 'list';

    return (
        <View style={[styles.container, isList && styles.containerList]}>
            {/* Image Section */}
            <View style={[styles.imageContainer, isList && styles.imageContainerList]}>
                <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.image} />
                {!item.available && (
                    <View style={styles.unavailableOverlay}>
                        <Text style={styles.unavailableText}>Out of Stock</Text>
                    </View>
                )}

                {/* Favorite Button - Adjusted for List */}
                {onToggleFavorite && (
                    <TouchableOpacity
                        style={[styles.favoriteButton, isList && styles.favoriteButtonList]}
                        onPress={onToggleFavorite}
                        activeOpacity={0.7}>
                        <Icon
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={isList ? 22 : 20}
                            color={isFavorite ? COLORS.error : COLORS.white}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Content Section */}
            <View style={[styles.content, isList && styles.contentList]}>
                <View style={isList && styles.headerList}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.description} numberOfLines={isList ? 3 : 2}>{item.description}</Text>
                </View>

                <View style={[styles.footer, isList && styles.footerList]}>
                    {isFreeTeaEligible && item.id === 'item_001' ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[styles.price, { textDecorationLine: 'line-through', color: COLORS.mediumGray, fontSize: SIZES.regular }]}>₹15</Text>
                            <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#C8E6C9' }}>
                                <Text style={{ color: '#2E7D32', fontWeight: '800', fontSize: SIZES.xs, letterSpacing: 0.5 }}>FREE</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.price}>₹{item.price}</Text>
                    )}

                    {quantity > 0 ? (
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={onRemoveFromCart}>
                                <Icon name="remove" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.addMoreButton}
                                onPress={onAddToCart}>
                                <Icon name="add" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.addButton, !item.available && styles.addButtonDisabled]}
                            onPress={onAddToCart}
                            disabled={!item.available}>
                            <Icon name="add" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        marginBottom: SIZES.paddingS,
        ...SHADOWS.small,
    },
    containerList: {
        flexDirection: 'row',
        height: 120,
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 110,
        backgroundColor: COLORS.lightGray,
    },
    imageContainerList: {
        width: 120,
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    unavailableOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableText: {
        fontSize: SIZES.small,
        fontWeight: '600',
        color: COLORS.white,
    },
    content: {
        padding: SIZES.paddingS,
    },
    contentList: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    headerList: {
        flex: 1,
    },
    name: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    description: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        lineHeight: 14,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerList: {
        marginTop: 'auto',
    },
    price: {
        fontSize: SIZES.large,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: COLORS.gray,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantityText: {
        fontSize: SIZES.medium,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    addMoreButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: COLORS.primary + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    categoryBadgeList: {
        top: 8,
        right: 8,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    favoriteButtonList: {
        top: 8,
        left: 8,
    },
    bulkButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.secondary,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    bulkButtonText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.small,
        fontWeight: '700',
    },
});

export default ProductCard;
