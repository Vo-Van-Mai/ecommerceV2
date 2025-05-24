import { useContext, useReducer } from "react";
import MyUserReducer from "../../Reducer/MyUserReducer";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, Text, View } from "react-native";
import MyStyles from "../../style/MyStyles";
import Styles from "./Styles";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();
    const logout = () => {
        dispatch({
            "type": "logout"
        });
        nav.navigate("Trang chủ");
    };

    return(
        <SafeAreaView style={Styles.container} >
            <View>
                <Text style={MyStyles.brandName}>
                    Xin chào {user.username}
                </Text>
                <Button mode="contained" onPress={logout}> 
                    Đăng xuất
                </Button>
            </View>
        </SafeAreaView>
        
    );
}

export default Profile;