import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import Styles from "./Styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Context";
import { authAPI, endpoints } from "../../configs/Apis";
import CartItem from "./CartItem";
import { formatCurrency } from '../../utils/PriceUtils';
import { MyCartContext, MySetCartContext } from "../../configs/CartContext";
import { MySetOrderContext } from "../../configs/OrderContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const Cart = () => {
    const navigation = useNavigation();
    const cart = useContext(MyCartContext);
    const setCart = useContext(MySetCartContext);
    const user = useContext(MyUserContext);
    const setOrder = useContext(MySetOrderContext);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);

    const loadCart = async () => {
        try {
            setLoading(true);
            if (user.token !== null) {
                let res = await authAPI(user.token).get(endpoints['cart']);
                setCart({
                    type: "set_cart",
                    payload: res.data
                });
            }
        } catch (error) {
            console.error("Lỗi load giỏ hàng:", error);
            Alert.alert("Lỗi", "Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCart();
    }, []);

    const handleSelectItem = (cartItemId, isSelected, quantity) => {
        setSelectedItems(prev => {
            const newSelected = { ...prev };
            const cartItem = cart?.items?.find(item => item?.id === parseInt(cartItemId));
            const productId = cartItem?.product?.id;

            if (!productId) return prev;

            if (isSelected) {
                newSelected[productId] = quantity;
            } else {
                delete newSelected[productId];
            }
            return newSelected;
        });
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        console.log(`Cập nhật số lượng: ${itemId} - ${newQuantity}`);
    };

    useEffect(() => {
        if (!cart?.items) {
            setTotalAmount(0);
            return;
        }

        const total = Object.entries(selectedItems).reduce((sum, [productId, quantity]) => {
            const item = cart.items.find(i => i.product?.id === parseInt(productId));
            if (item?.product?.price) {
                return sum + item.product.price * quantity;
            }
            return sum;
        }, 0);
        setTotalAmount(total);
    }, [selectedItems, cart?.items]);

    const removeItemsFromCart = async () => {
        try {
            for (const [productId, quantity] of Object.entries(selectedItems)) {
                const cartItem = cart.items.find(item => item.product.id === parseInt(productId));
                if (cartItem) {
                    await authAPI(user.token).delete(`${endpoints['cartItem']}${cartItem.id}/`);
                    setCart({
                        type: "remove_item",
                        payload: { id: cartItem.id }
                    });
                }
            }
        } catch (error) {
            console.error("Lỗi xóa giỏ hàng:", error);
        }
    };

    const handleOrder = async (paymentMethod) => {
        try {
            setLoading(true);
            const itemsArray = Object.entries(selectedItems).map(([productId, quantity]) => ({
                product_id: parseInt(productId),
                quantity
            }));

            const orderRes = await authAPI(user.token).post(endpoints['order'], {
                items: itemsArray,
                payment_method: paymentMethod
            });

            if (orderRes.status === 201 && Array.isArray(orderRes.data) && orderRes.data.length > 0) {
                const order = orderRes.data[0];
                
                if (paymentMethod === "1") {
                    const res = await authAPI(user.token).post(endpoints['payment-cash'](order.id));
                    console.log("res payment cash:", res);
                    await removeItemsFromCart();
                    setOrder({
                        type: "add_order",
                        payload: order
                    });
                    Alert.alert("Thành công", "Đặt hàng thành công!", [
                        {
                            text: "Xem đơn hàng",
                            onPress: () => navigation.navigate('Hồ sơ', {screen: 'Đơn hàng'})
                        }
                    ]);

                } else if (paymentMethod === "2" && order.id) {
                    const paymentRes = await authAPI(user.token).post(
                        endpoints['momo_payment'],
                        { order_id: order.id }
                    );

                    if (paymentRes.data?.payUrl) {
                        await removeItemsFromCart();
                        // Sửa lại phần navigation này
                        navigation.navigate('Trang chủ', {
                            screen: 'PaymentWebview',
                            params: {
                                payUrl: paymentRes.data.payUrl,
                                orderId: order.id
                            }
                        });
                    } else {
                        throw new Error("Không nhận được link thanh toán");
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi đặt hàng:", error);
            Alert.alert("Lỗi", error.response?.data?.error || "Không thể đặt hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = () => {
        if (Object.keys(selectedItems).length === 0) {
            Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để mua!");
            return;
        }

        Alert.alert(
            "Xác nhận mua hàng",
            `Bạn đã chọn ${Object.keys(selectedItems).length} sản phẩm\nTổng tiền: ${formatCurrency(totalAmount)}`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xác nhận",
                    onPress: () => {
                        Alert.alert(
                            "Chọn phương thức thanh toán",
                            "Vui lòng chọn phương thức thanh toán",
                            [
                                {
                                    text: "Tiền mặt",
                                    onPress: () => handleOrder("1")
                                },
                                {
                                    text: "MoMo",
                                    onPress: () => handleOrder("2")
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    );

    return (
        <View style={{flex: 1}}>
            <ScrollView style={{marginBottom: 80}}>
                <View style={Styles.headerStyle}> 
                    <Text>Giỏ hàng của bạn</Text>
                </View>
                
                {cart?.items?.length === 0 && (
                    <View style={Styles.alertCartNone}> 
                        <Text>Bạn chưa thêm sản phẩm nào!</Text>
                    </View>
                )}

                <View>
                    {cart?.items?.map((item, index) => {
                        if (!item?.id || !item?.product) return null;
                        return (
                            <CartItem 
                                key={item.id || index}
                                item={item}
                                onSelect={handleSelectItem}
                                onQuantityChange={handleQuantityChange}
                            />
                        );
                    })}
                </View>
            </ScrollView>

            <View style={Styles.bottomBar}>
                <View style={Styles.totalContainer}>
                    <Text style={Styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={Styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
                </View>
                <TouchableOpacity 
                    style={[
                        Styles.buyButton,
                        {opacity: Object.keys(selectedItems).length > 0 ? 1 : 0.5}
                    ]} 
                    onPress={handleBuyNow}
                    disabled={loading || Object.keys(selectedItems).length === 0}
                >
                    <Text style={Styles.buyButtonText}>
                        {loading ? "Đang xử lý..." : "Mua Ngay"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>  
    );
}

export default Cart;