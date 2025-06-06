import { Text } from "react-native";
import { View } from "react-native";
import Styles from "./Styles";
import OrderItem from "./OrderItem";
import { useContext } from "react";
import { MyUserContext } from "../../configs/Context";

const RatingOrder = () => {
    const user = useContext(MyUserContext);
    return (
        <View style={[Styles.container, Styles.border]}>
            <View style={[Styles.border, {backgroundColor: "red",alignContent: "center", justifyContent: "center", height: 50}]}>
                {user?.role==="buyer" ? <Text style={{color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
                    Xác nhận đơn hàng
                </Text> : <Text style={{color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center"}}>
                    Đơn hàng đã đánh được đánh giá
                </Text>}
            </View>
            <OrderItem status="6" />
        </View>
    );
}

export default RatingOrder;