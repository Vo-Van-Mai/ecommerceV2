
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, TouchableOpacity, View, Text, ScrollView, Image, Dimensions,
} from 'react-native';
import { Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Apis, { authAPI, endpoints } from '../../configs/Apis';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ProductCard from '../Home/ProductCard';
import { MyUserContext } from '../../configs/Context';

const { width } = Dimensions.get('window');

const LikeProduct = () => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const nav = useNavigation();
    const [refreshing, setRefreshing] = useState(false)

    const loadProduct = async () => {
        if (page === 0) return;
    
        try {
            setLoading(true);
            let url = endpoints['like'] + `?page=${page}`;
            console.log("URL đang gọi:", url);
            let res = await authAPI(user.token).get(url);
            console.log("Response data:", res.data);
    
            if (res.data && res.data.results) {
                const newProducts = res.data.results
                    .map(item => item.product)
                    .filter(p => p && !products.some(prev => prev.id === p.id)); // tránh trùng lặp
    
                setProducts(prevProducts => [...prevProducts, ...newProducts]);
    
                if (res.data.next === null) {
                    setPage(0); // Không còn trang nào nữa
                }
            } else if (Array.isArray(res.data)) {
                const newProducts = res.data
                    .map(item => item.product)
                    .filter(p => p && !products.some(prev => prev.id === p.id));
    
                setProducts(prevProducts => [...prevProducts, ...newProducts]);
            } else {
                console.error("Dữ liệu không đúng định dạng:", res.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải sản phẩm:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };
    

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    // const refresh = () => {
    //     setProducts([]);
    //     setPage(1);
    //     loadProduct();
    // };
    
    useEffect(()=>{
        loadProduct();
    },[])

    // Chỉ load khi page thay đổi
    useEffect(() => {
        if (page > 1)
            loadProduct();
    }, [page]);



    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products || []} // Thêm || [] để đảm bảo luôn có array
                keyExtractor={(item) => item.id?.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                // refreshing={refreshing}
                // onRefresh={refresh}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Icon name="heart-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {loading ? "Đang tải..." : "Không có sản phẩm yêu thích nào"}
                        </Text>
                    </View>
                )}
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
                contentContainerStyle={[
                    styles.listContainer,
                    products.length === 0 && styles.emptyListContainer
                ]}
            />
        </SafeAreaView>
    );
}


const styles = {
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchContainer: {
        marginBottom: 8,
    },
    searchBar: {
        elevation: 0,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    searchInput: {
        fontSize: 16,
    },
    categoriesSection: {
        paddingVertical: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 16,
        color: '#333',
    },
    categoriesContainer: {
        paddingHorizontal: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    categoryItemActive: {
        backgroundColor: '#18A5A7',
    },
    categoryText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    categoryTextActive: {
        color: '#fff',
    },
    filtersSection: {
        paddingVertical: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    filtersContainer: {
        paddingHorizontal: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
    },
    filterChipActive: {
        backgroundColor: '#18A5A7',
    },
    filterText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    filterTextActive: {
        color: '#fff',
    },
    productsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    productCount: {
        fontSize: 14,
        color: '#666',
    },
    productGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    productCardWrapper: {
        width: (width - 48) / 2,
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 16,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
};

export default LikeProduct;
