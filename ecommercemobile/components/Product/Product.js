import { FlatList, Image, ScrollView, Text, View } from "react-native";
import Apis, { endpoinds } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MyStyles from "../../style/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Searchbar } from "react-native-paper";
import Styles from "./Styles";

const Product = ({ route }) => {
    const productId = route.params?.productId;
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoinds['product_detail'](productId));
            console.info(res);
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [productId]);

    if (loading || !products) return <ActivityIndicator size="large" />;

    return (
        <LinearGradient
            style={[MyStyles.container, MyStyles.p]}
            colors={["#A8DEE0", "#F9E2AE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView>
                {/* Hình ảnh cuộn ngang */}
                <View style={{borderWidth: 1, borderColor: "black"}} >
                    {products.images?.length > 0 ? (
                    <FlatList
                    horizontal
                    data={products.images}
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Image
                        source={{ uri: item.pathImg }}
                        style={[Styles.image, { marginRight: 10 }]}
                        />
                    )}
                    style={{ marginTop: 10, height: 200 }}
                    />
                ) : (
                    <Image
                    source={require("../../assets/default_product_image.jpg")}
                    style={{ width: 100, height: 100, marginTop: 10 }}
                    />
                )}

                </View>
                {/* Mô tả sản phẩm */}
                <View style={{flexDirection: "row", marginTop: 20, paddingHorizontal: 10 }}>
                    <View style={{flex: 3, alignItems: "center"}}>
                        <Image style={{width: 50, height: 50, borderRadius: 50}} source={{uri: products.shop.avatar}}></Image>
                        <Text>{products.shop.name}</Text>
                    </View>
                    <View style={{flex: 7}}>
                        <Text style={{ fontSize: 16 }}>{products.name}</Text>
                        <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
                        Giá: {products.price} VNĐ
                        </Text>
                    </View>
                </View>
                </SafeAreaView>

        </LinearGradient>
    );
};


export default Product;