import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { useState, useEffect, useContext } from "react";
import CartQuantity from "./CartQuantity";
import { formatCurrency } from "../../utils/PriceUtils";
import { Checkbox } from 'react-native-paper';
import { handleIncreaseQuantity, handleDecreaseQuantity } from "../../utils/CartUtils";
import Icon from 'react-native-vector-icons/FontAwesome';
import { authAPI, endpoints } from "../../configs/Apis";
import { MyCartContext, MySetCartContext } from "../../configs/CartContext";
import { MyUserContext } from "../../configs/Context";

const CartItem = ({ item, onSelect, onQuantityChange }) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [checked, setChecked] = useState(false);
    const setCart = useContext(MySetCartContext);
    const [deletingItemId, setDeletingItemId] = useState(null);
    const user = useContext(MyUserContext)
    console.log("user", user)
    console.log("item", item)

    const increaseQuantity = () => {
        const newQuantity = handleIncreaseQuantity(quantity);
        setQuantity(newQuantity);
        onQuantityChange && onQuantityChange(item.id, newQuantity);
    };

    const decreaseQuantity = () => {
        const newQuantity = handleDecreaseQuantity(quantity);
        setQuantity(newQuantity);
        onQuantityChange && onQuantityChange(item.id, newQuantity);
    };

    const handleCheck = () => {
        const newChecked = !checked;
        setChecked(newChecked);
        if (newChecked) {
            onSelect && onSelect(item.id, true, quantity);
        } else {
            onSelect && onSelect(item.id, false, quantity);
        }
    };

    useEffect(() => {
        if (checked) {
            onSelect && onSelect(item.id, true, quantity);
        }
    }, [quantity, item.id]);


    const onDelete = (itemId) => {
        Alert.alert("Xóa sản phẩm", "Bạn có muốn xóa sản phẩm này không?", [
            { text: "Hủy", onPress: () => {} },
            {
                text: "Xóa", onPress: async () => {
                    try {
                        setDeletingItemId(itemId); // Đánh dấu item đang bị xóa
                        let url = endpoints['cartItem'] + itemId + '/';
                        const res = await authAPI(user.token).delete(url);
    
                        // console.log("url: ", url);
                        if (res.status === 204) {
                            Alert.alert("Thành công", "Sản phẩm đã được xóa khỏi giỏ hàng");
                            setCart({
                                type: "remove_item",
                                payload: { id: itemId }
                            });
                        } else {
                            Alert.alert("Thất bại", "Không thể xóa sản phẩm");
                        }
                    } catch (err) {
                        console.log("err: ", err);
                        Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa sản phẩm");
                    } finally {
                        setDeletingItemId(null); // Reset lại sau khi xóa xong
                    }
                }
            }
        ]);
    };
    

    return (
        <View style={[Styles.border, Styles.backgoundColorCart]} >
            <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={handleCheck}
                color="blue"
                style={{ backgroundColor: "white", flex: 1 }}
            />

            <View style={{ flex: 9, flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "column", alignItems: "center", flex: 4, justifyContent: "center" }}>
                {item?.product?.image&& (
                        <Image
                            source={{ uri: item.product.image}}
                            style={Styles.image}
                        />
                        )}
                    <View>
                        <Text ellipsizeMode="tail" numberOfLines={1} style={Styles.nameProduct}>{item.product['name']}</Text>
                        <Text style={Styles.nameShop}>{item.shop["name"]}</Text>
                    </View>
                </View>

                <View style={{ flex: 6, justifyContent: "center" }}>
                    <Text>Giá sản phẩm: {formatCurrency(item.product['price'])}</Text>
                    <CartQuantity
                        quantity={quantity}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                    />
                    <Text>Tổng tiền: {formatCurrency(item.product['price'] * quantity)}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
                <Icon name="trash-o" size={25} color="red" style={{position: "absolute", right: 15, top: 43}}/>
            </TouchableOpacity>
        </View>
    );
};

export default CartItem;
