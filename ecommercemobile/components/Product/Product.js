import { FlatList, Image, ScrollView, Text, View, Alert } from "react-native";
import Apis, { endpoints } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Styles from "./Styles";
import { ActivityIndicator, Button } from "react-native-paper";
import { TouchableOpacity } from "react-native";

const Product = ({ route }) => {
    const productId = route.params?.productId;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [urlImage, setUrlImage] = useState(null);

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints['product_detail'](productId));
            console.info(res.data);
            setProduct(res.data);

            if (res.data.images && res.data.images.length > 0) {
                setUrlImage(res.data.images[0].pathImg);
            } else {
                Alert.alert("Thông báo", "Sản phẩm chưa có ảnh!");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    };

    if (loading) {
        return <ActivityIndicator size="large" />;
    }

    if (!product) {
        return (
            <View style={{ padding: 20 }}>
                <Text style={{ color: "red", fontSize: 16 }}>Không tìm thấy sản phẩm!</Text>
            </View>
        );
    }

    return (
        <View>
            <FlatList
                ListHeaderComponent={
                    <View>
                        <LinearGradient
                            style={[Styles.container]}
                            colors={["#18A5A7", "#B6C0C5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {/* Khu vực ảnh chính */}
                            <View style={[Styles.p, { alignItems: "center" }]}>
                                {product.images && product.images.length > 0 ? (
                                    <Image
                                        source={{ uri: urlImage }}
                                        style={Styles.image}
                                    />
                                ) : (
                                    <Text style={{ color: 'gray' }}>Không có ảnh sản phẩm</Text>
                                )}
                            </View>

                            {/* Danh sách ảnh phụ */}
                            {product.images && product.images.length > 0 && (
                                <View style={[{ marginTop: 15, height: 130 }, Styles.border]}>
                                    <ScrollView horizontal>
                                        {product.images.map((item) => (
                                            <TouchableOpacity key={item.id} onPress={() => setUrlImage(item.pathImg)}>
                                                <Image
                                                    source={{ uri: item.pathImg }}
                                                    style={Styles.subImage}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Tên sản phẩm và giá */}
                        <View style={[Styles.border, { height: 50, marginTop: 5, justifyContent: "center", paddingLeft: 10 }]}>
                            <Text style={[Styles.productName]}>
                                {product.name} - Giá: {formatCurrency(product.price)}
                            </Text>
                        </View>

                        {/* Thông tin shop */}
                        {product.shop && (
                            <View style={[Styles.border, { height: 55, flexDirection: "row", margin: 5, padding: 5, borderWidth: 1, borderColor: "#ccc" }]}>
                                <View style={{ flex: 2, justifyContent: "center" }}>
                                    <Image source={{ uri: product.shop.avatar }} style={{ height: 50, width: 50, borderRadius: 30 }} />
                                </View>
                                <View style={{ flex: 10, justifyContent: "center" }}>
                                    <Text style={{ fontSize: 15, fontWeight: "bold", fontStyle: "italic" }}>
                                        {product.shop.name}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Mô tả sản phẩm */}
                        <View style={[Styles.border, { minHeight: 100, padding: 10 }]}>
                            <Text style={{ fontWeight: "bold" }}>Mô tả sản phẩm:</Text>
                            <Text>{product.description || "Chưa có mô tả."}</Text>
                        </View>
                    </View>
                }
                data={[]} // Không có item, chỉ dùng để scroll
                renderItem={null}
            />

            {/* Nút đặt hàng */}
            <View style={[Styles.bottomBar, { flexDirection: "row" }]}>
                <TouchableOpacity style={[Styles.button, { backgroundColor: "#ffffff", marginRight: 10 }]}>
                    <Text style={[Styles.buttonText, { color: "#000000" }]}>🛒 Giỏ hàng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[Styles.button, { backgroundColor: "#000000" }]}>
                    <Text style={Styles.buttonText}>💳 Đặt hàng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Product;
