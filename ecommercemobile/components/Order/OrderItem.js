import { Text, View, ScrollView, TouchableOpacity, Touchable, Alert } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { MyOrderContext, MySetOrderContext } from "../../configs/OrderContext";
import { useContext, useState } from "react";
import { Card, Divider, Badge } from "react-native-paper";
import styles from "./Styles";
import { formatCurrency } from "../../utils/PriceUtils";
import { MyUserContext } from "../../configs/Context";
import OrderDetail from "./OrderDetail";
import { authAPI, endpoints } from "../../configs/Apis";

const OrderItem = ({status}) => {
    console.log("status:", status);
    console.log(typeof status, status)
    
    const {orders, loading, error} = useContext(MyOrderContext);
    const setOrders = useContext(MySetOrderContext);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false);
    const user = useContext(MyUserContext);
    const [orderDetail, setOrderDetail] = useState([]);
    console.log("order:", orders);
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
   
    const loadOrderDetail = async(orderId) => {
        if(showOrderDetail){
            setShowOrderDetail(false);
            
        }else{
            setShowOrderDetail(true);
            try {
                // console.log("orderId:", orderId);
                setLoadDetail(true);
                let url = endpoints["orderDetail"](orderId);
                // console.log("url:", url);
                let resOrderDetail = await authAPI(user.token).get(url);
                console.log("response thông tin đơn hàng:", resOrderDetail.data);
                if(resOrderDetail.status === 200){
                    setOrderDetail(resOrderDetail.data);

                }

            } catch (error) {
                if (error.response.status === 404){
                    console.log("Không tìm thấy trang (page not found):", error);
                }
                console.log("error:", error);
            }finally{
                setLoadDetail(false);
            }
        }
    }

    const cancelOrder = async(orderId) => {
        try {
            setLoadDetail(true);
            let resCancelOrder = await authAPI(user.token).patch(endpoints["orderCancel"](orderId));
            console.log("response thông tin đơn hàng:", resCancelOrder.data);
            if(resCancelOrder.status === 200){
                setOrders({type: "cancel_order", payload: resCancelOrder.data});
                Alert.alert("Thành công", "Đơn hàng đã được hủy thành công");
            }
        } catch (error) {
            console.log("error:", error);
        }finally{
            setLoadDetail(false);
        }
    }

    const handleRemoveOrder = async(orderId) => {
        try {
            Alert.alert("Xác nhận", "Bạn có muốn hủy đơn hàng này không?", [
                {text: "Hủy", style: "cancel"},
                {text: "Xác nhận", onPress: () => {
                    cancelOrder(orderId);
                    
                }}
            ])
        }catch(error){
            console.log("error:", error);
        }
    }


    

    if (loading) return <Text style={styles.title}>Đang tải đơn hàng...</Text>;
    if (error) return <Text style={styles.title}>Có lỗi xảy ra: {error}</Text>;
    return (
        <ScrollView style={styles.container}>
            {orders.filter(order =>String(order.status) === status).map((order, index) => (

                <Card key={order.id} style={[styles.border, { marginBottom: 15 }]}>
                    <Card.Content>
                        <View style={styles.headerContainer}>
                            <Text style={styles.orderCode}>Đơn hàng #{order.id}</Text>
                            <View style={{flexDirection: "row",alignItems: "center"}}>
                                <Badge 
                                    style={{ 
                                        backgroundColor: "#FFA500",
                                        alignSelf: 'flex-start',
                                        marginRight: 10,
                                        width: 18,
                                        height: 18,
                                    }}
                                >
                                    {index + 1}
                                </Badge>

                                    {/* Hủy đơn hàng */}
                                <TouchableOpacity onPress={() => handleRemoveOrder(order.id)} style={{marginTop: -4}}>
                                    <Icon name="remove" size={25} color="red" />
                                </TouchableOpacity>


                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Ngày đặt:</Text>
                            <Text style={styles.value}>{formatDate(order.created_date)}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Địa chỉ:</Text>
                            <Text style={styles.value}>{order.address}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Số điện thoại:</Text>
                            <Text style={styles.value}>{user.phone}</Text>
                        </View>

                        <Divider style={styles.divider} />

                        {order.order_details?.map((item) => (
                            <View key={item.id} style={styles.productItem}>
                                <Text style={styles.productName}>{item.product.name}</Text>
                                <View style={styles.productDetails}>
                                    <Text style={styles.quantity}>x{item.quantity}</Text>
                                    <Text style={styles.price}>{formatCurrency(item.unit_price)}</Text>
                                </View>
                            </View>
                        ))}

                        <Text style={styles.status}>Phương thức thanh toán: {order.payment_method === 1?"Thanh toán khi nhận hàng":"Chuyển khoản"}</Text>
                        <Divider style={styles.divider} />
                        {/* Xem chi tiết đơn hàng */}
                        <TouchableOpacity onPress={() => loadOrderDetail(order.id)} style={styles.button}>
                            <Text style={styles.buttonText}>Xem chi tiết đơn hàng ....</Text>
                        </TouchableOpacity>

                        <Divider style={styles.divider} />

                        

                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalPrice}>{formatCurrency(order.total_price)}</Text>
                        </View>
                    </Card.Content>
                </Card>
            ))}
            <OrderDetail orderDetail={orderDetail} show={showOrderDetail} setShow={setShowOrderDetail} setOrderDetail={setOrderDetail} loadDetail={loadDetail}/>
        </ScrollView>
    );
};

export default OrderItem;