import { FlatList, Image, ScrollView, Text, View } from "react-native";
import Apis, { endpoints  } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MyStyles from "../../style/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import Styles from "./Styles";

const Product = ({ route }) => {
    const productId = route.params?.productId;
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(false);

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints ['product_detail'](productId));
            console.info(res.data);
            setProducts(res.data);
            console.info(productId)
            console.info(res.data.images)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [productId]);

    if (loading || !products.images || !products.images.length) {
        return <ActivityIndicator size="large" />;
    }
    return (
        <LinearGradient
            style={[Styles.container]}
            colors={["#A8DEE0", "#F9E2AE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View>
                {/* Khu vực chứa ảnh sản phẩm */}
                <View style={{ backgroundColor: "red", flexDirection: "row", height: 300 }}>
                    {/* Ảnh chính */}
                    <View style={[{ flex: 7, backgroundColor:"yellow" }, Styles.p]}>
                        <Image
                            source={{ uri: products?.images?.[0]?.pathImg || "https://via.placeholder.com/150" }}
                            style={Styles.image}
                        />
                    </View>
                    {/* Danh sách ảnh phụ */}
                    <View style={{ flex: 3, backgroundColor: "blue" }}>
                        <FlatList
                            data={products.images}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={{ backgroundColor: "blue", paddingTop: 4, paddingLeft: 4, paddingRight: 4}}>
                                    <Image
                                        source={{ uri: item.pathImg }} style={Styles.subImage}
                                    />
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>

        </LinearGradient>
    );
};


export default Product;