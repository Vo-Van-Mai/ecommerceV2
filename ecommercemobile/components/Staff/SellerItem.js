import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { authAPI, endpoints } from "../../configs/Apis";
import { useContext, useState } from "react";
import { MyUserContext } from "../../configs/Context";


const SellerItem = ({item, statusSeller, resetList}) => {
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(false);
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

    const handleVerifySeller = async (userId) => {
        try {
           setLoading(true);
           const url = endpoints['verifySeller'](userId);
           console.log("Url:" , url);
           const res = await authAPI(user.token).patch(url);
           console.log("Res:" , res.data);
           if(res.status === 200){
            Alert.alert("Thành công", "Đã xác thực người bán",[
                {
                    text: "OK",
                    onPress: () => {
                        console.log("OK");
                        if (resetList) {
                            resetList();
                        }
                    }
                }
            ]);
           }
           else{
            Alert.alert("Thất bại", "Không thể xác thực người bán",[
                {
                    text: "OK",
                    onPress: () => {
                        console.log("OK");
                    }
                }
            ]);
           }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xác thực người bán");
        }
        finally{
            setLoading(false);
        }
    };

    
    const handleCancelVerification = async (userId) => {
        try {
            setLoading(true);
            const url = endpoints['cancelSeller'](userId);
            console.log("Url:" , url);
            const res = await authAPI(user.token).patch(url);
            console.log("Res:" , res.data);
            if(res.status === 200){
                Alert.alert("Thành công", "Đã hủy xác thực người bán",[
                    {
                        text: "OK",
                        onPress: () => {
                            console.log("OK");
                            if (resetList) {
                                resetList();
                            }
                        }
                    }
                ]);
            }
            else{
                Alert.alert("Thất bại", "Không thể hủy xác thực người bán",[
                    {
                        text: "OK",
                        onPress: () => {
                            console.log("OK");
                        }
                    }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi hủy xác thực người bán");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <View style={[Styles.border, {
            backgroundColor: '#fff',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            marginHorizontal: 10,
            marginVertical: 6,
            padding: 12,
            borderRadius: 12,
            borderWidth: 0
        }]}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
            }}>
                <View style={{
                    width: 100,
                    marginRight: 15,
                }}>
                    <Image 
                        source={{uri: item.avatar}} 
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: '#e1e1e1'
                        }}
                    />
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        textAlign: "center",
                        marginTop: 8,
                        color: '#2c3e50'
                    }}>{item.username}</Text>
                </View>

                <View style={{flex: 1}}>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Họ và tên: </Text>
                        {item.last_name} {item.first_name}
                    </Text>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Liên hệ: </Text>
                        {item.phone}
                    </Text>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Email: </Text>
                        {item.email}
                    </Text>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Ngày tạo: </Text>
                        {formatDate(item.created_date)}
                    </Text>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Cập nhật: </Text>
                        {formatDate(item.updated_date)}
                    </Text>

                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: '#e1e1e1'
                    }}>
                        <View style={{
                            backgroundColor: item.is_verified_seller ? '#e8f5e9' : '#ffebee',
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            borderRadius: 20,
                        }}>
                            <Text style={{
                                color: item.is_verified_seller ? '#2e7d32' : '#c62828',
                                fontWeight: '600',
                                fontSize: 13
                            }}>
                                {item.is_verified_seller ? "Đã xác thực" : "Chưa xác thực"}
                            </Text>
                        </View>

                        {statusSeller === "all" ? (
                            <View>
                                <Text>Chọn trạng thái</Text>
                            </View>
                        ):(
                            statusSeller === "unverified" ? (
                                // Xác nhận người dùng
                                <TouchableOpacity 
                                    onPress={() => handleVerifySeller(item.id)} 
                                    style={{
                                        backgroundColor: loading ? '#9e9e9e' : '#4CAF50',
                                        paddingVertical: 8,
                                        paddingHorizontal: 20,
                                        borderRadius: 20,
                                        elevation: 2,
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={{
                                        color: "white",
                                        fontWeight: '600',
                                        fontSize: 14
                                    }}>
                                        {loading ? "Đang xử lý..." : "Xác nhận"}
                                    </Text>
                                </TouchableOpacity>
                            ):(
                                // Hủy quyền người dùng
                                <TouchableOpacity 
                                    onPress={() => handleCancelVerification(item.id)} 
                                    style={{
                                        backgroundColor: loading ? '#9e9e9e' : '#ffebee',
                                        paddingVertical: 8,
                                        paddingHorizontal: 20,
                                        borderRadius: 20,
                                        elevation: 2,
                                    }}
                                    disabled={loading}
                                >
                                    <Text style={{
                                        color: "#c62828",
                                        fontWeight: '600',
                                        fontSize: 14
                                    }}>
                                        {loading ? "Đang xử lý..." : "Hủy quyền"}
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}

                        
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = {
    infoText: {
        fontSize: 14,
        color: '#2c3e50',
        marginBottom: 6,
    },
    label: {
        fontWeight: '600',
        color: '#34495e',
    }
};

export default SellerItem;