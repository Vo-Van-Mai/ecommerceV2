import { useContext, useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Apis, { authAPI, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProductCard from "../Home/ProductCard";
import { ActivityIndicator } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Shop = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shop, setShop] = useState({});
    const nav = useNavigation();

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
    };
    
    const loadShop = async () => {
        try {
            setLoading(true);
            let res = await authAPI(token).get(endpoints['myShop']);
            console.log('API Response:', res.data); // Kiểm tra dữ liệu trả về
            setShop(res.data);
        } catch (error) {
            console.error('Error loading shop:', error); // Log lỗi nếu API thất bại
        } finally {
            setLoading(false); // Đảm bảo tắt loading
        }
    };

    
   // Lấy token
    useEffect(() => {
        getToken();
    }, []);

    // Lấy shop khi có token
    useEffect(() => {
        if (token)
            loadShop();
    }, [token]);


    return (
        <View>
            {/* Khu vực tên shop và avatar */}
            <View style={[{height: 80}, Styles.border, Styles.container]}>
                <Image source={{uri: shop.avatar}} style={[Styles.imageShop, {margin: 5}]} />
                <View>
                    <Text style={{fontSize: 20,fontWeight: "bold", fontStyle:"italic"}}>{user.username}</Text>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{fontSize: 15, fontStyle:"italic"}}>{shop.name}</Text>
                        <Icon name="star" size={24} color="gold" />
                    </View>
                </View>
                
            </View>
            {/* Khu vực danh sách tiện ích */}
            <ScrollView style={[Styles.border]}>
                <View style={{padding: 10}} >
                    <Text style={{fontSize: 23, fontWeight: "bold"}}> Tiện ích của bạn</Text>
                </View>

                <TouchableOpacity onPress={() => nav.navigate("ShopProduct", {shopId: shop.id}) }>
                    <View style={Styles.item}>
                        <View style={Styles.borderIcon}>
                            <Icon name="shopping-cart" size={50} color="blue" />
                        </View>
                        <Text style={{fontSize: 20}}>Danh sách sản phẩm</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => nav.navigate("AddProduct", {shopId: shop.id, token: token})}>
                    <View style={Styles.item}>
                        <View style={Styles.borderIcon}>
                            <Icon name="cart-plus" size={50} color="blue" />
                        </View>
                        <Text style={{fontSize: 20}}>Thêm sản phẩm</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity>
                <View style={Styles.item}>
                    <View style={Styles.borderIcon}>
                        <Icon name="bar-chart-o" size={50} color="blue" />
                    </View>
                    <Text style={{fontSize: 20}}>Thống kê doanh thu</Text>
                </View>

                </TouchableOpacity>

                <TouchableOpacity>
                    <View style={Styles.item}>
                        <View style={Styles.borderIcon}>
                            <Icon name="truck" size={50} color="blue" />
                        </View>
                        <Text style={{fontSize: 20}}>Đơn hàng</Text>
                    </View>
                </TouchableOpacity>




            </ScrollView>
        </View>
    );
}

export default Shop;