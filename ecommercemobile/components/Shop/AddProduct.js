import { useEffect, useState } from "react";
import Styles from "../Shop/Styles";
import { Alert, Image, ScrollView, Text, TouchableOpacity } from "react-native";
import { Button, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-document-picker';
import { relativeTimeRounding } from "moment";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const AddProduct = ({route}) => {
    const shopId = route?.params?.shopId;
    const [product, setProduct] = useState({});
    const [images, setImages] = useState([])
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const token = route?.params?.token;
    const [cate, setCate] = useState([]);
    const nav = useNavigation();

    const loadCate = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCate(res.data);
    }

    const setState = (value, field) => {
        setProduct({...product, [field]: value});
    }


    const picker = async () => {
        try {
            const result = await ImagePicker.getDocumentAsync({
                type: 'image/*',
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                console.log("Chọn ảnh thành công:", result.assets);
                // Cập nhật state lưu ảnh
                setImages(result.assets); // hoặc setImage(result.assets)
            }
        } catch (error) {
            console.error("Lỗi khi chọn ảnh:", error);
        }
    };

    const validate = () => {
        if (!product.name || !product.description || !product.price || !product.quantity)
        {
            setMsg("Vui lòng nhập đủ thông tin sản phẩm!");
            return false;
            }
        if (images.length < 1)
        {
            setMsg("vui lòng chọn ảnh cho sản phẩm!");
            return false;
        }
        return true

    }

    const addProduct = async () => {
        try {
            setLoading(true);
            console.log("Press");
            console.log(token);
            if (validate() === true){
                const form = new FormData();
                for (let key in product){
                    form.append(key, product[key]);
                }
                images.forEach((img, index) => {
                    form.append("images", {
                        uri: img.uri,
                        name: img.name || `photo_${index}.jpg`,
                        type: img.mimeType || "image/jpeg",
                    });
                });
                let res = await authAPI(token).post(endpoints['addProduct'](shopId), form, {
                    headers: {'Content-Type': 'multipart/form-data'}
                });
                if (res.status === 201)
                    {
                        console.log("thêm thanh cong");
                        Alert.alert("Thông báo:", "Thêm sản phẩm thành công!");
                    }       
                else
                    Alert.alert("Lỗi", "Thêm sản phẩm thất bại!");
                nav.navigate("ShopProduct", {shopId: shopId});
            }
        } catch (error) {
            console.error(error);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCate();
    }, []);


    return(
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Picker
                selectedValue={product.category}
                onValueChange={t => setState(t, "category")}
            >
                {cate.map(c => <Picker.Item key={c.id.toString()} label={c.name} value={c.id} />)}
                
            </Picker>
            <Text>Bạn chọn: {product.category}</Text>

            <TextInput
                label="Tên sản phẩm"
                value={product.name}
                onChangeText={t => setState(t, "name")}
                />

            <TextInput
                label="Mô tả"
                value={product.description}
                onChangeText={t => setState(t, "description")}
                />

            <TextInput
                label="Giá sản phẩm: "
                value={product.price}
                onChangeText={t => setState(t, "price")}
                />

            <TextInput
                label="Số lượng"
                value={product.quantity}
                onChangeText={t => setState(t, "quantity")}
                />

            <TouchableOpacity style={{height: 40}} onPress={picker}>
                <Text style={{fontSize: 24, color: "darkblue"}}>
                    Chọn ảnh sản phẩm
                </Text>
            </TouchableOpacity>
            {images.map((img, index) => (
                <Image
                    key={index}
                    source={{ uri: img.uri }}
                    style={{ width: 100, height: 100, marginVertical: 8 }}
                />
            ))}

            {msg &&<Text>{msg}</Text>}

            <Button disabled={loading} loading={loading} mode="contained" onPress={addProduct}> Thêm sản phẩm</Button>
                    
        </ScrollView>
    );
}

export default AddProduct;