
    import React, { useEffect, useState } from 'react';
    import { FlatList, SafeAreaView, TouchableOpacity, View, Text, ScrollView, Image, Dimensions,
    } from 'react-native';
    import { Searchbar, Chip, ActivityIndicator } from 'react-native-paper';
    import { LinearGradient } from 'expo-linear-gradient';
    import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
    import Apis, { endpoints } from '../../configs/Apis';
    import { useNavigation } from '@react-navigation/native';
    import ProductCard from './ProductCard';

    const { width } = Dimensions.get('window');

    export const Items = (props) => {
        return <Text> Hello {props.firstName} {props.lastName}! </Text>
    }

    const Home = () => {

        const [categories, setCategories] = useState([]);
        const [loading, setLoading] = useState(false);
        const [products, setProducts] = useState([]);
        const [q, setQ] = useState();
        const [cateId, setCateId] = useState();
        const [page, setPage] = useState(1);
        const nav = useNavigation();
        const [refreshing, setRefreshing] = useState(false)
        const [priceFilter, setPriceFilter] = useState(null); // "asc" | "desc" | null
        const [price, setPrice] = useState(null);

        

        const loadCate = async () => {
            let res = await Apis.get(endpoints ['categories']);
            setCategories(res.data.results);
            console.log("CATEGORIES:", res.data);
        }

        const loadProduct = async () => {
            if (page === 0) return;
        
            try {
                setLoading(true);
                let url = `${endpoints['products']}?page=${page}`;
        
                if (q) {
                    url += `&name=${q}`;
                }
        
                if (cateId) {
                    url += `&cate_id=${cateId}`;
                }
        
                if (priceFilter) {
                    url += `&ordering=${priceFilter === 'asc' ? 'price' : '-price'}`;
                }
        
                if (price) {
                    url += `&min_price=${price}`;
                }
                    
                console.log("Đang gọi API với URL:", url);
                let res = await Apis.get(url);
                console.log(`Trang ${page} - Số sản phẩm:`, res.data.results?.length);
        
                if (!res.data.results || !Array.isArray(res.data.results)) {
                    console.error("Dữ liệu không đúng định dạng:", res.data);
                    return;
                }
        
                setProducts(prevProducts => {
                    // Nếu là page 1, thay thế hoàn toàn
                    if (page === 1) {
                        return res.data.results;
                    }
                    // Nếu là page > 1, thêm vào cuối và lọc trùng
                    const newProducts = res.data.results;
                    return [
                        ...prevProducts,
                        ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                    ];
                });
        
                if (res.data.next === null) {
                    setPage(0);
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

        const refresh = async () => {
            setRefreshing(true);
            setProducts([]); // Clear products
            setPage(1); // Reset page
            try {
                await Promise.all([loadCate(), loadProduct()]); // Load cả danh mục và sản phẩm
            } catch (err) {
                console.error("Lỗi khi refresh:", err);
            } finally {
                setRefreshing(false);
            }
        };


        useEffect(() => {
            loadCate();
        }, []);
        
        useEffect(() => {
            // Khi bất kỳ điều kiện nào thay đổi, reset sản phẩm & gọi lại API
            setProducts([]);
            setPage(1); // Khi page đổi thì sẽ gọi loadProduct bên useEffect dưới
        }, [q, cateId, priceFilter, price]);
        
        useEffect(() => {
            loadProduct(); // Chỉ load khi page thay đổi
        }, [page]);

        
        useEffect(() => {
            const delayDebounce = setTimeout(() => {
                setPage(1);
            }, 500);
        
            return () => clearTimeout(delayDebounce);
        }, [q]);

        return (
            <SafeAreaView style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.searchContainer}>
                        <Searchbar
                            placeholder="Tìm kiếm sản phẩm..."
                            value={q}
                            onChangeText={setQ}
                            style={styles.searchBar}
                            icon={() => <Icon name="magnify" size={24} color="#666" />}
                            inputStyle={styles.searchInput}
                        />
                    </View>
                </View>

                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.productGrid}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    refreshing={refreshing}
                    onRefresh={refresh}
                    ListHeaderComponent={
                        <>
                            {/* Danh mục sản phẩm */}
                            <View style={styles.categoriesSection}>
                                <Text style={styles.sectionTitle}>Danh mục</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.categoriesContainer}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.categoryItem,
                                            !cateId && styles.categoryItemActive
                                        ]}
                                        onPress={() => {
                                            setCateId(null);
                                            setPriceFilter(null);
                                            setPrice(null);
                                        }}
                                    >
                                        <Icon name="apps" size={24} color={!cateId ? "#fff" : "#333"} />
                                        <Text style={[
                                            styles.categoryText,
                                            !cateId && styles.categoryTextActive
                                        ]}>Tất cả</Text>
                                    </TouchableOpacity>

                                    {categories.map(c => (
                                        <TouchableOpacity
                                            key={c.id}
                                            style={[
                                                styles.categoryItem,
                                                cateId === c.id && styles.categoryItemActive
                                            ]}
                                            onPress={() => setCateId(c.id)}
                                        >
                                            <Icon name="tag" size={24} color={cateId === c.id ? "#fff" : "#333"} />
                                            <Text style={[
                                                styles.categoryText,
                                                cateId === c.id && styles.categoryTextActive
                                            ]}>{c.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Bộ lọc theo giá */}
                            <View style={styles.filtersSection}>
                                <Text style={styles.sectionTitle}>Bộ lọc</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.filtersContainer}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            priceFilter === "asc" && styles.filterChipActive
                                        ]}
                                        onPress={() => setPriceFilter(priceFilter === "asc" ? null : "asc")}
                                    >
                                        <Icon name="sort-ascending" size={20} color={priceFilter === "asc" ? "#fff" : "#333"} />
                                        <Text style={[
                                            styles.filterText,
                                            priceFilter === "asc" && styles.filterTextActive
                                        ]}>Giá thấp - cao</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.filterChip,
                                            priceFilter === "desc" && styles.filterChipActive
                                        ]}
                                        onPress={() => setPriceFilter(priceFilter === "desc" ? null : "desc")}
                                    >
                                        <Icon name="sort-descending" size={20} color={priceFilter === "desc" ? "#fff" : "#333"} />
                                        <Text style={[
                                            styles.filterText,
                                            priceFilter === "desc" && styles.filterTextActive
                                        ]}>Giá cao - thấp</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>

                            {/* Products Header */}
                            <View style={styles.productsHeader}>
                                <Text style={styles.sectionTitle}>Sản phẩm</Text>
                                <Text style={styles.productCount}>{products.length} sản phẩm</Text>
                            </View>
                        </>
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
                    contentContainerStyle={styles.listContainer}
                />
            </SafeAreaView>
        );
    };

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
    };

    export default Home;