import { useContext, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../Home/ProductCard";
import { ActivityIndicator } from "react-native-paper";

const Shop = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shop, setShop] = useState({});
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
    };


    const loadShop = async () => {
        try {
            setLoading(true);
            let res = await authAPI(token).get(endpoints['myShop']);
            setShop(res.data)
            console.info({"res": res});

        } catch (error) {
            
        }
    }

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    

    const loadProductShop = async () => {
        if (page > 0){
            try {
                setLoading(true);
                let res = await authAPI(token).get(endpoints['shopProducts'](shop.id));
                console.info(res);
                setProducts(prevProducts => {
                    const newProducts = res.data.results;
                    return [
                        ...prevProducts,
                        ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                    ];
                    });
                if (res.data.next === null)
                    setPage(0);
                
            } catch (error) {
                
            } finally{
                setLoading(false);
            }

        }
    }
    
   // Lấy token
    useEffect(() => {
        getToken();
    }, []);

    // Lấy shop khi có token
    useEffect(() => {
        if (token)
            loadShop();
    }, [token]);

    // Lấy sản phẩm khi có shop
    useEffect(() => {
        if (token && shop.id)
            loadProductShop();
    }, [token, shop.id, page]);

    return (
        <SafeAreaView>
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
            {/* <View>
                {products.map((item) => <Text key={item.id}>Hello {item.id}</Text>)}

            </View> */}
        </SafeAreaView>
    );
}

export default Shop;