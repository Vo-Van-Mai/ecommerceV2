import { useContext } from "react";
import { Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import Styles from "./Styles";

const Shop = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    return(
        <View style={Styles.container}>
            <Text style={Styles.text}>
                Chào mừng bạn đã trở lại với {user.username}
            </Text>
        </View>
    );
}

export default Shop;