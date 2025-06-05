import { useContext, useState } from "react";
import { Text, View } from "react-native";
import { MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import OrderItem from "./OrderItem";

const ConfirmOrder = () => {

    const user = useContext(MyUserContext);
    const [order, setOrder] = useState([]);

    return (
        <View style={[Styles.container, Styles.border]}>
            <View style={[Styles.border, {backgroundColor: "green",alignContent: "center", justifyContent: "center", height: 50}]}>
                <Text style={{color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
                    Đơn hàng đang chờ lấy hàng
                </Text>
            </View>
            <OrderItem status="2" />
        </View>
    );
};

export default ConfirmOrder;