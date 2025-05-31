import { useContext, useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity} from "react-native";
import { View } from "react-native";
import { Button, HelperText, RadioButton, TextInput } from "react-native-paper";
import Styles from "./Styles";
import * as ImagePicker from 'expo-image-picker';
import Apis, { authAPI, endpoints  } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
const EditProfile = () =>{
    const user = useContext(MyUserContext);
    const [newUser, setNewUser] = useState({});
    const [token, setToken] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        console.log("token ở đây", storedToken);
    };

     // Lấy token
    useEffect(() => {
        getToken();
    }, []);


    const setState = (value, field) => {
        setNewUser({...newUser, [field]: value});
    }

    useEffect(() => {
        if (user) {
            setNewUser({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                newUsername: user.username || "",
                phone: user.phone || "",
                email: user.email || "",
                gender: user.gender || "Other",
                avatar: user.avatar ? { uri: user.avatar } : null,
                password: "",
                confirmPassword: ""
            });
        }
    }, [user]);

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
        
        if (newUser.password !== newUser.confirmPassword) {
            setMsg("Mật khẩu xác nhận không khớp!");
            return false;
        }
        if (!newUser.avatar || !newUser.avatar.uri) {
            setMsg("Vui lòng chọn ảnh đại diện!");
            return false;
        }
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            setMsg("Email không hợp lệ!");
            return false;
        }
        if (!newUser.password || newUser.password.length < 6) {
            setMsg("Mật khẩu phải từ 6 ký tự trở lên!");
            return false;
        }
        return true;
    };

    const updateUser = async () => {
        try {
            if(validate() === true){
                setLoading(true);
                let form = new FormData();
                for (let key in newUser) {
                    if (key !== 'confirmPassword') {
                        if (key === 'avatar') {
                            form.append('avatar', {
                                uri: newUser.avatar?.uri,
                                name: newUser.avatar?.fileName || "avatar.jpg",
                                type: newUser.avatar?.type?.includes("image") ? "image/jpeg" : newUser.avatar?.type || "image/jpeg"
                                });
                        } else {
                            form.append(key, newUser[key]);
                        }
                    }
                }
                let url = endpoints['current_user'];
                console.info("User:", newUser);
                console.log("API URL:", url);
    
                for (let pair of form.entries()) {
                    console.log(pair[0] + ': ' + JSON.stringify(pair[1]));
                }
    
                let res = await authAPI(token).patch(url, form, {
                    headers: {'Content-Type': 'multipart/form-data',}
                });
    
                if (res.status === 200)
                    {
                        console.log("Cập nhật thành công");
                        nav.navigate('Chính');
                    }
                else
                    setMsg("Cập nhật thất bại!");
            }
        } catch (error) {
            
        }finally{
            setLoading(false);
        }
    }

    return(
        <SafeAreaView style={[Styles.m, Styles.container]}>
            <Text style={Styles.header}>Cập nhật thông tin</Text>
            <ScrollView >

                <TextInput label="Tên" value={newUser.first_name} onChangeText={t => setState(t, "first_name")} style={[Styles.m, Styles.input]} />
                <TextInput label="Họ và tên đệm" value={newUser.last_name} onChangeText={t => setState(t, "last_name")} style={[Styles.m, Styles.input]} />
                <TextInput label="username" value={newUser.newUsername} onChangeText={t => setState(t, "newUsername")} style={[Styles.m, Styles.input]} />
                <TextInput label="Số điện thoại" keyboardType="phone-pad" value={newUser.phone} onChangeText={t => setState(t, "phone")} style={[Styles.m, Styles.input]} />
                <TextInput label="Email" keyboardType="email-address" value={newUser.email} onChangeText={t => setState(t, "email")} style={[Styles.m, Styles.input]} />
                <TextInput label="Mật khẩu mới" secureTextEntry value={newUser.password} onChangeText={t => setState(t, "password")} style={[Styles.m, Styles.input]} />
                <TextInput label="Xác nhận mật khẩu" secureTextEntry value={newUser.confirmPassword} onChangeText={t => setState(t, "confirmPassword")} style={[Styles.m, Styles.input]} />

                {/* Gender */}
                <Text>Giới tính:</Text>
                <RadioButton.Group onValueChange={v => setState(v, "gender")} value={newUser.gender}>
                    <View style={{ flexDirection: "row" }}>
                        <RadioButton.Item label="Nam" value="Male" />
                        <RadioButton.Item label="Nữ" value="Female" />
                        <RadioButton.Item label="Khác" value="Other" />
                    </View>
                </RadioButton.Group>

                {/* Avatar */}
                <TouchableOpacity onPress={picker}>
                    <Text style={Styles.m}>Chọn ảnh đại diện</Text>
                </TouchableOpacity>
                {newUser.avatar && <Image source={{ uri: newUser.avatar.uri }} style={Styles.avatar} />}

                {/* Thông báo lỗi */}
                {msg !== "" && <Text style={{ color: "red" }}>{msg}</Text>}

                {/* Đăng ký */}
                <Button disabled={loading} loading={loading}  mode="contained" onPress={updateUser} style={Styles.m}>
                    Cập nhật
                </Button>
            </ScrollView>
        </SafeAreaView>
    );

};

export default EditProfile;