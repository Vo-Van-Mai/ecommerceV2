import { useContext, useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity} from "react-native";
import { View } from "react-native";
import { Button, HelperText, RadioButton, TextInput } from "react-native-paper";
import Styles from "./Styles";
import * as ImagePicker from 'expo-image-picker';
import Apis, { authAPI, endpoints  } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Context";
const CreateShop = () =>{
    const user = useContext(MyUserContext);
    const [loading, SetLoading] = useState(false);
    const [shop, setShop] = useState({
        name: '',
        description: '',
        avatar: null,
    });
    const nav = useNavigation();

    const setState = (value, field) => {
        setShop({...shop, [field]: value});
    }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                setState(result.assets[0],'avatar');
        }
    }

    const validate = () => {
        if(!shop.name || !shop.description || !shop.avatar){
            Alert.alert("Vui lòng nhập đầy đủ thông tin");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if(!validate()) return;
        try {
          
            SetLoading(true);
            const form = new FormData();
            form.append('name', shop.name);
            form.append('description', shop.description);
            form.append('avatar', {
              uri: shop.avatar.uri,
              name: 'avatar.jpg',
              type: 'image/jpeg',
            });
            const res = await authAPI(user.token).post(endpoints['shops'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.status === 201) {
              // Gọi lại API để lấy thông tin shop mới tạo
              const shopRes = await authAPI(user.token).get(endpoints['shops']);
              console.log("shopRes:", shopRes.data);
             
              setShop({
                type: "set_shop",
                payload: shopRes.data
              });
        
              Alert.alert("Thành công", "Cửa hàng đã được tạo", [
                {
                  text: "OK",
                  onPress: () => nav.navigate("Chính", {screen: "Trang chủ"})
                }
              ]);
            }
            else{
                Alert.alert("Thất bại", "Tạo cửa hàng thất bại");
            }
        } catch (error) {
          console.log("user_role:", user.role);
            console.log("Tạo thất bại do:", error.message);
        } finally {
            SetLoading(false);
        }
    }

    return(
        <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo cửa hàng của bạn</Text>

      <TextInput
        style={styles.input}
        placeholder="Tên cửa hàng"
        value={shop.name}
        onChangeText={t => setState(t, 'name')}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Mô tả"
        value={shop.description}
        onChangeText={t => setState(t, 'description')}
        multiline={true}
        mode="outlined"
      />

      <TouchableOpacity onPress={picker} style={styles.imagePicker}>
        {shop.avatar ? (
          <Image source={{ uri: shop.avatar.uri }} style={styles.image} />
        ) : (
          <Text>Chọn ảnh đại diện</Text>
        )}
      </TouchableOpacity>

      <Button mode="contained" disabled={loading} onPress={handleSubmit} loading={loading}>
        {loading ? 'Đang tạo...' : 'Tạo cửa hàng'}
      </Button>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
    container: {
      padding: 20,
      gap: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#aaa',
      borderRadius: 10,
      padding: 5,
    },
    imagePicker: {
      height: 150,
      borderWidth: 1,
      borderColor: '#aaa',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });

export default CreateShop;