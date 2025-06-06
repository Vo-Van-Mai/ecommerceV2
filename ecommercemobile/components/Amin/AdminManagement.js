import React, { useContext } from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { MyShopContext } from "../../configs/ShopContext";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from '../../configs/Context';

const AdminManagement = () => {
  const navigation = useNavigation();
  const shop = useContext(MyShopContext);
  const user = useContext(MyUserContext);
  const menuItems = [
    {
      id: 1,
      title: 'Sản phẩm',
      icon: 'box',
      color: '#4CAF50',
      screen: 'ShopProduct',
      description: 'Quản lý danh sách sản phẩm'
    },
    {
      id: 2,
      title: 'Thêm nhân viên',
      icon: 'plus-circle',
      color: '#2196F3',
      screen: 'CreateStaff',
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
    {
        id: 7,
        title: 'Quản lý cửa hàng',
        icon: 'store',
        color: '#607D8B',
        screen: 'ShopManagement',
        description: 'Quản lý cửa hàng'
    },
    {
        id: 8,
        title: 'Quản lý người dùng',
        icon: 'users',
        color: '#607D8B',
        screen: 'UserManagement',
        description: 'Quản lý người dùng'
    },
  ];

  const handleNavigation = (screen) => {
    navigation.navigate("Quản lý hệ thống", { 
      screen: screen,   
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tiện ích Admin</Text>
        <Text style={styles.shopName}>{user?.username || 'Admin'}</Text>
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

export default AdminManagement; 