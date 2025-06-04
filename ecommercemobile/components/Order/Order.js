import { Text } from "react-native";
import { View } from "react-native";
import Styles from "./Styles";
import OrderItem from "./OrderItem";

const Order = () => {
    return (
        <View style={[Styles.container, Styles.border]}>
            <View style={[Styles.border, {backgroundColor: "red",alignContent: "center", justifyContent: "center", height: 50}]}>
                <Text style={{color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
                    Đơn hàng đang chờ xác nhận
                </Text>
            </View>
            <OrderItem status="1" />
        </View>
    );
}

export default Order;