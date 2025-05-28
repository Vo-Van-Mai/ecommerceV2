import { FlatList, Image, ScrollView, Text, View } from "react-native";
import Apis, { endpoints  } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MyStyles from "../../style/MyStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Button, Searchbar } from "react-native-paper";
import Styles from "./Styles";
import { TouchableOpacity } from "react-native";

const Product = ({ route }) => {
    const productId = route.params?.productId;
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(false);
    const [urlImage, setUrlImage] = useState(null);

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints ['product_detail'](productId));
            console.info(res.data);
            setProducts(res.data);
            setUrlImage(res.data.images[0]?.pathImg);
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
        };

    return (
        // <LinearGradient
            // style={[Styles.container]}
            // colors={["#18A5A7", "#B6C0C5"]} // 112D60 B6C0C5, 18A5A7 B6C0C5, FDABDD 374A5A
            // start={{ x: 0, y: 0 }}
            // end={{ x: 1, y: 1 }}
        // >
        <View>
            <FlatList
                ListHeaderComponent={
                    <View>
                        <LinearGradient 
                        style={[Styles.container]}
                        colors={["#18A5A7", "#B6C0C5"]} // 112D60 B6C0C5, 18A5A7 B6C0C5, FDABDD 374A5A
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                            {/* Khu vực chứa ảnh sản phẩm */}
                            {/* Ảnh chính */}
                            <View style={[Styles.p, {alignItems: "center"}]}>
                                <Image
                                    source={{ uri: urlImage || products.images[0].pathImg }}
                                    style={Styles.image}
                                />
                            </View>
                            {/* Danh sách ảnh phụ */}
                            <View style={[{marginTop: 15,  height: 130}, Styles.border]}>
                                <ScrollView horizontal>
                                    {products.images.map((item) => (
                                        <TouchableOpacity key={item.id} onPress={() => setUrlImage(item.pathImg)}>
                                            <Image
                                                source={{ uri: item.pathImg }}
                                                style={Styles.subImage}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                    </ScrollView>
                            </View>
                        </LinearGradient>

                        {/* Khu vực chưa tên sản phẩm*/}
                        <View style={[Styles.border, {height: 50, marginTop: 5, justifyContent: "center", paddingLeft: 10}]}>
                                <Text style={[Styles.productName]}>{products.name} - Giá: {formatCurrency(products.price)}</Text>
                        </View>
                        
                        {/* Khu vực chứa tên shop */}
                        <View style={[Styles.border, {height: 55, flexDirection: "row", margin: 5, padding: 5, borderWidth: 1, borderColor: "#ccc"}]}>
                            <View style={{flex: 2, justifyContent: "center"}}>
                                <Image source={{uri: products.shop.avatar}} style={{height: 50, width: 50, borderRadius: 30}} />
                            </View>
                            <View style={{flex: 10, justifyContent: "center"}}>
                                <Text style={{fontSize: 15, fontWeight:"bold", fontStyle:"italic"}}>
                                    {products.shop.name}
                                </Text>
                            </View>
                        </View>

                        {/* Mô tả sản phẩm */}
                        <View style={[Styles.border, {height: 400}]}>
                            <Text style={{padding: 10}}>Mô tả sản phẩm</Text>
                        </View> 
                    </View>
                    }
                    data={[]} //Không có item chỉ dùng để cuộn
                    renderItem={null}
                />

                {/* Nút đặt hàng ở cuối */}
                {/* Button đặt mua và thêm vào giỏ hàng */}
                <View style={[Styles.bottomBar, {flexDirection: "row"}]}>
                    <TouchableOpacity style={[Styles.button, { backgroundColor: "#ffffff", marginRight: 10 }]}>
                        <Text style={[Styles.buttonText, {color: "#000000"}]}>🛒 Giỏ hàng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[Styles.button, { backgroundColor: "#000000" }]}>
                        <Text style={Styles.buttonText}>💳 Đặt hàng</Text>
                    </TouchableOpacity>
            </View>
        </View>
        // </LinearGradient>
    );
};


export default Product;