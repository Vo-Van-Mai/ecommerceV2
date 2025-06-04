import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import Styles from "./Styles";
import { useCallback, useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Apis";
import CartItem from "./CartItem";
import { formatCurrency } from '../../utils/PriceUtils';
import { MyCartContext, MySetCartContext } from "../../configs/CartContext";
import { MySetOrderContext } from "../../configs/OrderContext";
import { useFocusEffect } from "@react-navigation/native";

const Cart = () => {

    const cart = useContext(MyCartContext);
    const setCart = useContext(MySetCartContext);
    const user=useContext(MyUserContext);
    const setOrder = useContext(MySetOrderContext);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(1);


    const loadCart = async () => {
        try {
            setLoading(true);
            if(user.token!==null){
                let res = await authAPI(user.token).get(endpoints['cart']);
                // console.log("URL: ", endpoints["cart"]);
                // console.log("Res.data: ", res.data);
                setCart({
                    type: "set_cart",
                    payload: res.data
                });
            }
            
            
        } catch (error) {
            console.error(error);
            console.log(error.message);
            
        } finally{
            setLoading(false);
        }
    }
    
    useEffect(() => {
        loadCart();
        // console.log("cart: ", cart);
        
    }, [])

    

    const handleSelectItem = (cartItemId, isSelected, quantity) => {
        setSelectedItems(prev => {
            const newSelected = { ...prev };
            const cartItem = cart?.items?.find(item => item?.id === parseInt(cartItemId));
            const productId = cartItem?.product?.id;
    
            if (!productId) return prev; // Không làm gì nếu không tìm thấy sản phẩm
    
            if (isSelected) {
                newSelected[productId] = quantity;
            } else {
                delete newSelected[productId];
            }
    
            console.log("newSelected: ", newSelected);
            return newSelected;
        });
    };
    

    useEffect(() => {
        console.log("selectedItems đã cập nhật: ", selectedItems);
    }, [selectedItems]);
    

    const handleQuantityChange = (itemId, newQuantity) => {
        console.log(`Sản phẩm ${itemId} thay đổi số lượng thành ${newQuantity}`);
        // Có thể thêm logic cập nhật số lượng lên server ở đây
        // Ví dụ:
        // updateCartItemQuantity(itemId, newQuantity);
    };

    // Tính tổng tiền các sản phẩm được chọn
    useEffect(() => {
        if (!cart?.items) {
            setTotalAmount(0);
            return;
        }
    
        const total = Object.entries(selectedItems).reduce((sum, [productId, quantity]) => {
            const item = cart.items.find(i => i.product?.id === parseInt(productId));
            if (item && item.product && item.product.price) {
                return sum + item.product.price * quantity;
            }
            return sum;
        }, 0);
        console.log("total", total);
        setTotalAmount(total);
    }, [selectedItems, cart?.items]);
    

    // Hàm xử lý mua ngay
    const handleBuyNow = () => {
        if (Object.keys(selectedItems).length === 0) {
            Alert.alert("Thông báo", 'Vui lòng chọn sản phẩm để mua!');
            return;
        }

        // Hiển thị thông tin sản phẩm đã chọn
        
       
        if (Object.keys(selectedItems).length === 0) {
             console.log("selectedProducts: ", selectedProducts);
            Alert.alert("Lỗi", "Không thể tìm thấy thông tin sản phẩm");
            return;
        }

        Alert.alert(
            "Xác nhận mua hàng",
            `Bạn đã chọn ${Object.keys(selectedItems).length} sản phẩm\nTổng tiền: ${formatCurrency(totalAmount)}`,
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xác nhận",
                    onPress: () => {
                        //cho chọn phương thức thanh toán
                        Alert.alert("Chọn phương thức thanh toán", "Vui lòng chọn phương thức thanh toán", [
                            {
                                text: "Thanh toán tiền mặt",
                                onPress: () => {
                                    // console.log("Thanh toán tiền mặt");
                                    setPaymentMethod("1");
                                    // console.log("selectedItems: ", "1");
                                    // gọi hàm đặt hàng
                                    handleOrder(selectedItems, "1");
                                    if(loading){
                                        Alert.alert("Đang xử lý", "Đang xử lý đơn hàng...");
                                    }
                                    
                                }
                            },
                            {
                                text: "Thanh toán qua ví",
                                onPress: () => {
                                    // console.log("Thanh toán qua ví");
                                    setPaymentMethod("2");
                                    // gọi api đặt hàng
                                }
                            }
                        ])
                        // const data = {
                        //     products: selectedProducts,
                        //     total_amount: totalAmount
                        // }
                        // console.log('Các sản phẩm được chọn:', selectedProducts);
                        // Alert.alert("Thành công", "Đặt hàng thành công!");
                    }
                }
            ]
        );
    };

    // Hàm xử lý đặt hàng
    const handleOrder = async (items, paymentMethod) => {
        try {
            console.log("Đang xử lý đặt hàng...");
            setLoading(true);
            //chuyển items thành mảng để đưa vào data post lên
            const itemsArray = Object.entries(selectedItems).map(([productId, quantity]) => ({
                product_id: parseInt(productId),
                quantity
              }));
            const res = await authAPI(user.token).post(endpoints['order'], {
                items: itemsArray,
                payment_method: paymentMethod
            },{
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            // console.log("res: ", res);
            if(res.status === 201){
                Alert.alert("Thành công", "Đặt hàng thành công!");
                setOrder({
                    type: "add_order",
                    payload: res.data
                });
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
                   
            }
            else{
                Alert.alert("Lỗi", "Đặt hàng thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data); // <-- Quan trọng nhất
                Alert.alert("Lỗi", JSON.stringify(error.response.data));
            } else {
                console.log("Message:", error.message);
                Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
            }
        } finally {
            setLoading(false);
        }
    }


    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    );

    return(
        <View style={{flex: 1}}>

            {/* Khu vực giỏ hàng */}
            <ScrollView style={{marginBottom: 80}}>
                {/* Header */}
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
                    if (!item || !item.id || !item.product) return null;

                    return (
                    <CartItem 
                        key={item.id || index}
                        item={item}
                        onSelect={(itemId, isSelected, quantity) =>
                        handleSelectItem(itemId, isSelected, quantity)
                        }
                        onQuantityChange={(newQuantity) =>
                        handleQuantityChange(item.id, newQuantity)
                        }
                    />
                    );
                })}
                </View>
                
            </ScrollView>

            {/* Bottom bar - Thanh tổng tiền và nút mua ngay */}
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
                >
                    <Text style={Styles.buyButtonText}>Mua Ngay</Text>
                </TouchableOpacity>
            </View>
        </View>  
    );
}

export default Cart;