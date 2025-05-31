import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import Styles from "./Styles";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Apis";
import CartItem from "./CartItem";
import { formatCurrency } from '../../utils/PriceUtils';

const Cart = () => {
    const user = useContext(MyUserContext);
    const [cart, SetCart] = useState([]);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cartItem, setCartItem] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);

    
    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        console.log("Token của bạn: ", storedToken);
    };
    
    // Lấy token
    useEffect(() => {
        getToken();
    }, []);
    
    const loadCart = async () => {
        try {
            setLoading(true);
            if(token!==null){
                let res = await authAPI(token).get(endpoints['cart']);
                console.log("URL: ", endpoints["cart"]);
                console.log("Res.data: ", res.data);
                SetCart(res.data);
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
    }, [token])
    
    const loadCartItem = async () => {
        
        try {
            setLoading(true);
            let res = await authAPI(user.token).get(endpoints['cartItem']);
            console.info("Res cartItem", res.data);
            setCartItem(res.data);
        } catch (error) {
            console.error(error);
            console.log(error);
        }finally{
            setLoading(false);
        }
    }
    
    const handleSelectItem = (itemId, isSelected, quantity) => {
        setSelectedItems(prev => {
            const newSelected = { ...prev };
            if (isSelected) {
                newSelected[itemId] = quantity;
            } else {
                delete newSelected[itemId];
            }
            return newSelected;
        });
    };

    // Tính tổng tiền các sản phẩm được chọn
    useEffect(() => {
        const total = Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
            const item = cartItem.find(item => item?.id === parseInt(itemId));
            if (item && item.product) {
                return sum + (item.product.price * quantity);
            }
            return sum;
        }, 0);
        setTotalAmount(total);
    }, [selectedItems, cartItem]);

    const handleBuyNow = () => {
        if (Object.keys(selectedItems).length === 0) {
            Alert.alert("Thông báo", 'Vui lòng chọn sản phẩm để mua!');
            return;
        }

        // Hiển thị thông tin sản phẩm đã chọn
        const selectedProducts = Object.entries(selectedItems).map(([itemId, quantity]) => {
                const item = cartItem.find(item => item?.id === parseInt(itemId));
                if (!item || !item.product) return null;
                
                return {
                    name: item.product.name,
                    quantity: quantity,
                    price: item.product.price,
                    total: item.product.price * quantity
                };
            }).filter(product => product !== null); // Lọc bỏ các item null

        if (selectedProducts.length === 0) {
             console.log("selectedProducts: ", selectedProducts);
            Alert.alert("Lỗi", "Không thể tìm thấy thông tin sản phẩm");
            return;
        }

        Alert.alert(
            "Xác nhận mua hàng",
            `Bạn đã chọn ${selectedProducts.length} sản phẩm\nTổng tiền: ${formatCurrency(totalAmount)}`,
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xác nhận",
                    onPress: () => {
                        console.log('Các sản phẩm được chọn:', selectedProducts);
                        Alert.alert("Thành công", "Đặt hàng thành công!");
                    }
                }
            ]
        );
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        console.log(`Sản phẩm ${itemId} thay đổi số lượng thành ${newQuantity}`);
        // Có thể thêm logic cập nhật số lượng lên server ở đây
        // Ví dụ:
        // updateCartItemQuantity(itemId, newQuantity);
    };

    useEffect(() => {
        loadCartItem();
    }, []);

    return(
        <View style={{flex: 1}}>
            {/* Header */}
            <View style={Styles.headerStyle}> 
                <Text>Giỏ hàng của bạn</Text>
            </View>

            {/* Khu vực giỏ hàng */}
            <ScrollView style={{flex: 1}}>
                {cart?.items?.length === 0 && (
                    <View style={Styles.alertCartNone}> 
                        <Text>Bạn chưa thêm sản phẩm nào!</Text>
                    </View>
                )}

                <View>
                    {cartItem.map(item => (
                        <CartItem 
                            key={item.id} 
                            item={item} 
                            onSelect={handleSelectItem}
                            onQuantityChange={handleQuantityChange}
                        />
                    ))}
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