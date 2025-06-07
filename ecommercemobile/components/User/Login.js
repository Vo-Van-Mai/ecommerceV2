import React, { useContext, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import Styles from './Styles';
import Apis, { authAPI, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContentWidth } from 'react-native-render-html';
import { MyDispatchContext } from '../../configs/Context';
import { useNavigation } from '@react-navigation/native';
import { MySetCartContext } from '../../configs/CartContext';
import { MySetShopContext } from '../../configs/ShopContext';

const Login = () => {
  const [user, setUser] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, SetLoading] = useState(false);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  const setCart = useContext(MySetCartContext);
  const [showPassword, setShowPassword] = useState(false);
  const setShop = useContext(MySetShopContext);
  const setState = (value, field) => {
    setUser({...user, [field]:value} )
  };

  const validate = () => {
        if (!user.username || !user.password) {
            setMsg("Vui lòng nhập đầy đủ thông tin!");
            console.log(user);
            return false;
        };
        return true;
    };

    const login = async () => {
    if (validate() === true) {
        try {
          SetLoading(true);

          const form = new URLSearchParams();
          form.append("username", user.username);
          form.append("password", user.password);
          form.append("client_id", process.env.REACT_APP_CLIENT_ID);
          form.append("client_secret", process.env.REACT_APP_CLIENT_SECRET);
          form.append("grant_type", "password");

          let res = await Apis.post(endpoints['login'], form.toString(), {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          });

          console.log(res.data);
          await AsyncStorage.setItem('token', res.data.access_token);
          let u = await authAPI(res.data.access_token).get(endpoints['current_user']);
          console.info("user:", u.data);
          dispatch({
            "type": "login",
            "payload": {...u.data, token: res.data.access_token}
          });
          
          if (u.data.role == "buyer") {
            console.log("GỌi loadCart:");
            // Gọi loadCart 
            const cartRes = await authAPI(res.data.access_token).get(endpoints['cart']);
              setCart({
                type: "set_cart",
                payload: cartRes.data
              });
          }
          else if (u.data.role == "seller") {
            console.log("GỌi loadShop:");
            console.log("res.data.access_token:", res.data.access_token);
            // Gọi loadShop
            const url = endpoints['myShop'];
            console.log("url:", url);
            const shopRes = await authAPI(res.data.access_token).get(url);
            setShop({
              type: "set_shop",
              payload: shopRes.data
            });
            console.log("shopRes:", shopRes.data);
          }
          nav.navigate('Trang chủ');
        } catch (error) {
          // console.error(error);
        
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
        
            if (status === 404) {
              setMsg("Tài khoản không tồn tại!");
              setShop({});
            } else if (status === 401) {
              setMsg("Không được phép! Vui lòng kiểm tra thông tin đăng nhập.");
            } else if (status === 400) {
              if (data?.error === "invalid_grant") {
                setMsg("Tên đăng nhập hoặc mật khẩu không đúng!");
              } else {
                setMsg("Đăng nhập thất bại! Vui lòng thử lại sau.");
              }
            } else {
              setMsg("Đã xảy ra lỗi! Vui lòng thử lại sau.");
            }
        
          } else {
            setMsg("Lỗi kết nối! Vui lòng kiểm tra mạng.");
          }
        }finally {
          SetLoading(false);
        }
    }
    };

  return (
    <KeyboardAvoidingView behavior="padding" style={Styles.container}>
      <SafeAreaView style={Styles.container}>
      <Text style={Styles.header}>Đăng nhập</Text>
      
      {/* usernname Input */}
      <TextInput
        style={[Styles.input, {width: '94%', marginRight: 10}]}
        placeholder="username"
        value={user.username}
        onChangeText={t => setState(t, 'username')}
      />

      {/* Password Input */}
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
        <TextInput
          style={[Styles.input, {width: '94%', marginRight: 10}]}
          placeholder="Password"
          value={user.password}
          onChangeText={t => setState(t, 'password')}
          secureTextEntry={!showPassword}
      />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ?<Ionicons name="eye-outline" size={24} color="black" /> : <Ionicons name="eye-off-outline" size={24} color="black" />}
        </TouchableOpacity>
      </View>

      {/* Lỗi đăng nhập */}
      {msg && (
        <Text style={Styles.errorText}>{msg}</Text>
      )}

      {/* Continue Button */}
      <Button
        disabled={loading} loading={loading}
        mode="contained"
        onPress={login}
        style={Styles.continueBtn}
        labelStyle={{ color: 'white' }}
      >
        Đăng nhập
      </Button>

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text style={Styles.linkText}>
          Quên mật khẩu? <Text style={Styles.boldLink}>Lấy lại</Text>
        </Text>
      </TouchableOpacity>

      {/* Create Account */}
      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => nav.navigate("Register")}>
        <Text style={Styles.linkText}>
          Bạn chưa có tài khoản? <Text style={Styles.boldLink} > Tạo ngay</Text>
        </Text>
      </TouchableOpacity>

      {/* Social Login */}
      <View style={Styles.socialContainer}>
        <SocialButton icon={<Ionicons name="logo-apple" size={20} />} text="Tiếp tục với Apple" />
        <SocialButton icon={<AntDesign name="google" size={20} color="red" />} text="Tiếp tục với Google" />
        <SocialButton icon={<FontAwesome name="facebook" size={20} color="blue" />} text="Tiếp tục với Facebook" />
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const SocialButton = ({ icon, text }) => (
  <TouchableOpacity style={Styles.socialButton}>
    {icon}
    <Text style={Styles.socialText}>{text}</Text>
  </TouchableOpacity>
);


export default Login;
