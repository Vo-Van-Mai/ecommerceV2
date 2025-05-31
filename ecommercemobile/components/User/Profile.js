import { useContext, useEffect, useReducer, useState } from "react";
import MyUserReducer from "../../Reducer/MyUserReducer";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../style/MyStyles";
import Styles from "./Styles";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Apis";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shop, setShop] = useState({});
    const nav = useNavigation();

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
        console.log("token ở đây", storedToken);
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
        if (token && user.role === "seller")
            loadShop();
    }, [token]);

    const logout = () => {
        dispatch({
            "type": "logout"
        });
        nav.navigate("Trang chủ");
    };

    return(
        <SafeAreaView>
            <ScrollView>
                <View style={{backgroundColor: "lightblue", height: 50, justifyContent: "center", borderTopRightRadius: 25, borderTopLeftRadius: 25}}>
                    <Text style={MyStyles.brandName}>
                        Thông tin của bạn
                    </Text>
                </View>

                <View style={Styles.borderProfileAvater}>
                        {/* Avatar và username */}
                    <View style={[{alignItems:"center"} ]}>
                        <Image source={{ uri: user.avatar }} style={[Styles.avatar]} />
                        <Text style={[Styles.username]}>{user.last_name} {user.first_name}</Text>
                        <Text style={{fontStyle:"italic"}}>username: {user.username}</Text>
                    </View>
                    <View style={[{ justifyContent:"space-around", marginLeft: 20} ]}>
                        <Text><Text style={{fontWeight: "bold"}}>Email: </Text>{user.email}</Text>
                        <Text><Text style={{fontWeight: "bold"}}>Số điện thoại: </Text>{user.phone}</Text>
                        <Text><Text style={{fontWeight: "bold"}}>Giới tính: </Text> {user.gender} </Text>
                        <Text><Text style={{fontWeight: "bold"}}>Địa chỉ: </Text> chưa có update sau</Text>
                    </View>
                </View>

                {/* Giao diện của buyer */}
                {user.role === "buyer" && <View>
                    <View style={Styles.border}>

                        <Text style={{fontWeight: "bold"}}>Đơn hàng của bạn</Text>
                        {/* Khu vực đơn mua của seller*/}
                        <View style={[{flexDirection: "row", justifyContent:"center", marginTop: 5}]}>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="wpforms" size={30} color={"gray"}/>
                                <Text>Chờ xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="check-square" size={30} color={"gray"}/>
                                <Text>Chờ lấy hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="truck" size={30} color={"gray"}/>
                                <Text>Đang giao hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="smile-o" size={30} color={"gray"}/>
                                <Text>Đánh giá</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <TouchableOpacity style={[Styles.border]}>
                        <Text style={{fontWeight: "bold"}}> Xem lịch sử mua hàng</Text>
                    </TouchableOpacity>
                </View>}

                {/* Giao diện của seller */}
                {user.role === "seller" && <View>
                <View>
                    <View style={Styles.border}>

                        <Text style={{fontWeight: "bold"}}>Đơn hàng của bạn</Text>
                        {/* Khu vực đơn mua của seller*/}
                        <View style={[{flexDirection: "row", justifyContent:"center", marginTop: 5}]}>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="wpforms" size={30} color={"gray"}/>
                                <Text>Chờ xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="check-square" size={30} color={"gray"}/>
                                <Text>Chờ lấy hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="truck" size={30} color={"gray"}/>
                                <Text>Đang giao hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="smile-o" size={30} color={"gray"}/>
                                <Text>Đánh giá</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[Styles.border]}>
                    <Text style={{fontWeight: "bold"}}>Danh sách dịch vụ tiện ích</Text>

                    <TouchableOpacity onPress={() => nav.navigate("Quản lý cửa hàng", {screen: "ShopProduct", params: {shopId: shop?.id}}) }>
                        <View style={Styles.item}>
                            <View style={Styles.borderIcon}>
                                <Icon name="shopping-cart" size={30} color={"gray"} />
                            </View>
                            <Text style={{fontSize: 18}}>Danh sách sản phẩm</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => nav.navigate("Quản lý cửa hàng", {screen: "AddProduct", params: {shopId: shop?.id, token: token}})}>
                        <View style={Styles.item}>
                            <View style={Styles.borderIcon}>
                                <Icon name="cart-plus" size={30} color={"gray"} />
                            </View>
                            <Text style={{fontSize: 18}}>Thêm sản phẩm</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <View style={Styles.item}>
                            <View style={Styles.borderIcon}>
                                <Icon name="bar-chart-o" size={23} color={"gray"} />
                            </View>
                            <Text style={{fontSize: 18}}>Thống kê doanh thu</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <View style={Styles.item}>
                            <View style={Styles.borderIcon}>
                                <Icon name="money" size={30} color={"gray"} />
                            </View>
                            <Text style={{fontSize: 18}}>Đơn hàng</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                </View>
                }

                <View style={[Styles.border, {alignItems:"flex-start"}]}>
                    <Text style={{fontWeight: "bold"}}>Hổ trợ</Text>
                    <TouchableOpacity style={{alignItems:"center",flexDirection: "row"}}>
                        <Icon name="whatsapp" size={30} color={"gray"} style={{margin: 5}}/>
                        <Text>Trung tâm trợ giúp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{alignItems:"center",flexDirection: "row"}}>
                        <Icon name="commenting-o" size={30} color={"gray"} style={{margin: 5}}/>
                        <Text>Trò chuyện với NM-Commerce</Text>
                    </TouchableOpacity>

                </View>
                
            </ScrollView>
            <Button style={Styles.btnLogout} mode="contained" onPress={logout}> 
                Đăng xuất
            </Button>
        </SafeAreaView>
        
    );
}

export default Profile;