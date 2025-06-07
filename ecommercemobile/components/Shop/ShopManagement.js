import React, { useContext } from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MyShopContext } from "../../configs/ShopContext";
import { useNavigation } from "@react-navigation/native";

const ShopManagement = () => {
  const shop = useContext(MyShopContext);
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 1,
      title: 'Sản phẩm',
      icon: 'box',
      color: '#4CAF50',
      screen: 'ShopProduct',
      params: { shopId: shop?.shop?.id },
      description: 'Quản lý danh sách sản phẩm'
    },
    {
      id: 2,
      title: 'Thêm sản phẩm',
      icon: 'plus-circle',
      color: '#2196F3',
      screen: 'AddProduct',
      description: 'Thêm sản phẩm mới'
    },
    {
      id: 3,
      title: 'Đơn hàng',
      icon: 'shopping-bag',
      color: '#FF9800',
      screen: 'Orders',
      description: 'Quản lý đơn hàng'
    },
    {
      id: 4,
      title: 'Thống kê',
      icon: 'chart-bar',
      color: '#9C27B0',
      screen: 'Statistics',
      params: { shopId: shop?.shop?.id },
      description: 'Thống kê doanh thu'
    },
    {
      id: 5,
      title: 'Khuyến mãi',
      icon: 'percentage',
      color: '#E91E63',
      screen: 'Promotions',
      description: 'Quản lý khuyến mãi'
    },
    {
      id: 6,
      title: 'Cài đặt',
      icon: 'cog',
      color: '#607D8B',
      screen: 'ShopSettings',
      description: 'Thiết lập cửa hàng'
    },
  ];

  const handleNavigation = (screen) => {
    navigation.navigate("Quản lý cửa hàng", { 
      screen: screen, 
      params: { shopId: shop?.shop?.id } 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý cửa hàng</Text>
        <Text style={styles.shopName}>{shop?.shop?.name || 'Tên cửa hàng'}</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="#FFF" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  shopName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ShopManagement; 