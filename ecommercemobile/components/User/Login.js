import { Image, SafeAreaView, Text, View } from "react-native";
import { Button } from "react-native-paper";
import Styles from "./Styles";

const Login = () => {
    return(
        <SafeAreaView>
            <View style={Styles.container}>
            <View>
                <Image style={Styles.logo} source={require("../../assets/logo.png")}/>
            </View>
            <View style={Styles.text}>
                <Button style={{marginTop:10}}>
                Đăng nhập
                </Button>
                <Button>
                    Đăng kí
                </Button>
            </View>
            </View>
        </SafeAreaView>
    );
}

export default Login;