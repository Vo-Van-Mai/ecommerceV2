import { useContext, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../Home/ProductCard";
import { ActivityIndicator } from "react-native-paper";

const ShopProduct = ({route}) => {
    const shopId = route?.params?.shopId;
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
    };

    const loadProductShop = async () => {
        if (page > 0){
            try {
                setLoading(true);
                let res = await authAPI(token).get(endpoints['shopProducts'](shopId));
                console.info(res);
                setProducts(prevProducts => {
                    const newProducts = res.data?.results;
                    return ([
                        ...prevProducts,
                        ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                    ]);
                    });
                if (res.data.next === null)
                    setPage(0);
                
            } catch (error) {
                
            } finally{
                setLoading(false);
            }

        }
    }

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    // Lấy token
    useEffect(() => {
        getToken();
    }, []);

     // Lấy sản phẩm khi có shop
    useEffect(() => {
        if (token && shopId)
            loadProductShop();
    }, [token, shopId, page]);

    return(
        <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                // <TouchableOpacity onPress={() => nav.navigate("Product", { productId: item.id })}>
                <ProductCard item={item} />
                // </TouchableOpacity>
            )}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            onEndReached={loadMore}
            ListFooterComponent={loading && <ActivityIndicator size={35} style={{ margin: 10 }} />}
        />  
        // <View>

        // </View>
    );
}
export default ShopProduct;