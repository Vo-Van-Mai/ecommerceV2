import { useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Button, HelperText, RadioButton, TextInput } from "react-native-paper";
import Styles from "./Styles";
import * as ImagePicker from 'expo-image-picker';
import Apis, { endpoinds } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
const Register = () =>{

    

    const [user, setUser] = useState({});
    const [msg, setMsg] = useState(null);
    const [loading, SetLoading] = useState(false);
    const nav = useNavigation();

    const setState = (value, field) => {
        setUser({...user, [field]: value});
    }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                setState(result.assets[0],'avatar');
        }
    }

    const validate = () => {
        if (!user.first_name || !user.last_name || !user.phone || !user.email || !user.password || !user.confirmPassword) {
            setMsg("Vui lòng nhập đầy đủ thông tin!");
            return false;
        }
        if (user.password !== user.confirmPassword) {
            setMsg("Mật khẩu xác nhận không khớp!");
            return false;
        }
        if (!user.avatar || !user.avatar.uri) {
            setMsg("Vui lòng chọn ảnh đại diện!");
            return false;
        }
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            setMsg("Email không hợp lệ!");
            return false;
        }
        if (!user.password || user.password.length < 6) {
            setMsg("Mật khẩu phải từ 6 ký tự trở lên!");
            return false;
        }
        return true;
    };

    const register = async () => {
        if (validate() === true){
            try {
                SetLoading(true);

                let form = new FormData();
                for (let key in user){
                    if(key !== 'confirmPassword'){
                        if (key === 'avatar'){
                            form.append('avatar', {
                                uri: user.avatar?.uri,
                                name: user.avatar?.fileName || "avatar.jpg",
                                type: user.avatar?.type || "image/jpeg"
                            });

                        }
                        else
                            form.append(key, user[key]);
                    }
                }
                const userRole = user.role
                let url = endpoinds['register'](userRole);
                console.info(user);
                for (let pair of form.entries()) {
                        console.log(pair[0]+ ': ' + JSON.stringify(pair[1]));
                        }
                let res = await Apis.post(url, form, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }
                    
                });
                

                if (res.status=== 201)
                    nav.navigate('login');
            } 
            catch (error) {
                console.error(error);
            }
            finally{
                SetLoading(false);
            }
        }
    }


    return(
        <SafeAreaView>
            <ScrollView style={Styles.m}>

                <TextInput label="Tên" value={user.first_name} onChangeText={t => setState(t, "first_name")} style={Styles.m} />
                <TextInput label="Họ và tên đệm" value={user.last_name} onChangeText={t => setState(t, "last_name")} style={Styles.m} />
                <TextInput label="Số điện thoại" keyboardType="phone-pad" value={user.phone} onChangeText={t => setState(t, "phone")} style={Styles.m} />
                <TextInput label="Email" keyboardType="email-address" value={user.email} onChangeText={t => setState(t, "email")} style={Styles.m} />
                <TextInput label="Mật khẩu" secureTextEntry value={user.password} onChangeText={t => setState(t, "password")} style={Styles.m} />
                <TextInput label="Xác nhận mật khẩu" secureTextEntry value={user.confirmPassword} onChangeText={t => setState(t, "confirmPassword")} style={Styles.m} />

                {/* Gender */}
                <Text>Giới tính:</Text>
                <RadioButton.Group onValueChange={v => setState(v, "gender")} value={user.gender}>
                    <View style={{ flexDirection: "row" }}>
                        <RadioButton.Item label="Nam" value="Male" />
                        <RadioButton.Item label="Nữ" value="Female" />
                        <RadioButton.Item label="Khác" value="Other" />
                    </View>
                </RadioButton.Group>

                {/* Role */}
                <Text>Vai trò:</Text>
                <RadioButton.Group onValueChange={v => setState(v, "role")} value={user.role}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        <RadioButton.Item label="Người bán" value="seller" />
                        <RadioButton.Item label="Người mua" value="buyer" />
                    </View>
                </RadioButton.Group>

                {/* Avatar */}
                <TouchableOpacity onPress={picker}>
                    <Text style={Styles.m}>Chọn ảnh đại diện</Text>
                </TouchableOpacity>
                {user.avatar && <Image source={{ uri: user.avatar.uri }} style={Styles.avatar} />}

                {/* Thông báo lỗi */}
                {msg !== "" && <Text style={{ color: "red" }}>{msg}</Text>}

                {/* Đăng ký */}
                <Button disabled={loading} loading={loading}  mode="contained" onPress={register} style={Styles.m}>
                    Đăng ký
                </Button>
            </ScrollView>
        </SafeAreaView>
    );

};

export default Register;