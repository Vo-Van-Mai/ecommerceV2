import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Styles from './Styles';

const CartQuantity = ({ quantity, onIncrease, onDecrease }) => {
    return (
        <View style={[{flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 40}]}>
            <Text>Số lượng: {quantity}</Text>
            <View style={[{flexDirection: "row"}]}>
                {/* Tăng số lượng */}
                <TouchableOpacity onPress={onIncrease} style={[Styles.button, {backgroundColor: "lightgreen"}]}>
                    <Text style={[{marginRight: 10}]}>+</Text>
                </TouchableOpacity>

                {/* Giảm số lượng */}
                <TouchableOpacity onPress={onDecrease} style={[Styles.button, {backgroundColor:"black"}]}>
                    <Text style={[{marginRight: 10, color: "white"}]}>-</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default CartQuantity; 