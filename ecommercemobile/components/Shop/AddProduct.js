import { useContext, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Button, TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-document-picker';
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../../configs/Context";
import { MaterialIcons } from '@expo/vector-icons';

const AddProduct = ({route}) => {
    const shopId = route?.params?.shopId;
    const [product, setProduct] = useState({});
    const [images, setImages] = useState([])
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    // const token = route?.params?.token;
    const [cate, setCate] = useState([]);
    // const [description, setDescription] = useState('');
    const nav = useNavigation();
    // const richText = useRef(null);
    const user = useContext(MyUserContext);

    const loadCate = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCate(res.data.results);
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
            console.log(user.token);
            if (validate() === true){
                // product.description = description;
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
                let res = await authAPI(user.token).post(endpoints['addProduct'](shopId), form, {
                    headers: {'Content-Type': 'multipart/form-data'}
                });
                if (res.status === 201)
                    {
                        console.log("thêm thanh cong");
                        Alert.alert("Thông báo:", "Thêm sản phẩm thành công!");
                        
                        nav.navigate("ShopManagement", {shopId: shopId});
                    }       
                else
                    Alert.alert("Lỗi", "Thêm sản phẩm thất bại!");
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

    // useEffect(() => {
    //     console.log("RichText ref:", richText.current);
    // }, []);


    return(
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.label}>Danh mục sản phẩm</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={product.category}
                        onValueChange={t => setState(t, "category")}
                        style={styles.picker}
                    >
                        <Picker.Item label="Chọn danh mục" value="" />
                        {cate.map(c => (
                            <Picker.Item 
                                key={c.id.toString()} 
                                label={c.name} 
                                value={c.id} 
                            />
                        ))}
                    </Picker>
                </View>

                <TextInput
                    label="Tên sản phẩm"
                    value={product.name}
                    onChangeText={t => setState(t, "name")}
                    style={styles.input}
                    mode="outlined"
                />

                <TextInput
                    label="Mô tả sản phẩm"
                    value={product.description}
                    onChangeText={t => setState(t, "description")}
                    style={styles.input}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                />

                <TextInput
                    label="Giá sản phẩm"
                    value={product.price}
                    onChangeText={t => setState(t, "price")}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                />

                <TextInput
                    label="Số lượng"
                    value={product.quantity}
                    onChangeText={t => setState(t, "quantity")}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                />

                <TouchableOpacity 
                    style={styles.imagePickerButton} 
                    onPress={picker}
                >
                    <MaterialIcons name="add-photo-alternate" size={24} color="#1976d2" />
                    <Text style={styles.imagePickerText}>
                        Chọn ảnh sản phẩm
                    </Text>
                </TouchableOpacity>

                <View style={styles.imagePreviewContainer}>
                    {images.map((img, index) => (
                        <Image
                            key={index}
                            source={{ uri: img.uri }}
                            style={styles.previewImage}
                        />
                    ))}
                </View>

                {msg && <Text style={styles.errorText}>{msg}</Text>}

                <Button 
                    disabled={loading} 
                    loading={loading} 
                    mode="contained" 
                    onPress={addProduct}
                    style={styles.submitButton}
                    labelStyle={styles.submitButtonText}
                >
                    Thêm sản phẩm
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    formContainer: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#bdbdbd',
        marginBottom: 16,
    },
    picker: {
        height: 50,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1976d2',
        marginVertical: 16,
    },
    imagePickerText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#1976d2',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    previewImage: {
        width: 100,
        height: 100,
        margin: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    errorText: {
        color: '#d32f2f',
        marginBottom: 16,
        textAlign: 'center',
    },
    submitButton: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#1976d2',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AddProduct;