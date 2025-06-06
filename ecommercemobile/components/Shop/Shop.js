import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import Apis, { endpoints } from '../../configs/Apis';
import ProductCard from '../Home/ProductCard';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Shop = ({ route}) => {
    const shopId = route.params.shopId;
    const [shopInfo, setShopInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const nav = useNavigation();

    // Load thông tin shop
    const loadShopInfo = async () => {
        try {
            const res = await Apis.get(endpoints['shop-detail'](shopId));
            setShopInfo(res.data);
        } catch (error) {
            console.error("Lỗi khi tải thông tin shop:", error);
        }
    };

    // Load sản phẩm của shop
    const loadShopProducts = async () => {
        if (page === 0) return;

        try {
            setLoading(true);
            const url = `${endpoints['shopProducts'](shopId)}?page=${page}`;
            const res = await Apis.get(url);
            
            setProducts(prevProducts => {
                const newProducts = res.data.results;
                return [
                    ...prevProducts,
                    ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                ];
            });

            if (res.data.next === null) {
                setPage(0);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && page > 0) {
            setPage(page + 1);
        }
    };

    const refresh = async () => {
        setRefreshing(true);
        setPage(1);
        setProducts([]);
        try {
            await Promise.all([loadShopInfo(), loadShopProducts()]);
        } catch (error) {
            console.error("Lỗi khi refresh:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadShopInfo();
    }, [shopId]);

    useEffect(() => {
        if (page > 0) {
            loadShopProducts();
        }
    }, [page]);

    const ShopHeader = () => (
        <View style={styles.shopHeader}>
            <Image
                source={{ uri: shopInfo?.avatar || 'https://via.placeholder.com/150' }}
                style={styles.shopAvatar}
            />
            <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shopInfo?.name}</Text>
                <Text style={styles.shopDescription}>{shopInfo?.description}</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{products.length}</Text>
                        <Text style={styles.statLabel}>Sản phẩm</Text>
                    </View>
                    {/* Thêm các thống kê khác nếu cần */}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={refresh}
                ListHeaderComponent={shopInfo && <ShopHeader />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text>Chưa có sản phẩm nào</Text>
                        </View>
                    )
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.productCardWrapper}
                        onPress={() => nav.navigate("Product", { productId: item.id })}
                    >
                        <ProductCard item={item} />
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#18A5A7" />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B0D4B8',
    },
    shopHeader: {
        backgroundColor: '#D7F9FA',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
    },
    shopAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#000',
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    shopDescription: {
        color: '#666',
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    statItem: {
        marginRight: 16,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#666',
        fontSize: 12,
    },
    productGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    productCardWrapper: {
        width: (width - 48) / 2,
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
});

export default Shop;