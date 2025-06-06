import { useCallback, useContext, useEffect, useState } from "react";
import MyUserReducer from "../../Reducer/MyUserReducer";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { Button } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MyStyles from "../../style/MyStyles";
import Styles from "./Styles";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Apis";
import { MyCartContext, MySetCartContext } from "../../configs/CartContext";
import { MyOrderContext, MySetOrderContext } from "../../configs/OrderContext";
import { MySetShopContext, MyShopContext } from "../../configs/ShopContext";

const Profile = () => {
    const shop = useContext(MyShopContext);
    const setShop = useContext(MySetShopContext);
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const setCart = useContext(MySetCartContext);
    const {order} = useContext(MyOrderContext);
    const setOrder = useContext(MySetOrderContext);

    const [orderQuantity, setOrderQuantity] = useState({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 });
    
    

    const loadShop = async () => {
        try {
            setLoading(true);
            if (user.role == "seller" && user.is_verified_seller == 1) {
                let res = await authAPI(user.token).get(endpoints['myShop']);
                console.log('Shop data:', res.data); // Kiểm tra dữ liệu trả về
                setShop(res.data);

            }
            else if (user.role == "buyer") {
                setShop({});
            }
        } catch (error) {
            handleError(error);
            console.log('Error loading shop:', error); 
            
        } finally {
            setLoading(false); // Đảm bảo tắt loading
        }
    };

    // Hàm để lấy đơn hàng từ một URL cụ thể
    const fetchOrdersFromUrl = async (url) => {
        try {
            const res = await authAPI(user.token).get(url);
            return res.data;
        } catch (ex) {
            console.error("Lỗi khi lấy đơn hàng:", ex);
            return null;
        }
    };

    // Hàm để lấy và đếm tất cả đơn hàng
    const fetchAllOrders = async (initialUrl) => {
        let currentUrl = initialUrl;
        const quantityMap = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };

        while (currentUrl) {
            const data = await fetchOrdersFromUrl(currentUrl);
            if (!data?.results) break;

            // Đếm đơn hàng trong trang hiện tại
            data.results.forEach((o) => {
                const status = o.status?.toString();
                if (status) {
                    quantityMap[status] = (quantityMap[status] || 0) + 1;
                }
            });

            // Cập nhật URL cho trang tiếp theo
            currentUrl = data.next;
        }

        return quantityMap;
    };

    const loadOrder = async () => {
        try {
            let initialEndpoint = '';
            if (user.role === "buyer") {
                initialEndpoint = endpoints['orderOfBuyer'];
                console.log(`Đang load đơn hàng của user ${user.username}`);
            } else if (user.role === "seller") {
                initialEndpoint = endpoints['orderOfShop'];
                console.log("Đang load đơn hàng của shop");
            }

            const Orderres = await authAPI(user.token).get(initialEndpoint);
            
            if (Orderres) {
                const data = Orderres.data;
                console.log(`Đơn hàng:`, data);
                
                setOrder({
                    type: "set_order",
                    payload: data
                });

                // Bắt đầu quá trình đếm tất cả đơn hàng
                const totalQuantityMap = await fetchAllOrders(initialEndpoint);
                console.log("Tổng số đơn hàng theo trạng thái:", totalQuantityMap);
                setOrderQuantity(totalQuantityMap);
            }
        } catch (ex) {
            handleError(ex);
            // console.log("Lỗi khi tải đơn hàng:", ex);
        }
    };

   

    useFocusEffect(
        useCallback(() => {
          if (!user.token) return;
      
          if (user.role === "buyer") {
            loadOrder();
          } else if (user.role === "seller") {
            // Chỉ load shop nếu chưa có
            if (!shop?.shop?.id) {
              loadShop();
            }
            loadOrder();
          }
        }, [user.token, user?.role, shop?.id])
      );
      
      
      const handleError = (error) => {
        const status = error?.response?.status;
        // console.log("status:", status);
        if ([401, 403, 404].includes(status)) {
            setShop({});
            Alert.alert("Lỗi", "Bạn chưa có cửa hàng", [
                {
                    text: "OK",
                    onPress: () => nav.navigate("Tạo cửa hàng")
                }
            ]);
        }
      }

 

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
                        <Text><Text style={{fontWeight: "bold"}}>Giới tính: </Text> {user.gender === "Male" ? "Nam" : user.gender === "Female" ? "Nữ" : "Khác"} </Text>
                        <Text><Text style={{fontWeight: "bold"}}>Địa chỉ: </Text> chưa có update sau</Text>
                    </View>
                </View>

                {/* Giao diện của buyer */}
                {user.role === "buyer" && <View>
                    <View style={Styles.border}>

                        <Text style={{fontWeight: "bold"}}>Đơn hàng của bạn nè!</Text>
                        {/* Khu vực đơn mua của buyer*/}
                        <View style={[{flexDirection: "row", justifyContent:"center", marginTop: 5}]}>
                            <TouchableOpacity onPress={() => nav.navigate("Đơn hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["1"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["1"]}</Text>
                                </View>}
                                <Icon name="wpforms" size={30} color={"gray"}/>
                                
                                <Text>Chờ xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => nav.navigate("Chờ lấy hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["2"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["2"]}</Text>
                                </View>}
                                <Icon name="check-square" size={30} color={"gray"}/>
                                <Text>Chờ lấy hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => nav.navigate("Đang giao hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["4"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["4"]}</Text>
                                </View>}
                                <Icon name="truck" size={30} color={"gray"}/>
                                <Text>Đang giao hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{alignItems:"center", margin: 5, padding: 5}}>
                                <Icon name="smile-o" size={30} color={"gray"}/>
                                <Text>Đánh giá</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <TouchableOpacity onPress={() => nav.navigate("Lịch sử đơn hàng")} style={[Styles.border]}>
                        <Text style={{fontWeight: "bold"}}> Xem lịch sử mua hàng</Text>
                    </TouchableOpacity>
                </View>}

                {/* Giao diện của seller */}
                {user.is_verified_seller == 1 && <View>
                <View>
                    
                    <View style={Styles.border}>

                        <Text style={{fontWeight: "bold"}}>Đơn hàng của bạn</Text>
                        {/* Khu vực đơn mua của seller*/}
                        <View style={[{flexDirection: "row", justifyContent:"center", marginTop: 5}]}>
                            <TouchableOpacity onPress={() => nav.navigate("Đơn hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["1"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["1"]}</Text>
                                </View>}
                                <Icon name="wpforms" size={30} color={"gray"}/>
                                <Text>Chờ xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => nav.navigate("Chờ lấy hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["2"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["2"]}</Text>
                                </View>}
                                <Icon name="check-square" size={30} color={"gray"}/>
                                <Text>Đang lấy hàng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => nav.navigate("Đang giao hàng")} style={{alignItems:"center", margin: 5, padding: 5}}>
                                {orderQuantity["4"] > 0 && <View style={Styles.countOrder}>
                                    <Text style={{color: "white", fontSize: 12}}>{orderQuantity["4"]}</Text>
                                </View>}
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

                <TouchableOpacity onPress={() => nav.navigate("Lịch sử đơn hàng")} style={[Styles.border]}>
                        <Text style={{fontWeight: "bold"}}> Xem tất cả đơn hàng</Text>
                    </TouchableOpacity>

                
                </View>
                }
                {(user.is_verified_seller == 0  && user.role == "seller")&& <View>
                    <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "center"}}>Bạn chưa được xác thực làm người bán</Text>
                    <Text style={{fontSize: 16, fontWeight: "bold", textAlign: "center"}}>Vui lòng đợi xác thực từ hệ thống!</Text>
                </View>}

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
            
        </SafeAreaView>
        
    );
}

export default Profile;