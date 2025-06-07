import { FlatList, Image, ScrollView, Text, View, Alert, Dimensions, StyleSheet } from "react-native";
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
import Icon from "react-native-vector-icons/FontAwesome5";

const Product = ({ route }) => {

    const productId = route.params?.productId;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [urlImage, setUrlImage] = useState(null);
    const user = useContext(MyUserContext);
    const [newComment, setNewComment] = useState({});
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
        <View style={styles.container}>
            <FlatList
                onEndReached={() => setLoadMore(true)}
                ListHeaderComponent={
                    <View>
                        {/* Phần hình ảnh sản phẩm */}
                        <View style={styles.imageContainer}>
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    source={{ uri: urlImage }}
                                    style={styles.mainImage}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.noImageContainer}>
                                    <Icon name="image" size={50} color="#ccc" />
                                    <Text style={styles.noImageText}>Không có ảnh sản phẩm</Text>
                                </View>
                            )}
                        </View>

                        {/* Gallery ảnh */}
                        {product.images && product.images.length > 0 && (
                            <View style={styles.galleryContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {product.images.map((item) => (
                                        <TouchableOpacity 
                                            key={item.id} 
                                            onPress={() => setUrlImage(item.pathImg)}
                                            style={[
                                                styles.thumbnailContainer,
                                                urlImage === item.pathImg && styles.selectedThumbnail
                                            ]}
                                        >
                                            <Image
                                                source={{ uri: item.pathImg }}
                                                style={styles.thumbnailImage}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Thông tin sản phẩm */}
                        <View style={styles.productInfoContainer}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                            
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Icon name="box" size={16} color="#666" />
                                    <Text style={styles.statText}>{product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : "Hết hàng"}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Icon name="star" size={16} color="#FFD700" />
                                    <Text style={styles.statText}>4.5/5 (200 đánh giá)</Text>
                                </View>
                            </View>
                        </View>

                        {/* Thông tin shop */}
                        {product.shop && (
                            <TouchableOpacity style={styles.shopContainer}>
                                <View style={styles.shopInfo}>
                                    <Image 
                                        source={{ uri: product.shop.avatar }} 
                                        style={styles.shopAvatar} 
                                    />
                                    <View style={styles.shopDetails}>
                                        <Text style={styles.shopName}>{product.shop.name}</Text>
                                        <View style={styles.shopStats}>
                                            <Icon name="store" size={14} color="#666" />
                                            <Text style={styles.shopStatText}>Online 12 phút trước</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.viewShopButton} onPress={() => nav.navigate("Shop", { shopId: product.shop.id })}>
                                    <Text style={styles.viewShopText}>Xem Shop</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}

                        {/* Mô tả sản phẩm */}
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                            <Text style={styles.descriptionText}>
                                {product.description || "Chưa có mô tả."}
                            </Text>
                        </View>

                        {/* Đánh giá sản phẩm */}
                        <View style={styles.reviewsContainer}>
                            <Text style={styles.sectionTitle}>Đánh giá từ người mua</Text>
                            <View style={styles.ratingOverview}>
                                <View style={styles.ratingScore}>
                                    <Text style={styles.ratingNumber}>4.5</Text>
                                    <View style={styles.starContainer}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Icon 
                                                key={star} 
                                                name={star <= 4.5 ? "star" : "star-half-alt"} 
                                                size={16} 
                                                color="#FFD700" 
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.totalReviews}>200 đánh giá</Text>
                                </View>
                                <View style={styles.ratingBars}>
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <View key={star} style={styles.ratingBar}>
                                            <Text style={styles.starCount}>{star}★</Text>
                                            <View style={styles.barContainer}>
                                                <View style={[styles.barFill, { width: '80%' }]} />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Tạo comment */}
                        <CreateComment 
                            productId={productId}
                            reloadComment={() => setNewComment(pre => !pre)}
                            content={content}
                            setContent={setContent}
                            showModal={showModal}
                            setShowModal={setShowModal}
                            comment={comment}
                            setComment={setComment}
                            parentId={parentId}
                            setParentId={setParentId}
                            reply={reply}
                            setReply={setReply}
                        />

                        <Comment
                            ownerCmt={ownerCmt}
                            setOwnerCmt={setOwnerCmt}
                            comment={comment}
                            setComment={setComment}
                            productId={productId}
                            reload={newComment}
                            loadMore={loadMore}
                            setLoadMore={setLoadMore}
                            setStop={setStop}
                            reply={reply}
                            setReply={setReply}
                            content={content}
                            setContent={setContent}
                            parentId={parentId}
                            setParentId={setParentId}
                        />
                    </View>
                }
                data={[]}
                renderItem={null}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Bottom Bar với nút Thêm vào giỏ và Mua ngay */}
            {user?.role==="buyer" && <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
                    <Icon name="shopping-cart" size={20} color="#333" />
                    <Text style={styles.cartButtonText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#fff',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    noImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#666',
        marginTop: 10,
    },
    galleryContainer: {
        height: 80,
        backgroundColor: '#fff',
        padding: 10,
    },
    thumbnailContainer: {
        width: 60,
        height: 60,
        marginRight: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedThumbnail: {
        borderColor: '#18A5A7',
        borderWidth: 2,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    productInfoContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 24,
        color: '#e91e63',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 5,
        color: '#666',
    },
    shopContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    shopAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    shopDetails: {
        marginLeft: 10,
        flex: 1,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    shopStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    shopStatText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 12,
    },
    viewShopButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    viewShopText: {
        color: '#333',
    },
    descriptionContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    descriptionText: {
        color: '#666',
        lineHeight: 20,
    },
    reviewsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginTop: 10,
    },
    ratingOverview: {
        flexDirection: 'row',
        paddingVertical: 10,
    },
    ratingScore: {
        alignItems: 'center',
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: '#eee',
    },
    ratingNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    starContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    totalReviews: {
        color: '#666',
        fontSize: 12,
    },
    ratingBars: {
        flex: 2,
        paddingLeft: 15,
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    starCount: {
        width: 30,
        fontSize: 12,
        color: '#666',
    },
    barContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        marginLeft: 5,
    },
    barFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    cartButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        marginRight: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#18A5A7',
    },
    cartButtonText: {
        marginLeft: 5,
        color: '#333',
        fontWeight: '500',
    },
    buyButton: {
        flex: 1,
        backgroundColor: '#18A5A7',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 5,
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
});


export default Product;
