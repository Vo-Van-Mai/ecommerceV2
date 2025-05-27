import React, { useContext, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import Styles from './Styles';
import Apis, { authAPI, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContentWidth } from 'react-native-render-html';
import { MyDispatchContext } from '../../configs/Context';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [user, setUser] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, SetLoading] = useState(false);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  const setState = (value, field) => {
    setUser({...user, [field]:value} )
  };

  const validate = () => {
        if (user.username===""|| user.password==="") {
            setMsg("Vui lòng nhập đầy đủ thông tin!");
            console.log(user);
            return false;
        }
        return true;
    };

    const login = async () => {
    if (validate() === true) {
        try {
          SetLoading(true);

          let res = await Apis.post(endpoints['login'],{
            ...user,
            client_id: 'otU6JHb3hEnlF9JaRxOsLBOGApEiZ5SYhK22rE9x',
            client_secret: 'vt9Zk6J754JBxgHZFg0BdmrSPhEbcJAhMHaHO7KDojvMdmwgUYOisX5Tt7GKwItbtgbYd28onjwfBkAFSoGdgfJqEhJ4FT2yR3e37bBMNdMzBhKC9AZBy4tWvlLcKWfn',
            grant_type: 'password'
          },{
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }
          );
          console.log(res.data);
          await AsyncStorage.setItem('token', res.data.access_token);
          let u = await authAPI(res.data.access_token).get(endpoints['current_user']);
          console.info(u.data);
          dispatch({
            "type": "login",
            "payload": u.data
          });
          nav.navigate('Trang chủ');

        if (res.status === 201)
            // nav.navigate('home');
          console.log("login success");
        else
            setMsg("Đăng ký thất bại!");
        } catch (error) {
          console.error(error);
        } finally {
          SetLoading(false);
        }
    }
    };

  return (
    <SafeAreaView style={Styles.container}>
      <Text style={Styles.header}>Đăng nhập</Text>

      {/* Email Input */}
      <TextInput
        style={Styles.input}
        placeholder="username"
        value={user.username}
        onChangeText={t => setState(t, 'username')}
      />

      {/* Password Input */}
      <TextInput
        style={Styles.input}
        placeholder="Password"
        value={user.password}
        onChangeText={t => setState(t, 'password')}
        secureTextEntry
      />

      {/* Continue Button */}
      <Button
        disabled={loading} loading={loading}
        mode="contained"
        onPress={login}
        style={Styles.continueBtn}
        labelStyle={{ color: 'white' }}
      >
        Continue
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
          Bạn đã chưa có tài khoản? <Text style={Styles.boldLink} > Tạo ngay</Text>
        </Text>
      </TouchableOpacity>

      {/* Social Login */}
      <View style={Styles.socialContainer}>
        <SocialButton icon={<Ionicons name="logo-apple" size={20} />} text="Tiếp tục với Apple" />
        <SocialButton icon={<AntDesign name="google" size={20} color="red" />} text="Tiếp tục với Google" />
        <SocialButton icon={<FontAwesome name="facebook" size={20} color="blue" />} text="Tiếp tục với Facebook" />
      </View>
    </SafeAreaView>
  );
};

const SocialButton = ({ icon, text }) => (
  <TouchableOpacity style={Styles.socialButton}>
    {icon}
    <Text style={Styles.socialText}>{text}</Text>
  </TouchableOpacity>
);


export default Login;
