import { useContext, useEffect, useState } from "react";
import { Dimensions, FlatList, Text, TouchableOpacity, View, SafeAreaView } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { ActivityIndicator } from "react-native-paper";
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../Home/ProductCard";

const { width } = Dimensions.get('window');

const ShopProduct = ({route}) => {
    const shopId = route?.params?.shopId;
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const nav = useNavigation();
    const user = useContext(MyUserContext);

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
    };

    const loadProductShop = async () => {
        if (page > 0){
            try {
                setLoading(true);
                let res = await authAPI(token).get(endpoints['shopProducts'](shopId));
                
                setProducts(prevProducts => {
                    if (page === 1) {
                        return res.data?.results || [];
                    }
                    const newProducts = res.data?.results;
                    return [
                        ...prevProducts,
                        ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                    ];
                });

                if (!res.data.next) {
                    setPage(0);
                }
                
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        }
    }

    const loadMore = () => {
        if (!loading && page > 0) {
            setPage(page + 1);
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true);
        setProducts([]);
        setPage(1);
        await loadProductShop();
        setRefreshing(false);
    };

    useEffect(() => {
        getToken();
    }, []);

    useEffect(() => {
        if (token && shopId) {
            loadProductShop();
        }
    }, [token, shopId, page]);

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.productCardWrapper}
                        onPress={() => nav.navigate("Product", { productId: item.id })}
                    >
                        <ProductCard item={item} user={user} />
                    </TouchableOpacity>
                )}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="store-off" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {loading ? "Đang tải..." : "Không có sản phẩm nào"}
                        </Text>
                    </View>
                }
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
    listContainer: {
        paddingVertical: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
};

export default ShopProduct;