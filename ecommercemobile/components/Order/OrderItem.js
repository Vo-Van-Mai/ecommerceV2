import { Text, View, ScrollView, TouchableOpacity, Touchable, Alert, TextInput } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

import { MyOrderContext, MySetOrderContext } from "../../configs/OrderContext";
import { useContext, useState, useEffect } from "react";
import { Card, Divider, Badge } from "react-native-paper";
import styles from "./Styles";
import { formatCurrency } from "../../utils/PriceUtils";
import { MyUserContext } from "../../configs/Context";
import OrderDetail from "./OrderDetail";
import { authAPI, endpoints } from "../../configs/Apis";
import Styles from "./Styles";

const OrderItem = ({status}) => {
    // console.log("status:", status);
    // console.log(typeof status, status)
    
    const {orders, loading, error} = useContext(MyOrderContext);
    const setOrders = useContext(MySetOrderContext);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false);
    const user = useContext(MyUserContext);
    const [confirmOrder, setConfirmOrder] = useState({});
    const [orderDetail, setOrderDetail] = useState([]);
    console.log("order:", orders);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [confirmOrderShipping, setConfirmOrderShipping] = useState({});
    const [confirmReceived, setConfirmReceived] = useState({});
    const [loadingConfirmReceived, setLoadingConfirmReceived] = useState(false);

    
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
                console.log("orderId:", orderId);
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
                    console.log("error.response.status:", orderId);
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
            console.log("Gọi API hủy đơn hàng với orderId:", orderId);
            
            const res = await authAPI(user.token).patch(
                endpoints['cancelOrder'](orderId)  // Sửa lại tên endpoint thành 'cancelOrder'
            );
            
            console.log("Response hủy đơn hàng:", res.data);
            
            if(res.status === 200){
                setOrders({
                    type: "cancel_order", 
                    payload: res.data
                });
                Alert.alert("Thành công", "Đơn hàng đã được hủy thành công");
                // Tải lại danh sách đơn hàng
                loadOrders(1);
            }
        } catch (error) {
            console.error("Lỗi hủy đơn hàng:", error);
            console.error("Response error:", error.response?.data);
            Alert.alert(
                "Lỗi",
                error.response?.data?.message || "Không thể hủy đơn hàng"
            );
        } finally {
            setLoadDetail(false);
        }
    };
    
    const handleRemoveOrder = async(orderId) => {
        Alert.alert(
            "Xác nhận hủy đơn",
            "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            [
                {
                    text: "Không",
                    style: "cancel"
                },
                {
                    text: "Có",
                    onPress: () => cancelOrder(orderId)
                }
            ]
        );
    };

    const handleVerifyOrder = async(orderId, status) => {
        try {
            setLoadDetail(true);
            if(status === 1){
                setConfirmOrder(prev => ({ ...prev, [orderId]: true }));
                let resVerifyOrder = await authAPI(user.token).patch(endpoints["orderVerify"](orderId));

                // Đợi thêm 2s để tạo hiệu ứng
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("response thông tin đơn hàng:", resVerifyOrder.data);
                if(resVerifyOrder.status === 200){
                    
                    setOrders({type: "confirm_order", payload: resVerifyOrder.data});
                    Alert.alert("Thành công", "Đơn hàng đã được xác nhận");
                    loadOrders(1);
                }}
            else if(status === 2){
                setConfirmOrderShipping(prev => ({ ...prev, [orderId]: true }));
                let resVerifyOrderShipping = await authAPI(user.token).patch(endpoints["orderVrifyShipping"](orderId));
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("response thông tin đơn hàng:", resVerifyOrderShipping.data);
                if(resVerifyOrderShipping.status === 200){
                    setOrders({type: "confirm_order_shipping", payload: resVerifyOrderShipping.data});
                    Alert.alert("Thành công", "Đơn hàng đã được xác nhận");
                    loadOrders(1);
                }
            }   
        } catch (error) {
            console.log("error:", error);
        }finally{
            setLoadDetail(false);
            if(status === 1){
                setConfirmOrder(prev => ({ ...prev, [orderId]: false }));
            }else if(status === 2){ 
                setConfirmOrderShipping(prev => ({ ...prev, [orderId]: false }));
            }
        }
    }

   

    const loadOrders = async (pageNum = 1) => {
        try {
            const endpoint = user.role === "buyer" ? endpoints['orderOfBuyer'] : endpoints['orderOfShop'];
            const res = await authAPI(user.token).get(endpoint, {
                params: {
                    status: status,
                    page: pageNum
                }
            });
            
            if (res.status === 200) {
                if (pageNum === 1) {
                    setOrders({
                        type: "set_order",
                        payload: res.data
                    });
                } else {
                    // Nếu là trang tiếp theo, thêm vào danh sách hiện tại
                    setOrders({
                        type: "add_more_order",
                        payload: res.data
                    });
                }
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleConfirmReceived = async (orderId) => {
        try {
            setLoadingConfirmReceived(true);
            // Gọi API xác nhận đã nhận hàng
            const res = await authAPI(user.token).patch(endpoints['confirm-received'](orderId));
            
            if (res.status === 200) {
                // Cập nhật state local
                setConfirmReceived(prev => ({
                    ...prev,
                    [orderId]: true
                }));
                // Hiển thị thông báo thành công
                Alert.alert(
                    "Thành công",
                    "Xác nhận đã nhận hàng thành công!",
                    [{ text: "OK" }]
                );
                // Cập nhật lại danh sách đơn hàng nếu cần
                if (onReload) {
                    onReload();
                }
            }
        } catch (error) {
            console.error("Lỗi khi xác nhận đã nhận hàng:", error);
            Alert.alert(
                "Lỗi",
                "Không thể xác nhận đã nhận hàng. Vui lòng thử lại sau.",
                [{ text: "OK" }]
            );
        } finally {
            setLoadingConfirmReceived(false);
        }
    };

    

    useEffect(() => {
        setPage(1);
        loadOrders(1);
    }, [status]);

    useEffect(() => {
        if (page > 1) {
            setIsLoadingMore(true);
            loadOrders(page);
        }
    }, [page]);

    const filteredOrders = (orders?.results || []).filter(order => 
        searchQuery ? String(order.id).includes(searchQuery) : true
    );

    if (loading && page === 1) return <Text style={styles.title}>Đang tải đơn hàng...</Text>;
    if (error) return <Text style={styles.title}>Có lỗi xảy ra: {error}</Text>;
    return (
        <ScrollView style={styles.container}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                paddingHorizontal: 10
            }}>
                <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={{padding: 5}}>
                    <Icon name="search" size={24} color="#666" />
                </TouchableOpacity>
                {showSearch && (
                    <TextInput
                        style={{
                            flex: 1,
                            marginLeft: 10,
                            height: 40,
                            borderWidth: 1,
                            borderColor: '#ddd',
                            borderRadius: 20,
                            paddingHorizontal: 15,
                            backgroundColor: '#fff'
                        }}
                        placeholder="Nhập mã đơn hàng..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        keyboardType="numeric"
                    />
                )}
            </View>
            {filteredOrders.length === 0 && <Text style={styles.title}>Không tìm thấy đơn hàng</Text>}
            {filteredOrders.map((order, index) => (
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

                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        {user.role==="seller" && <View style={styles.infoContainer}>
                            <Text style={styles.label}>Người đặt:</Text>
                            <Text style={styles.value}>{order.user.username}</Text>
                        </View>}
                        
                        {user.role==="buyer" && <View style={styles.infoContainer}>
                            <Text style={styles.label}>Cửa hàng:</Text>
                            <Text style={styles.value}>{order.shop.name}</Text>
                        </View>}

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Ngày đặt:</Text>
                            <Text style={styles.value}>{formatDate(order.created_date)}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Địa chỉ:</Text>
                            <Text style={styles.value}>{order.address ?? user.address ?? "Chưa cập nhật"}</Text>
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
                            {user.role === "seller" && status==="1" && <TouchableOpacity 
                            //Xác nhận đơn hàng
                                    onPress={() => handleVerifyOrder(order.id, 1)} 
                                    style={{
                                        backgroundColor: confirmOrder[order.id] ? '#9e9e9e' : '#4CAF50',
                                        paddingVertical: 8,
                                        paddingHorizontal: 20,
                                        borderRadius: 20,
                                        elevation: 2,
                                    }}
                                    disabled={confirmOrder[order.id]}
                                >
                                    <Text style={Styles.textConfirmOrder}>
                                        {confirmOrder[order.id] ? "Đang xử lý..." : "Chốt đơn"}
                                    </Text>
                                </TouchableOpacity>}

                                {user.role === "seller" && status==="2" && <TouchableOpacity 
                                    //Xác nhận đã lấy hàng
                                    onPress={() => Alert.alert("Xác nhận", "Bạn xác nhận đã lấy hàng?", [
                                        {text: "Hủy", style: "cancel"},
                                        {text: "Xác nhận", onPress: () => {
                                            handleVerifyOrder(order.id, 2);
                                        }}
                                    ])} 
                                    style={[
                                        {backgroundColor: confirmOrderShipping[order.id] ? '#9e9e9e' : '#4CAF50'}, 
                                        Styles.confirmOrder
                                    ]}
                                    disabled={confirmOrderShipping[order.id]}
                                >
                                    <Text style={Styles.textConfirmOrder}>
                                        {confirmOrder[order.id] ? "Đang xử lý..." : "Đã lấy hàng"}
                                    </Text>
                                </TouchableOpacity>}
                                
                            {user.role==="buyer" && status==="1" && 
                                // Hủy đơn hàng
                                <TouchableOpacity 
                                onPress={() => handleRemoveOrder(order.id)} 
                                style={{
                                    backgroundColor: confirmOrder[order.id] ? '#9e9e9e' : '#ffebee',
                                    paddingVertical: 8,
                                    paddingHorizontal: 20,
                                    borderRadius: 20,
                                    elevation: 2,
                                }}
                                disabled={confirmOrder[order.id]}
                            >
                                <Text style={
                                    styles.textCancelOrder
                                }>
                                    {loading ? "Đang xử lý..." : "Hủy đơn"}
                                </Text>
                            </TouchableOpacity>}

                            {user.role === "buyer" && status === "4" && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        Alert.alert(
                                            "Xác nhận đã nhận hàng",
                                            "Bạn có chắc chắn đã nhận được hàng không?",
                                            [
                                                {
                                                    text: "Hủy",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Xác nhận",
                                                    onPress: () => handleConfirmReceived(order.id)
                                                }
                                            ]
                                        );
                                    }}
                                    style={{
                                        backgroundColor: confirmReceived[order.id] ? '#9e9e9e' : '#4CAF50',
                                        paddingVertical: 8,
                                        paddingHorizontal: 20,
                                        borderRadius: 20,
                                        elevation: 2,
                                        marginVertical: 5,
                                    }}
                                    disabled={confirmReceived[order.id] || loading}
                                >
                                    <Text style={{
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: '500',
                                        textAlign: 'center'
                                    }}>
                                        {loading ? "Đang xử lý..." : 
                                        confirmReceived[order.id] ? "Đã xác nhận" : "Đã nhận hàng"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card.Content>
                </Card>
            ))}
            {orders?.next && (
                <TouchableOpacity 
                    onPress={() => setPage(prev => prev + 1)}
                    style={{
                        padding: 10,
                        backgroundColor: '#f0f0f0',
                        alignItems: 'center',
                        marginTop: 10,
                        marginBottom: 20,
                        borderRadius: 5
                    }}
                    disabled={isLoadingMore}
                >
                    <Text>{isLoadingMore ? "Đang tải..." : "Xem thêm"}</Text>
                </TouchableOpacity>
            )}
            <OrderDetail orderDetail={orderDetail} show={showOrderDetail} setShow={setShowOrderDetail} setOrderDetail={setOrderDetail} loadDetail={loadDetail}/>
        </ScrollView>
    );
};

export default OrderItem;