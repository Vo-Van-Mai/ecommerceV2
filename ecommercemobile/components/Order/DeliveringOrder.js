import { useContext, useState } from "react";
import { Text, View } from "react-native";
import { MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import OrderItem from "./OrderItem";

const DeliveringOrder = () => {


    return (
        <View style={[Styles.container, Styles.border]}>
            <View style={[Styles.border, {backgroundColor: "lightblue",alignContent: "center", justifyContent: "center", height: 50}]}>
                <Text style={{color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
                    Đơn hàng đang được giao
                </Text>
            </View>
            <OrderItem status="4" />
        </View>
    );
};

export default DeliveringOrder;