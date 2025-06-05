import { ActivityIndicator, FlatList, Image, Text, View, TouchableOpacity } from "react-native";
import { authAPI, endpoints } from "../../configs/Apis";
import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Context";
import Styles from "./Styles";
import SellerItem from "./SellerItem";


const ListSeller = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useContext(MyUserContext);
    const [seller, setSeller] = useState([]);
    const [page, setPage] = useState(1);
    const [verificationFilter, setVerificationFilter] = useState('all'); // 'all', 'verified', 'unverified'
    const [hasMore, setHasMore] = useState(true);

    const loadSeller = async () => {
        if (!hasMore || loading || page <= 0) return;
    
        try {
            setLoading(true);
            let apiUrl = `${endpoints['users']}?role=seller&page=${page}`;
            if (verificationFilter === 'verified') {
                apiUrl += '&is_verified_seller=true';
            } else if (verificationFilter === 'unverified') {
                apiUrl += '&is_verified_seller=false';
            }
    
            const res = await authAPI(user.token).get(apiUrl);
            const newSellers = res.data.results || [];
    
            setSeller((prev) => [
                ...prev,
                ...newSellers.filter(p => !prev.some(prevItem => prevItem.username === p.username))
            ]);
    
            // Kiểm tra còn trang sau không
            if (res.data.next === null || newSellers.length === 0) {
                setHasMore(false);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                console.warn("Trang không tồn tại hoặc không còn dữ liệu.");
                setHasMore(false);
            } else {
                console.error("Lỗi khi tải người bán:", err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMoreSeller = () => {
        if (!loading && page > 0){
            setPage(page + 1);
        }
    }

    const handleFilterChange = (filterValue) => {
        setVerificationFilter(filterValue);
        setSeller([]);
        setPage(1);
        setHasMore(true); // Reset lại để cho phép tải tiếp trang
    };

    // Thêm hàm xử lý xóa seller khỏi danh sách
    const handleRemoveSeller = (username) => {
        setSeller(prevSellers => prevSellers.filter(seller => seller.username !== username));
    };

    useEffect(() => {
        loadSeller();
    }, [page, verificationFilter]);

    const getFilterButtonStyle = (filterValue) => ({
        backgroundColor: verificationFilter === filterValue ? '#4CAF50' : '#9E9E9E',
        padding: 8,
        borderRadius: 5,
        marginHorizontal: 5
    });

    return (
        <View style={{flex: 1}}>
            <View style={{backgroundColor: "lightgray", padding: 10}}>
                <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10}}>
                    Danh sách người bán
                </Text>
                <View style={{flexDirection: "row", justifyContent: "center", marginBottom: 5}}>
                    <TouchableOpacity 
                        onPress={() => handleFilterChange('all')}
                        style={getFilterButtonStyle('all')}
                    >
                        <Text style={{color: "white"}}>Tất cả</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleFilterChange('verified')}
                        style={getFilterButtonStyle('verified')}
                    >
                        <Text style={{color: "white"}}>Đã xác nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => handleFilterChange('unverified')}
                        style={getFilterButtonStyle('unverified')}
                    >
                        <Text style={{color: "white"}}>Chưa xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                onEndReached={loadMoreSeller}
                onEndReachedThreshold={0.5}
                data={seller}
                renderItem={({item}) => (
                    <SellerItem 
                        item={item} 
                        statusSeller={verificationFilter} 
                        resetList={() => handleRemoveSeller(item.username)}
                    />
                )}
                ListFooterComponent={loading && <ActivityIndicator size={35} style={{ margin: 10 }} />}
                keyExtractor={(item) => item.username}
                contentContainerStyle={{ paddingBottom: 60 }}
            />
        </View>
    );
};

export default ListSeller;