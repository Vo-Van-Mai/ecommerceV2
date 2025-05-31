import { Image, Text, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { useState, useEffect } from "react";
import CartQuantity from "./CartQuantity";
import { formatCurrency } from "../../utils/PriceUtils";
import { Checkbox } from 'react-native-paper';
import { handleIncreaseQuantity, handleDecreaseQuantity } from "../../utils/CartUtils";

const CartItem = ({item, onSelect, onQuantityChange}) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [checked, setChecked] = useState(false);

    const increaseQuantity = () => {
        setQuantity(prevQuantity => {
            const newQuantity = handleIncreaseQuantity(prevQuantity);
            // Gửi giá trị mới lên component cha
            onQuantityChange && onQuantityChange(item.id, newQuantity);
            if (checked) {
                onSelect(item.id, true, newQuantity);
            }
            return newQuantity;
        });
    }

    const decreaseQuantity = () => {
        setQuantity(prevQuantity => {
            const newQuantity = handleDecreaseQuantity(prevQuantity);
            // Gửi giá trị mới lên component cha
            onQuantityChange && onQuantityChange(item.id, newQuantity);
            if (checked) {
                onSelect(item.id, true, newQuantity);
            }
            return newQuantity;
        });
    }

    const handleCheck = () => {
        setChecked(!checked);
        onSelect && onSelect(item.id, !checked, quantity);
    }

    return(
        <View style={[Styles.border, Styles.backgoundColorCart]} >
            <Checkbox
                status={checked ? 'checked' : 'unchecked'}
                onPress={handleCheck}
                color="blue"
                style={{backgroundColor: "white", flex: 1}}
            />
            
            <View style={{flex: 9, flexDirection: "row", justifyContent: "space-between"}}> 
                {/* Khu vực item cart */}
                <View style={[{flexDirection: "column", alignItems: "center", flex: 4, justifyContent: "center"}]} >
                    {/* ảnh sản phẩm */}
                    <Image style={Styles.image} source={{uri: item?.product['image']}}/>

                    {/* Tên sản phẩm  */}
                    <View>
                        <Text style={Styles.nameProduct}>{item.product['name']}</Text>
                        <Text style={Styles.nameShop}>{item.shop["name"]}</Text>
                    </View>
                </View>

                <View style={{flex: 6, justifyContent: "center"}}>
                    <Text>Giá sản phẩm: {formatCurrency(item.product['price'])} </Text>
                    <View>
                        <CartQuantity 
                            quantity={quantity}
                            onIncrease={increaseQuantity}
                            onDecrease={decreaseQuantity}
                        />
                        <Text>Tổng tiền: {formatCurrency(item.product['price'] * quantity)}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default CartItem;