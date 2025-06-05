import { Text, View, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { MyOrderContext, MySetOrderContext } from "../../configs/OrderContext";
import { useContext, useState, useEffect } from "react";
import { Card, Divider, Badge } from "react-native-paper";
import styles from "./Styles";
import { formatCurrency } from "../../utils/PriceUtils";
import { MyUserContext } from "../../configs/Context";
import OrderDetail from "./OrderDetail";
import { authAPI, endpoints } from "../../configs/Apis";

const HistoryOrder = () => {
    const order = useContext(MyOrderContext);
    const setOrder = useContext(MySetOrderContext);
    const user = useContext(MyUserContext);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false);
    const [orderDetail, setOrderDetail] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const loadOrderAllPages = async () => {
        try {
            let url = null;
    
            if (user.role === "buyer") {
                url = endpoints['orderOfBuyer'];
            } else if (user.role === "seller") {
                url = endpoints['orderOfShop'];
            }
    
            if (!url) return;
    
            const allOrders = [];
            let nextUrl = url;
    
            while (nextUrl) {
                const res = await authAPI(user.token).get(nextUrl);
                const data = res.data;
    
                allOrders.push(...(data.results || []));
                nextUrl = data.next;
            }
    
            setOrder({
                type: "set_order",
                payload: {
                    count: allOrders.length,
                    results: allOrders,
                    next: null,
                    previous: null
                }
            });
    
        } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        setIsLoading(true);
        loadOrderAllPages();
    }, []);
    
    const filteredOrders = order.orders.results.filter((o) =>
        o.id.toString().includes(searchQuery.trim())
    );
    
    
    const loadOrderDetail = async(orderId) => {
        if(showOrderDetail){
            setShowOrderDetail(false);
        }else{
            setShowOrderDetail(true);
            try {
                setLoadDetail(true);
                let url = endpoints["orderDetail"](orderId);
                let resOrderDetail = await authAPI(user.token).get(url);
                if(resOrderDetail.status === 200){
                    setOrderDetail(resOrderDetail.data);
                }
            } catch (error) {
                console.log("error:", error);
            }finally{
                setLoadDetail(false);
            }
        }
    }

    const renderOrderItem = ({item, index}) => (
        <Card key={item.id} style={[styles.border, { marginBottom: 15 }]}>
            <Card.Content>
                <View style={styles.headerContainer}>
                    <Text style={styles.orderCode}>Đơn hàng #{item.id}</Text>
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

                <Divider style={styles.divider} />

                {user.role === "seller" && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Người đặt:</Text>
                        <Text style={styles.value}>{item.user.username}</Text>
                    </View>
                )}
                
                {user.role === "buyer" && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Cửa hàng:</Text>
                        <Text style={styles.value}>{item.shop.name}</Text>
                    </View>
                )}

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Ngày đặt:</Text>
                    <Text style={styles.value}>{formatDate(item.created_date)}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Địa chỉ:</Text>
                    <Text style={styles.value}>{item.address ?? user.address ?? "Chưa cập nhật"}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Số điện thoại:</Text>
                    <Text style={styles.value}>{user.phone}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <Text style={{color: item.status === 1 ? "orange" : item.status === 2 ? "green" : item.status === 3 ? "red" : item.status === 4 ? "blue" : item.status === 5 ? "red" : item.status === 6 ? "green" : "orange", fontWeight: "bold", fontSize: 16}  }>{item.status === 1 ? "Chờ xác nhận" : item.status === 2 ? "Đã xác nhận" : item.status === 3 ? "Đã hủy" 
                    : item.status === 4 ? "Đang được giao" : item.status === 5 ? "Hủy do thanh toán thất bại" : item.status === 6 ? "Đã nhận" : "Đang chờ xác nhận"}</Text>
                </View>

                <Divider style={styles.divider} />

                {item.order_details?.map((detail) => (
                    <View key={detail.id} style={styles.productItem}>
                        <Text style={styles.productName}>{detail.product.name}</Text>
                        <View style={styles.productDetails}>
                            <Text style={styles.quantity}>x{detail.quantity}</Text>
                            <Text style={styles.price}>{formatCurrency(detail.unit_price)}</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.status}>
                    Phương thức thanh toán: {item.payment_method === 1 ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}
                </Text>

                <Divider style={styles.divider} />

                <TouchableOpacity onPress={() => loadOrderDetail(item.id)} style={styles.button}>
                    <Text style={styles.buttonText}>Xem chi tiết đơn hàng ....</Text>
                </TouchableOpacity>

                <Divider style={styles.divider} />

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalPrice}>{formatCurrency(item.total_price)}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
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

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Đang tải dữ liệu...</Text>
                </View>
            ) : filteredOrders.length === 0 ? (
                <Text style={styles.title}>Không có đơn hàng nào</Text>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <OrderDetail 
                orderDetail={orderDetail} 
                show={showOrderDetail} 
                setShow={setShowOrderDetail} 
                setOrderDetail={setOrderDetail} 
                loadDetail={loadDetail}
            />
        </View>
    );
};

export default HistoryOrder;