import { FlatList, Image, ScrollView, Text, View, Alert, Dimensions } from "react-native";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Styles from "./Styles";
import { ActivityIndicator, Button } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import { MyUserContext } from "../../configs/Context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Comment from "../Comment/Comment";
import CreateComment from "../Comment/CreateComment";
import { MySetCartContext } from "../../configs/CartContext";
import { useNavigation } from "@react-navigation/native";

const Product = ({ route }) => {

    const productId = route.params?.productId;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [urlImage, setUrlImage] = useState(null);
    const user = useContext(MyUserContext);
    const [newComment, setNewComment] = useState(false);
    const [loadMore, setLoadMore] = useState(false);
    const [stop, setStop] = useState(false);
    const [comment, setComment] = useState([]);
    const [ownerCmt, setOwnerCmt] = useState(false);
    const [content, setContent] = useState("");
    const[reply, setReply] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [parentId, setParentId] = useState(null);
    const setCart = useContext(MySetCartContext);
    const nav = useNavigation();

    const loadProduct = async () => {
        try {
            setLoading(true);
            let res = await Apis.get(endpoints['product_detail'](productId));
            setProduct(res.data);

            if (res.data.images && res.data.images.length > 0) {
                setUrlImage(res.data.images[0].pathImg);
            } else {
                Alert.alert("Thông báo", "Sản phẩm chưa có ảnh!");
            }
        } catch (error) {
            // console.error(error);
            console.log("Lỗi khi tải thông tin sản phẩm:", error);
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

    const addToCart = async () => {
        if (user === null) {
            Alert.alert("Cảnh báo!", "Hãy đăng nhập để có thể đặt hàng!", [
                {
                    text: "OK",
                    onPress: () => {
                        nav.navigate("Chính", {
                            screen: "Đăng nhập"
                        });
                    }
                },
                {
                    text: "Hủy",
                    style: "cancel",
                }
            ]);
        } else {
            try {
                setLoading(true);
                // console.info("Product ID:", productId);
                // console.info("Token:", user.token);
                // console.info("User:", user.username);
    
                // Gửi dữ liệu dạng JSON
                const body = {
                    product_id: productId,
                    quantity: 1
                };
    
                const res = await authAPI(user.token).post(endpoints['addToCart'], body, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
    
                if (res.status === 200) {
                    let rescart = await authAPI(user.token).get(endpoints['cart']);
                    // console.log("URL:", endpoints["cart"]);
                    // console.log("Res.data:", rescart.data);
    
                    setCart({
                        type: "add_item",
                        payload: rescart.data
                    });
    
                    Alert.alert("Thành công", "Thêm sản phẩm vào giỏ hàng thành công!", [
                        {
                            text: "OK",
                            onPress: () => {
                                nav.navigate("Chính", {
                                    screen: "Giỏ hàng"
                                });
                            }
                        }
                    ]);
                } else {
                    Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng!");
                }
            } catch (error) {
                if (error.response) {
                    console.log("Chi tiết lỗi:", error.response.data);
                    const errMsg = error.response.data.error || "Không thể thêm vào giỏ hàng!";
                    Alert.alert("Lỗi", errMsg);
                } else {
                    Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại sau!");
                }
            } finally {
                setLoading(false);
            }
        }
    }
    
    

    return (
        <View>
            <FlatList
                onEndReached={() => setLoadMore(true)}
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
                            {product.name} - Giá: {formatCurrency(product.price)} - số lượng: {product.quantity}
                        </Text>
                    </View>


                    {/* Thông tin shop */}
                    {product.shop && (
                        <View style={[Styles.border, { height: 55, flexDirection: "row", margin: 5, padding: 5, borderWidth: 1, borderColor: "#ccc", flex: 6 }]}>
                            <View style={{ flex: 2, justifyContent: "center" }}>
                                <Image source={{ uri: product.shop.avatar }} style={{ height: 50, width: 50, borderRadius: 30, borderWidth: 1, borderColor: "#ccc" }} />
                            </View>
                            <View style={{ flex: 7, justifyContent: "center" }}>
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

                    {/* Tạo comment */}
                    <CreateComment productId={productId} 
                    reloadComment={() => setNewComment(pre => !pre)} 
                    content={content} setContent={setContent}
                    showModal={showModal} setShowModal={setShowModal}
                    comment={comment} setComment={setComment}
                    parentId={parentId} setParentId={setParentId}
                    reply={reply} setReply={setReply}
                    />

                    {/* Khu vực loadcommnt */}
                    <View>
                        <Comment
                        ownerCmt={ownerCmt} setOwnerCmt={setOwnerCmt}
                        comment={comment} setComment={setComment}
                        productId={productId}  reload={newComment} 
                        loadMore={loadMore} setLoadMore={setLoadMore} 
                        setStop={setStop}
                        reply={reply} setReply={setReply}
                        content={content} setContent={setContent}
                        parentId={parentId} setParentId={setParentId}
                        />
                    </View>
                </View>
                }
                data={[]} // Không có item, chỉ dùng để scroll
                renderItem={null}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListFooterComponent={() => {
                    if (stop) return (
                        <View style={{ padding: 10, alignItems: "center" }}>
                            <Text>Không còn bình luận nào nữa.</Text>
                        </View>
                    );
                    return (
                        <View style={{ padding: 10 }}>
                            <ActivityIndicator size="small" />
                        </View>
                    );
                }}
            />

            {/* Nút đặt hàng */}
            <View style={[Styles.bottomBar, { flexDirection: "row" }]}>
                <TouchableOpacity onPress={addToCart} style={[Styles.button, { backgroundColor: "#ffffff", marginRight: 10 }]}>
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
